import { apiClient } from './api-client';

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  size_selected: string;
  frame_option: string;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'printing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  tracking_number: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderList {
  id: string;
  status: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  shipped_at?: string;
}

export interface CreateOrderPayload {
  items: Array<{
    product_id: string;
    quantity: number;
    size_selected?: string;
    frame_option?: string;
  }>;
  shipping_address: string;
}

export interface PriceBreakdown {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}

export const ordersApi = {
  // Create new order
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const response = await apiClient.post('/orders', payload);
    return response.data;
  },

  // Get user's orders
  getMyOrders: async (): Promise<OrderList[]> => {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  // Get order details
  getOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Get price breakdown
  getOrderBreakdown: async (orderId: string): Promise<PriceBreakdown> => {
    const response = await apiClient.get(`/orders/${orderId}/breakdown`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (
    orderId: string,
    status: string,
    trackingNumber?: string,
  ): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${orderId}/status`, {
      status,
      tracking_number: trackingNumber,
    });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<void> => {
    await apiClient.delete(`/orders/${orderId}`);
  },
};
