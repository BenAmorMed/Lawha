'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ordersApi } from '@/api/orders-api';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  size_selected: string;
  frame_option: string;
  subtotal: number;
}

interface OrderDetail {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: string;
  items: OrderItem[];
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
}

const statusSteps = [
  { status: 'pending', label: 'Pending', icon: '📋' },
  { status: 'processing', label: 'Processing', icon: '⚙️' },
  { status: 'shipped', label: 'Shipped', icon: '📦' },
  { status: 'delivered', label: 'Delivered', icon: '✅' },
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (orderId) {
      fetchOrder();
    }
  }, [user, orderId, router]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getOrder(orderId);
      setOrder(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to load order details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex((step) => step.status === order.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load order.'}</p>
          <Link
            href="/orders"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            href="/orders"
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.id.substring(0, 8).toUpperCase()}
          </h1>
          <p className="text-gray-600 mt-1">
            Order placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Timeline */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status</h2>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step.status} className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 ${
                    index <= currentStepIndex
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.icon}
                </div>

                {/* Step Label */}
                <p
                  className={`text-sm font-medium text-center ${
                    index <= currentStepIndex
                      ? 'text-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </p>

                {/* Connector Line */}
                {index < statusSteps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 mt-4 mb-12 ${
                      index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    style={{ minWidth: '40px' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Tracking Info */}
          {order.tracking_number && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Tracking Number</p>
              <p className="text-lg font-mono font-bold text-gray-900">
                {order.tracking_number}
              </p>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Canvas Print - {item.size_selected} with {item.frame_option}{' '}
                    frame
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                  {order.status === 'delivered' && (
                    <Link
                      href={`/products/${item.product_id}/reviews?orderId=${order.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                    >
                      Write a Review
                    </Link>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ${item.subtotal.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${item.unit_price.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {order.shipping_address}
            </p>
          </div>

          <div className="bg-white rounded-lg p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Timeline
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Order Placed</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              {order.shipped_at && (
                <div>
                  <p className="text-sm text-gray-600">Shipped</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.shipped_at).toLocaleString()}
                  </p>
                </div>
              )}
              {order.delivered_at && (
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.delivered_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
              Download Invoice
            </button>
            {order.status === 'delivered' && (
              <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                Reorder
              </button>
            )}
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
