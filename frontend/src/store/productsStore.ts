import { create } from 'zustand';
import { productsApi, Product, ProductList, Template } from '../api/products-api';

interface ProductsStore {
  // State
  products: ProductList[];
  currentProduct: Product | null;
  templates: Template[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  clearCurrentProduct: () => void;
  clearError: () => void;
}

export const useProductsStore = create<ProductsStore>((set) => ({
  // Initial state
  products: [],
  currentProduct: null,
  templates: [],
  loading: false,
  error: null,

  // Fetch all products
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await productsApi.getProducts();
      set({ products, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch products',
        loading: false,
      });
    }
  },

  // Fetch single product
  fetchProduct: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const product = await productsApi.getProduct(id);
      set({ currentProduct: product, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch product',
        loading: false,
      });
    }
  },

  // Fetch templates
  fetchTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const templates = await productsApi.getTemplates();
      set({ templates, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch templates',
        loading: false,
      });
    }
  },

  // Clear current product
  clearCurrentProduct: () => {
    set({ currentProduct: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
