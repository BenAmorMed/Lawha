import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UploadedImage } from './image.entity';
import { ImageResponseDto, ImageListDto, ImageMetadataDto } from './images.dto';
import { QualityReport } from './interfaces/quality-report.interface';
import { computeDpiReport } from './dpi.helper';
import sharp from 'sharp';
import { Client as MinIOClient } from 'minio';

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

  /**
   * Calcule la qualité DPI via le helper pur `computeDpiReport`.
   */
  async checkDpi(
    widthPx: number,
    heightPx: number,
    printWidthCm: number,
    printHeightCm: number,
    dpiTarget: number = 300,
  ): Promise<QualityReport> {
    return computeDpiReport(widthPx, heightPx, printWidthCm, printHeightCm, dpiTarget);
  }

  async uploadImage(
    file: IFile,
    userId: string,
    printWidthCm: number = 30,
    printHeightCm: number = 40,
    dpiTarget: number = 300,
  ): Promise<any> {
    this.validateFile(file);

    const metadata = await sharp(file.buffer).metadata();
    const widthPx = metadata.width || 0;
    const heightPx = metadata.height || 0;

    // Validate DPI quality
    const quality = await this.checkDpi(widthPx, heightPx, printWidthCm, printHeightCm, dpiTarget);

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const storedFilename = `${timestamp}-${random}-${file.originalname}`;

    // Create thumbnail
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    // Save to MinIO
    const s3Url = await this.uploadToMinIO(storedFilename, file.buffer, file.mimetype);
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
      width: widthPx,
      height: heightPx,
      dpi: quality.effectiveDpi,
      s3_url: s3Url,
      s3_thumbnail_url: thumbnailUrl,
      dpi_ok: quality.dpiOk,
      quality_score: quality.qualityScore,
      metadata: JSON.stringify({
        colorspace: (metadata as any).colorspace || 'unknown',
        hasAlpha: metadata.hasAlpha,
        effectiveDpi: quality.effectiveDpi,
        status: quality.status,
        uploadedAt: new Date().toISOString(),
      }),
    });

    await this.imageRepository.save(uploadedImage);

    return {
      id: uploadedImage.id,
      originalUrl: uploadedImage.s3_url,
      thumbUrl: uploadedImage.s3_thumbnail_url,
      widthPx: uploadedImage.width,
      heightPx: uploadedImage.height,
      quality,
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

    let printQuality = 'excellent';
    const recommendations: string[] = [];

    if (image.dpi < 180) {
      printQuality = 'low';
      recommendations.push('DPI is below recommended minimum of 180. Print quality will be poor.');
    } else if (image.dpi < 300) {
      printQuality = 'acceptable';
      recommendations.push('For best results, use image with 300+ DPI.');
    }

    if (image.width < 100 || image.height < 100) {
      recommendations.push('Image dimensions are very small.');
    }

    return {
      id: image.id,
      original_filename: image.original_filename,
      dimensions: { width: image.width, height: image.height },
      dpi: image.dpi,
      file_size: image.file_size,
      mime_type: image.mime_type,
      is_printable: image.dpi >= 180,
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

    try {
      const bucketName = this.configService.get('S3_BUCKET', 'canvas-platform');
      await this.minioClient.removeObject(bucketName, image.stored_filename);
      await this.minioClient.removeObject(bucketName, `thumbnails/${image.stored_filename}`);
    } catch (error) {
      console.error('Failed to delete from MinIO:', error);
    }

    image.is_active = false;
    await this.imageRepository.save(image);
  }

  private validateFile(file: IFile): void {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, TIFF');
    }
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 50MB limit');
    }
  }

  private async uploadToMinIO(filename: string, buffer: Buffer, mimetype: string): Promise<string> {
    try {
      const bucketName = this.configService.get('S3_BUCKET', 'canvas-platform');
      const bucketExists = await this.minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1');
      }
      await this.minioClient.putObject(bucketName, filename, buffer, buffer.length, {
        'Content-Type': mimetype,
      });
      const endpoint = this.configService.get('S3_ENDPOINT', 'minio');
      const port = this.configService.get('S3_PORT', '9000');
      const protocol =
        this.configService.get('S3_USE_SSL', 'false') === 'true' ? 'https' : 'http';
      const publicEndpoint = this.configService.get(
        'S3_PUBLIC_ENDPOINT',
        `${protocol}://${endpoint}:${port}`,
      );
      return `${publicEndpoint}/${bucketName}/${filename}`;
    } catch (error) {
      throw new Error(`Failed to upload file to storage: ${error.message}`);
    }
  }
}
