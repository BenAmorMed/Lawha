'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { adminApi, AdminOrderDetail } from '@/api/admin-api';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'printing', label: 'Printing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const orderId = params.id as string;

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    if (orderId) {
      fetchOrder();
    }
  }, [user, orderId, router]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOrderDetail(orderId);
      setOrder(data);
      setNewStatus(data.status);
      setTrackingNumber(data.trackingNumber || '');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to load order details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }

    try {
      setUpdating(true);
      await adminApi.updateOrderStatus(orderId, newStatus, trackingNumber || undefined);
      alert('✅ Order updated successfully');
      fetchOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load order.'}</p>
          <Link
            href="/admin/orders"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            href="/admin/orders"
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.id.substring(0, 8).toUpperCase()}
          </h1>
          <p className="text-gray-600 mt-1">
            Customer: {order.userEmail}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Update Section */}
        <div className="bg-white rounded-lg p-8 mb-8 shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Update Order Status</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <p className="text-lg font-semibold text-gray-900 p-3 bg-gray-50 rounded-lg">
                {order.status}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number (optional)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleUpdateStatus}
            disabled={updating || newStatus === order.status}
            className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium"
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Order Items */}
          <div className="md:col-span-2 bg-white rounded-lg p-8 shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Canvas Print - {item.size_selected} with {item.frame_option} frame
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
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
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-lg p-8 shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Info</h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="font-mono text-sm text-gray-900">
                  {order.id}
                </p>
              </div>

              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                  <p className="font-mono text-sm text-gray-900">
                    {order.trackingNumber}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">Order Placed</p>
                <p className="text-sm text-gray-900">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              {order.shipped_at && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Shipped</p>
                  <p className="text-sm text-gray-900">
                    {new Date(order.shipped_at).toLocaleString()}
                  </p>
                </div>
              )}

              {order.delivered_at && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivered</p>
                  <p className="text-sm text-gray-900">
                    {new Date(order.delivered_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg p-8 shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
          <p className="text-gray-700 whitespace-pre-line">{order.shipping_address}</p>
        </div>
      </main>
    </div>
  );
}
