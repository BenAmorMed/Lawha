import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UploadedImage } from './image.entity';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('ImagesService Security', () => {
  let service: ImagesService;

  const mockImageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => defaultValue),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: getRepositoryToken(UploadedImage),
          useValue: mockImageRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
  });

  describe('uploadPreview Security', () => {
    it('should throw BadRequestException for invalid MIME type', async () => {
      const dataUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      await expect(service.uploadPreview(dataUrl)).rejects.toThrow(BadRequestException);
      await expect(service.uploadPreview(dataUrl)).rejects.toThrow('Invalid preview image type');
    });

    it('should throw BadRequestException for oversized buffer', async () => {
      // 14MB of data (base64) -> approx 10.5MB buffer
      const largeData = 'a'.repeat(14 * 1024 * 1024);
      const dataUrl = `data:image/png;base64,${largeData}`;
      await expect(service.uploadPreview(dataUrl)).rejects.toThrow(BadRequestException);
      await expect(service.uploadPreview(dataUrl)).rejects.toThrow('Preview image too large (max 10MB)');
    });
  });

  describe('uploadToMinIO Sanitization', () => {
    it('should not leak error message in InternalServerErrorException', async () => {
      // We need to trigger an error in uploadToMinIO.
      // Since it's private, we'll call uploadPreview which calls it.
      // We'll mock bucketExists to throw.
      (service as any).minioClient.bucketExists = jest.fn().mockRejectedValue(new Error('Secret Internal Details'));

      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

      try {
        await service.uploadPreview(dataUrl);
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toBe('Failed to upload file to storage');
        expect(e.message).not.toContain('Secret Internal Details');
      }
    });
  });
});
