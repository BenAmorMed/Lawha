import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ImagesService, IFile } from './images.service';
import { ImageResponseDto, ImageListDto, ImageMetadataDto } from './images.dto';

@Controller('api/v1/images')
@UseGuards(JwtAuthGuard)
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(
    @UploadedFile() file: IFile,
    @CurrentUser() user: User,
    @Query('dpi') dpi?: string,
  ): Promise<ImageResponseDto> {
    const dpiValue = dpi ? parseInt(dpi, 10) : 300;
    return this.imagesService.uploadImage(file, user.id, dpiValue);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyImages(@CurrentUser() user: User): Promise<ImageListDto[]> {
    return this.imagesService.getUserImages(user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getImageMetadata(
    @Param('id') imageId: string,
  ): Promise<ImageMetadataDto> {
    return this.imagesService.getImageMetadata(imageId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteImage(
    @Param('id') imageId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.imagesService.deleteImage(imageId, user.id);
  }
}
