'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { adminApi, AdminAnalytics } from '@/api/admin-api';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchAnalytics();
  }, [user, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to load analytics.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Order metrics and performance insights</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/orders"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Orders
              </Link>
              <Link
                href="/admin/reviews"
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium"
              >
                Reviews
              </Link>
              <Link
                href="/"
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.summary.total_orders}
                </p>
              </div>
              <div className="text-4xl text-blue-500">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${analytics.summary.revenue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-4xl text-green-500">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Order Value</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${analytics.summary.average_order_value.toFixed(2)}
                </p>
              </div>
              <div className="text-4xl text-purple-500">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Last 7 Days</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.summary.orders_last_7_days}
                </p>
              </div>
              <div className="text-4xl text-orange-500">📈</div>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg p-8 shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Status Breakdown</h2>
            <div className="space-y-4">
              {Object.entries(analytics.status_breakdown).map(([status, count]) => {
                const total = analytics.summary.total_orders;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                const statusColors: Record<string, string> = {
                  pending: 'bg-yellow-500',
                  processing: 'bg-blue-500',
                  printing: 'bg-purple-500',
                  shipped: 'bg-green-500',
                  delivered: 'bg-green-600',
                  cancelled: 'bg-red-500',
                  refunded: 'bg-gray-500',
                };

                return (
                  <div key={status}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-gray-900 capitalize">
                        {status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${statusColors[status] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Orders by Day Chart */}
          <div className="bg-white rounded-lg p-8 shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Orders Last 7 Days</h2>
            <div className="space-y-4">
              {analytics.orders_by_day.length > 0 ? (
                analytics.orders_by_day.map((item) => {
                  const maxCount = Math.max(
                    ...analytics.orders_by_day.map((d) => d.count),
                    1
                  );
                  const percentage = (item.count / maxCount) * 100;

                  return (
                    <div key={item.date}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {new Date(item.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-sm text-gray-600">
                          {item.count} order{item.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No orders in the last 7 days
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg p-8 shadow">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Fulfillment Status</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {analytics.status_breakdown.delivered || 0}
                  </span>{' '}
                  Delivered ({((analytics.status_breakdown.delivered || 0) / analytics.summary.total_orders * 100).toFixed(1)}%)
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {(analytics.status_breakdown.shipped || 0) + (analytics.status_breakdown.processing || 0)}
                  </span>{' '}
                  In transit/Processing
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {analytics.status_breakdown.pending || 0}
                  </span>{' '}
                  Pending
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Order Status</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {analytics.status_breakdown.cancelled || 0}
                  </span>{' '}
                  Cancelled
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">
                    {analytics.status_breakdown.refunded || 0}
                  </span>{' '}
                  Refunded
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Financial Summary</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  Total Revenue: <span className="font-semibold">${analytics.summary.revenue.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-700">
                  Avg per Order: <span className="font-semibold">${analytics.summary.average_order_value.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
