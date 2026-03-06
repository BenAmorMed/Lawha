import { apiClient } from './api-client';

export interface AdminOrder {
  id: string;
  userEmail: string;
  userId: string;
  status: string;
  total: number;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface AdminOrderDetail extends AdminOrder {
  shipping_address: string;
  items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    size_selected: string;
    frame_option: string;
    subtotal: number;
  }>;
  shipped_at?: string;
  delivered_at?: string;
}

export interface AdminAnalytics {
  summary: {
    total_orders: number;
    revenue: number;
    average_order_value: number;
    orders_last_7_days: number;
  };
  status_breakdown: Record<string, number>;
  orders_by_day: Array<{
    date: string;
    count: number;
  }>;
}

export const adminApi = {
  // Get all orders with filters
  getAllOrders: async (filters?: {
    status?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'createdAt' | 'total' | 'status';
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{
    data: AdminOrder[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      pages: number;
    };
  }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get(
      `/admin/orders?${params.toString()}`,
    );
    return response.data;
  },

  // Get single order details for admin
  getOrderDetail: async (orderId: string): Promise<AdminOrderDetail> => {
    const response = await apiClient.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  // Update single order status
  updateOrderStatus: async (
    orderId: string,
    status: string,
    trackingNumber?: string,
  ): Promise<void> => {
    await apiClient.patch(`/admin/orders/${orderId}/status`, {
      status,
      tracking_number: trackingNumber,
    });
  },

  // Bulk update order statuses
  bulkUpdateStatus: async (
    orderIds: string[],
    status: string,
    trackingNumber?: string,
  ): Promise<{ updated_count: number; status: string }> => {
    const response = await apiClient.post(`/admin/orders/bulk-update`, {
      order_ids: orderIds,
      status,
      tracking_number: trackingNumber,
    });
    return response.data;
  },

  // Get analytics dashboard
  getAnalytics: async (): Promise<AdminAnalytics> => {
    const response = await apiClient.get(`/admin/orders/analytics/dashboard`);
    return response.data;
  },

  // Approve an order for printing
  approveOrder: async (orderId: string): Promise<void> => {
    await apiClient.post(`/admin/orders/${orderId}/approve`);
  },

  // Reject an order
  rejectOrder: async (orderId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/admin/orders/${orderId}/reject`, { reason });
  },
};
