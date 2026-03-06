import { apiClient } from './api-client';

export interface ProductSize {
  id: string;
  productId: string;
  label: string;
  widthCm: number;
  heightCm: number;
  priceDelta: number;
}

export interface FrameOption {
  id: string;
  label: string;
  priceDelta: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  sizes: ProductSize[];
  frameOptions: FrameOption[];
}

export interface ProductList {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface Template {
  id: string;
  templateKey: string;
  name: string;
  category: string;
  thumbnail_url?: string;
  definition: Record<string, any>;
  isActive: boolean;
  createdAt: string;
}

export const productsApi = {
  // Fetch all products
  getProducts: async (): Promise<ProductList[]> => {
    const response = await apiClient.get('/products');
    return response.data;
  },

  // Fetch single product with sizes and frames
  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Fetch all design templates
  getTemplates: async (): Promise<Template[]> => {
    const response = await apiClient.get('/products/templates/all');
    return response.data;
  },
};
