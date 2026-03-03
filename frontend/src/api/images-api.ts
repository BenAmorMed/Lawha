import { apiClient } from './api-client';

export interface ImageMetadata {
  width: number;
  height: number;
  dpi: number;
}

export interface ImageResponse {
  id: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
  dpi: number;
  s3_url: string;
  s3_thumbnail_url: string;
  created_at: string;
}

export interface ImageList {
  id: string;
  original_filename: string;
  width: number;
  height: number;
  dpi: number;
  s3_thumbnail_url: string;
  file_size: number;
  created_at: string;
}

export interface ImageMetadataInfo {
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
  print_quality: 'excellent' | 'good' | 'acceptable' | 'low';
  recommendations: string[];
}

export const imagesApi = {
  // Upload image with DPI
  uploadImage: async (
    file: File,
    dpi: number = 300,
  ): Promise<ImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/images/upload?dpi=${dpi}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Get user's uploaded images
  getMyImages: async (): Promise<ImageList[]> => {
    const response = await apiClient.get('/images');
    return response.data;
  },

  // Get image metadata and print quality info
  getImageMetadata: async (imageId: string): Promise<ImageMetadataInfo> => {
    const response = await apiClient.get(`/images/${imageId}`);
    return response.data;
  },

  // Delete image
  deleteImage: async (imageId: string): Promise<void> => {
    await apiClient.delete(`/images/${imageId}`);
  },
};
