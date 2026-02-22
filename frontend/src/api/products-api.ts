import { apiClient } from './api-client';

export interface ProductSize {
  id: string;
  product_id: string;
  name: string;
  dimensions: string;
  price_modifier: number;
}

export interface FrameOption {
  id: string;
  name: string;
  description: string;
  price_modifier: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  sizes: ProductSize[];
  frame_options: FrameOption[];
}

export interface ProductList {
  id: string;
  name: string;
  category: string;
  base_price: number;
  image_url: string;
  is_active: boolean;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_url: string;
  definition: Record<string, any>;
  created_at: string;
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
