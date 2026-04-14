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

export interface ProductBase {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
}

export interface Product extends ProductBase {
  createdAt: string;
  sizes: ProductSize[];
  frameOptions: FrameOption[];
}

export type ProductList = ProductBase;

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

export interface PaginatedProducts {
  products: ProductList[];
  total: number;
}

export const productsApi = {
  // Fetch all products
  getProducts: async (params?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedProducts> => {
    const response = await apiClient.get('/products', { params });
    const { products, total } = response.data;

    return {
      products: products.map((p: any) => ({
        ...p,
        basePrice: p.currentPrice, // Map currentPrice from backend to basePrice used in frontend
      })),
      total,
    };
  },

  // Fetch single product with sizes and frames
  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    const product = response.data;

    return {
      ...product,
      basePrice: product.currentPrice, // Map currentPrice from backend to basePrice used in frontend
    };
  },

  // Fetch all design templates
  getTemplates: async (): Promise<Template[]> => {
    const response = await apiClient.get('/products/templates/all');
    return response.data;
  },
};
