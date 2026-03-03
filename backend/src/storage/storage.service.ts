import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinIOClient } from 'minio';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private minioClient: MinIOClient;
  private logger = new Logger('StorageService');

  constructor(private configService: ConfigService) {
    this.initializeMinIO();
  }

  private initializeMinIO() {
    const endpoint = this.configService.get('MINIO_ENDPOINT', 'minio');
    const port = parseInt(this.configService.get('MINIO_PORT', '9000'), 10);
    const useSSL = this.configService.get('MINIO_USE_SSL', 'false') === 'true';
    const accessKey = this.configService.get('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get('MINIO_SECRET_KEY', 'minioadmin123');

    this.minioClient = new MinIOClient({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    this.logger.log('MinIO client initialized');
  }

  /**
   * Upload a file to MinIO
   * @param bucketName Bucket name
   * @param fileName File path/name
   * @param fileContent File buffer or stream
   * @param mimeType MIME type
   * @returns Public URL of the uploaded file
   */
  async uploadFile(
    bucketName: string,
    fileName: string,
    fileContent: Buffer | Readable,
    mimeType: string,
  ): Promise<string> {
    try {
      // Ensure bucket exists
      const bucketExists = await this.minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(bucketName, '');
        this.logger.log(`Created bucket: ${bucketName}`);
      }

      // Upload file
      const size = Buffer.isBuffer(fileContent) ? fileContent.length : undefined;
      const stream = Buffer.isBuffer(fileContent) ? Readable.from(fileContent) : fileContent;

      await this.minioClient.putObject(
        bucketName,
        fileName,
        stream,
        size,
        {
          'Content-Type': mimeType,
        },
      );

      this.logger.log(`File uploaded successfully: ${fileName}`);

      // Return public URL
      return `${bucketName}/${fileName}`;
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Download a file from MinIO
   * @param bucketName Bucket name
   * @param fileName File name
   * @returns File buffer
   */
  async downloadFile(bucketName: string, fileName: string): Promise<Buffer> {
    try {
      const dataStream = await this.minioClient.getObject(bucketName, fileName);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        dataStream.on('data', (chunk) => chunks.push(chunk));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`File download failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a file from MinIO
   * @param bucketName Bucket name
   * @param fileName File name
   */
  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucketName, fileName);
      this.logger.log(`File deleted: ${fileName}`);
    } catch (error) {
      this.logger.error(`File deletion failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if file exists
   * @param bucketName Bucket name
   * @param fileName File name
   */
  async fileExists(bucketName: string, fileName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucketName, fileName);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get MinIO client for advanced operations
   */
  getMinIOClient(): MinIOClient {
    return this.minioClient;
  }
}
