'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/api/orders-api';
import { useAuthStore } from '@/store/authStore';
import { useEditorStore } from '@/store/editorStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { product, elements } = useEditorStore();
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No product selected
          </h1>
          <Link
            href="/gallery"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  // Calculate price (simplified)
  const basePrice = 25.99; // Default canvas price
  const sizeMod = 25; // Size modifier
  const frameMod = 15; // Frame modifier
  const subtotal = basePrice + sizeMod + frameMod;
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create order
      const orderData = {
        items: [
          {
            product_id: product.productId,
            quantity: 1,
            size_selected: product.selectedSize,
            frame_option: product.selectedFrame,
          },
        ],
        shipping_address: shippingAddress,
      };

      const order = await ordersApi.createOrder(orderData);

      // Redirect to order confirmation
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to place order. Please try again.'
      );
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <textarea
                    id="address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Street address, city, state, ZIP"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !shippingAddress}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-bold text-lg"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-700">{product.name}</span>
                  <span className="font-medium">${basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Size ({product.selectedSize})</span>
                  <span>+${sizeMod.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frame ({product.selectedFrame})</span>
                  <span>+${frameMod.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Continue Shopping */}
            <Link
              href="/gallery"
              className="block text-center text-blue-500 hover:text-blue-600 font-medium"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary Side Panel */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h3 className="text-lg font-bold mb-4">Order Total</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Free shipping on orders over $100
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-bold mb-2 text-sm">Product Details</h4>
                <div className="text-xs text-gray-700 space-y-1">
                  <p><strong>Size:</strong> {product.selectedSize}</p>
                  <p><strong>Frame:</strong> {product.selectedFrame}</p>
                  <p><strong>Resolution:</strong> {product.dpi} DPI</p>
                  <p><strong>Elements:</strong> {elements.length} items</p>
                </div>
              </div>

              {/* Secure Badge */}
              <div className="text-xs text-gray-600 text-center pt-4 border-t">
                <p>🔒 Secure checkout with SSL encryption</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
