import { create } from 'zustand';
import {
  ordersApi,
  Order,
  OrderList,
  CreateOrderPayload,
  PriceBreakdown,
} from '../api/orders-api';

interface OrdersStore {
  // State
  orders: OrderList[];
  currentOrder: Order | null;
  priceBreakdown: PriceBreakdown | null;
  loading: boolean;
  creating: boolean;
  error: string | null;

  // Actions
  createOrder: (payload: CreateOrderPayload) => Promise<Order>;
  fetchMyOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  fetchOrderBreakdown: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: string, tracking?: string) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  clearCurrentOrder: () => void;
  clearError: () => void;
}

export const useOrdersStore = create<OrdersStore>((set) => ({
  // Initial state
  orders: [],
  currentOrder: null,
  priceBreakdown: null,
  loading: false,
  creating: false,
  error: null,

  // Create order
  createOrder: async (payload: CreateOrderPayload) => {
    set({ creating: true, error: null });
    try {
      const order = await ordersApi.createOrder(payload);
      set({ currentOrder: order, creating: false });
      return order;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create order',
        creating: false,
      });
      throw error;
    }
  },

  // Fetch user's orders
  fetchMyOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await ordersApi.getMyOrders();
      set({ orders, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch orders',
        loading: false,
      });
    }
  },

  // Fetch order details
  fetchOrder: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const order = await ordersApi.getOrder(id);
      set({ currentOrder: order, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch order',
        loading: false,
      });
    }
  },

  // Fetch price breakdown
  fetchOrderBreakdown: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const breakdown = await ordersApi.getOrderBreakdown(id);
      set({ priceBreakdown: breakdown, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch price breakdown',
        loading: false,
      });
    }
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string, tracking?: string) => {
    set({ loading: true, error: null });
    try {
      const order = await ordersApi.updateOrderStatus(id, status, tracking);
      set({ currentOrder: order, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update order status',
        loading: false,
      });
    }
  },

  // Cancel order
  cancelOrder: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await ordersApi.cancelOrder(id);
      // Refresh current order
      if (id) {
        await ordersApi.getOrder(id).then((order) => {
          set({ currentOrder: order });
        });
      }
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to cancel order',
        loading: false,
      });
    }
  },

  // Clear current order
  clearCurrentOrder: () => {
    set({ currentOrder: null, priceBreakdown: null });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
