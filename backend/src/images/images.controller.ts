import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ImagesService, IFile } from './images.service';
import { ImageListDto, ImageMetadataDto } from './images.dto';

@Controller('api/v1/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) { }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(
    @UploadedFile() file: IFile,
    @CurrentUser() user: User,
    @Body('printWidthCm') printWidthCm?: string,
    @Body('printHeightCm') printHeightCm?: string,
  ): Promise<any> {
    const widthCm = printWidthCm ? parseFloat(printWidthCm) : 30;
    const heightCm = printHeightCm ? parseFloat(printHeightCm) : 40;
    return this.imagesService.uploadImage(file, user.id, widthCm, heightCm, 300);
  }

  @Post('upload-preview')
  @HttpCode(HttpStatus.CREATED)
  async uploadPreview(
    @Body('dataUrl') dataUrl: string,
  ): Promise<{ previewUrl: string } | null> {
    return this.imagesService.uploadPreview(dataUrl);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getMyImages(@CurrentUser() user: User): Promise<ImageListDto[]> {
    return this.imagesService.getUserImages(user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getImageMetadata(@Param('id') imageId: string): Promise<ImageMetadataDto> {
    return this.imagesService.getImageMetadata(imageId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteImage(@Param('id') imageId: string, @CurrentUser() user: User): Promise<void> {
    return this.imagesService.deleteImage(imageId, user.id);
  }
}
