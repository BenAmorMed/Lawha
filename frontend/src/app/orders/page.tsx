'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ordersApi } from '@/api/orders-api';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  items_count: number;
  created_at: string;
  shipped_at?: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  payment_failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  pending: '⏳ Pending',
  processing: '⚙️ Processing',
  shipped: '📦 Shipped',
  delivered: '✅ Delivered',
  cancelled: '❌ Cancelled',
  payment_failed: '❌ Payment Failed',
  refunded: '↩️ Refunded',
};

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ordersApi.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to load orders. Please try again.'
      );
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-600 mt-1">
            View and manage your canvas print orders
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              filterStatus === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus('processing')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              filterStatus === 'processing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Processing ({orders.filter((o) => o.status === 'processing').length})
          </button>
          <button
            onClick={() => setFilterStatus('shipped')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              filterStatus === 'shipped'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Shipped ({orders.filter((o) => o.status === 'shipped').length})
          </button>
          <button
            onClick={() => setFilterStatus('delivered')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              filterStatus === 'delivered'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Delivered ({orders.filter((o) => o.status === 'delivered').length})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="text-red-600 font-medium mt-2 hover:text-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No orders found
            </h2>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all'
                ? "You haven't placed any orders yet."
                : `No orders found with status "${filterStatus}".`}
            </p>
            <Link
              href="/gallery"
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              Start Creating
            </Link>
          </div>
        )}

        {/* Orders Grid */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Order ID and Status */}
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        Order #{order.id.substring(0, 8).toUpperCase()}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusColors[order.status as keyof typeof statusColors] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[order.status as keyof typeof statusLabels] ||
                          order.status}
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium text-gray-900">
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Items</p>
                        <p className="font-medium text-gray-900">
                          {order.items_count} item
                          {order.items_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {order.shipped_at && (
                        <div>
                          <p className="text-sm text-gray-600">Shipped Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(order.shipped_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm whitespace-nowrap"
                    >
                      View Details
                    </Link>
                    {(order.status === 'processing' ||
                      order.status === 'shipped' ||
                      order.status === 'delivered') && (
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm">
                        Download Invoice
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm">
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <Link
              href="/gallery"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Continue Shopping
            </Link>
            <Link
              href="/account"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Account Settings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
