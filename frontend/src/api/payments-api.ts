import { apiClient } from './api-client';

export const paymentsApi = {
  /**
   * Create a payment intent for an order
   */
  async createPaymentIntent(orderId: string) {
    const response = await apiClient.post('/payments/create-intent', {
      orderId,
    });
    return response.data;
  },

  /**
   * Confirm payment completion
   */
  async confirmPayment(paymentIntentId: string, orderId: string) {
    const response = await apiClient.post('/payments/confirm', {
      paymentIntentId,
      orderId,
    });
    return response.data;
  },
};
