export class UploadImageDto {
  original_filename: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
  dpi: number;
}

export class ImageResponseDto {
  id: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
  dpi: number;
  s3_url: string;
  s3_thumbnail_url: string;
  created_at: Date;
}

export class ImageListDto {
  id: string;
  original_filename: string;
  width: number;
  height: number;
  dpi: number;
  s3_thumbnail_url: string;
  file_size: number;
  created_at: Date;
}

export class ImageMetadataDto {
  id: string;
  original_filename: string;
  dimensions: {
    width: number;
    height: number;
  };
  dpi: number;
  file_size: number;
  mime_type: string;
  is_printable: boolean;
  print_quality: string; // 'excellent', 'good', 'acceptable', 'low'
  recommendations: string[];
}
