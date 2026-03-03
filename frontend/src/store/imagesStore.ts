import { create } from 'zustand';
import {
  imagesApi,
  ImageResponse,
  ImageList,
  ImageMetadataInfo,
} from '../api/images-api';

interface ImagesStore {
  // State
  myImages: ImageList[];
  uploadedImage: ImageResponse | null;
  selectedImage: ImageMetadataInfo | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
  uploadProgress: number;

  // Actions
  uploadImage: (file: File, dpi?: number) => Promise<ImageResponse>;
  fetchMyImages: () => Promise<void>;
  selectImage: (id: string) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  clearUploadedImage: () => void;
  clearError: () => void;
}

export const useImagesStore = create<ImagesStore>((set) => ({
  // Initial state
  myImages: [],
  uploadedImage: null,
  selectedImage: null,
  loading: false,
  uploading: false,
  error: null,
  uploadProgress: 0,

  // Upload image
  uploadImage: async (file: File, dpi: number = 300) => {
    set({ uploading: true, error: null, uploadProgress: 0 });
    try {
      const response = await imagesApi.uploadImage(file, dpi);
      set({
        uploadedImage: response,
        uploading: false,
        uploadProgress: 100,
      });
      return response;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to upload image',
        uploading: false,
        uploadProgress: 0,
      });
      throw error;
    }
  },

  // Fetch user's images
  fetchMyImages: async () => {
    set({ loading: true, error: null });
    try {
      const images = await imagesApi.getMyImages();
      set({ myImages: images, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch images',
        loading: false,
      });
    }
  },

  // Select image and fetch metadata
  selectImage: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const metadata = await imagesApi.getImageMetadata(id);
      set({ selectedImage: metadata, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch image metadata',
        loading: false,
      });
    }
  },

  // Delete image
  deleteImage: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await imagesApi.deleteImage(id);
      // Remove from myImages list
      set((state) => ({
        myImages: state.myImages.filter((img) => img.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete image',
        loading: false,
      });
    }
  },

  // Clear uploaded image
  clearUploadedImage: () => {
    set({ uploadedImage: null, uploadProgress: 0 });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
