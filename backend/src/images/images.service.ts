import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UploadedImage } from './image.entity';
import { ImageResponseDto, ImageListDto, ImageMetadataDto } from './images.dto';
import sharp from 'sharp';
import { Client as MinIOClient } from 'minio';
import { Readable } from 'stream';

export interface IFile {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
}

@Injectable()
export class ImagesService {
  private minioClient: MinIOClient;

  constructor(
    @InjectRepository(UploadedImage)
    private readonly imageRepository: Repository<UploadedImage>,
    private readonly configService: ConfigService,
  ) {
    // Initialize MinIO client
    const endpoint = this.configService.get('S3_ENDPOINT', 'minio');
    const port = parseInt(this.configService.get('S3_PORT', '9000'), 10);
    const useSSL = this.configService.get('S3_USE_SSL', 'false') === 'true';
    const accessKey = this.configService.get('S3_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get('S3_SECRET_KEY', 'minioadmin123');

    this.minioClient = new MinIOClient({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async uploadImage(
    file: IFile,
    userId: string,
    dpi: number = 300,
  ): Promise<ImageResponseDto> {
    // Validate file
    this.validateFile(file);

    // Get image metadata
    const metadata = await sharp(file.buffer).metadata();

    // Validate DPI for print quality
    if (dpi < 150) {
      throw new Error('Minimum DPI for printing is 150');
    }

    if (dpi < 300) {
      console.warn('Warning: DPI below 300 may result in lower print quality');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const storedFilename = `${timestamp}-${random}-${file.originalname}`;

    // Create thumbnail
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(200, 200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    // Save to S3 (MinIO)
    const s3Url = await this.uploadToMinIO(
      storedFilename,
      file.buffer,
      file.mimetype,
    );
    const thumbnailUrl = await this.uploadToMinIO(
      `thumbnails/${storedFilename}`,
      thumbnailBuffer,
      'image/jpeg',
    );

    // Save to database
    const uploadedImage = this.imageRepository.create({
      user_id: userId,
      original_filename: file.originalname,
      stored_filename: storedFilename,
      mime_type: file.mimetype,
      file_size: file.size,
      width: metadata.width || 0,
      height: metadata.height || 0,
      dpi,
      s3_url: s3Url,
      s3_thumbnail_url: thumbnailUrl,
      metadata: JSON.stringify({
        colorspace: (metadata as any).colorspace || 'unknown',
        hasAlpha: metadata.hasAlpha,
        density: dpi,
        uploadedAt: new Date().toISOString(),
      }),
    });

    await this.imageRepository.save(uploadedImage);

    return {
      id: uploadedImage.id,
      original_filename: uploadedImage.original_filename,
      mime_type: uploadedImage.mime_type,
      file_size: uploadedImage.file_size,
      width: uploadedImage.width,
      height: uploadedImage.height,
      dpi: uploadedImage.dpi,
      s3_url: uploadedImage.s3_url,
      s3_thumbnail_url: uploadedImage.s3_thumbnail_url,
      created_at: uploadedImage.created_at,
    };
  }

  async getUserImages(userId: string): Promise<ImageListDto[]> {
    const images = await this.imageRepository.find({
      where: { user_id: userId, is_active: true },
      order: { created_at: 'DESC' },
    });

    return images.map((img) => ({
      id: img.id,
      original_filename: img.original_filename,
      width: img.width,
      height: img.height,
      dpi: img.dpi,
      s3_thumbnail_url: img.s3_thumbnail_url,
      file_size: img.file_size,
      created_at: img.created_at,
    }));
  }

  async getImageMetadata(imageId: string): Promise<ImageMetadataDto> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId, is_active: true },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // Determine print quality based on DPI
    let printQuality = 'excellent';
    let recommendations: string[] = [];

    if (image.dpi < 150) {
      printQuality = 'low';
      recommendations.push('DPI is below recommended minimum of 300');
    } else if (image.dpi < 300) {
      printQuality = 'acceptable';
      recommendations.push('For best results, use image with 300 DPI');
    } else if (image.dpi >= 300) {
      printQuality = 'excellent';
    }

    // Check dimensions
    if (image.width < 100 || image.height < 100) {
      recommendations.push('Image dimensions are very small');
    }

    return {
      id: image.id,
      original_filename: image.original_filename,
      dimensions: {
        width: image.width,
        height: image.height,
      },
      dpi: image.dpi,
      file_size: image.file_size,
      mime_type: image.mime_type,
      is_printable: image.dpi >= 150,
      print_quality: printQuality,
      recommendations,
    };
  }

  async deleteImage(imageId: string, userId: string): Promise<void> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId, user_id: userId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    // Delete from MinIO
    try {
      const bucketName = this.configService.get('S3_BUCKET', 'canvas-platform');
      await this.minioClient.removeObject(bucketName, image.stored_filename);
      
      // Also delete thumbnail
      const thumbnailFilename = `thumbnails/${image.stored_filename}`;
      await this.minioClient.removeObject(bucketName, thumbnailFilename);
    } catch (error) {
      console.error('Failed to delete from MinIO:', error);
      // Continue with soft delete even if MinIO deletion fails
    }

    // Soft delete in database
    image.is_active = false;
    await this.imageRepository.save(image);
  }

  private validateFile(file: IFile): void {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error(
        'Invalid file type. Allowed: JPEG, PNG, WebP, TIFF',
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 50MB limit');
    }
  }

  private async uploadToMinIO(
    filename: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    try {
      const bucketName = this.configService.get('S3_BUCKET', 'canvas-platform');

      // Ensure bucket exists
      const bucketExists = await this.minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1');
      }

      // Upload file
      await this.minioClient.putObject(bucketName, filename, buffer, buffer.length, {
        'Content-Type': mimetype,
      });

      // Generate public URL
      const endpoint = this.configService.get('S3_ENDPOINT', 'minio');
      const port = this.configService.get('S3_PORT', '9000');
      const protocol = this.configService.get('S3_USE_SSL', 'false') === 'true' ? 'https' : 'http';
      
      // For local development, use the Docker service name
      const publicEndpoint = this.configService.get('S3_PUBLIC_ENDPOINT', `${protocol}://${endpoint}:${port}`);
      return `${publicEndpoint}/${bucketName}/${filename}`;
    } catch (error) {
      console.error('MinIO upload error:', error);
      throw new Error(`Failed to upload file to storage: ${error.message}`);
    }
  }
}
