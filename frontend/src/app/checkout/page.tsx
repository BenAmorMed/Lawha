'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ordersApi } from '@/api/orders-api';
import { paymentsApi } from '@/api/payments-api';
import { useAuthStore } from '@/store/authStore';
import { useEditorStore } from '@/store/editorStore';
import { StripePaymentForm } from '@/components/payments/StripePaymentForm';

enum CheckoutStep {
  SHIPPING = 'shipping',
  PAYMENT = 'payment',
  COMPLETE = 'complete',
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { product, elements } = useEditorStore();
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [step, setStep] = useState<CheckoutStep>(CheckoutStep.SHIPPING);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  // Calculate price
  const basePrice = 25.99;
  const sizeMod = 25;
  const frameMod = 15;
  const subtotal = basePrice + sizeMod + frameMod;
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
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
      setOrderId(order.id);
      setStep(CheckoutStep.PAYMENT);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to create order. Please try again.'
      );
      console.error('Order creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      await paymentsApi.confirmPayment(paymentIntentId, orderId!);
      setStep(CheckoutStep.COMPLETE);
    } catch (err: any) {
      setError('Payment confirmed but failed to update order. Contact support.');
      console.error('Payment confirmation error:', err);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
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
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Shipping Step */}
            {step === CheckoutStep.SHIPPING && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-lg font-bold">Shipping Address</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
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
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-bold"
                  >
                    {loading ? 'Creating Order...' : 'Continue to Payment'}
                  </button>
                </form>
              </div>
            )}

            {/* Payment Step */}
            {step === CheckoutStep.PAYMENT && orderId && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-lg font-bold">Payment Method</h2>
                <StripePaymentForm
                  orderId={orderId}
                  amount={Math.round(total * 100)}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
                <button
                  onClick={() => setStep(CheckoutStep.SHIPPING)}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  ← Back to Shipping
                </button>
              </div>
            )}

            {/* Success Step */}
            {step === CheckoutStep.COMPLETE && (
              <div className="bg-white rounded-lg shadow p-6 text-center space-y-6">
                <div className="text-4xl">✅</div>
                <h2 className="text-2xl font-bold text-green-600">
                  Order Confirmed!
                </h2>
                <p className="text-gray-600">
                  Thank you for your purchase. Your order has been placed successfully.
                </p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Order ID:</p>
                  <p className="font-mono text-lg font-bold text-gray-900">{orderId}</p>
                </div>
                <p className="text-gray-600">
                  You will receive an email confirmation shortly. You can track your order
                  in your account dashboard.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/gallery"
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    href="/orders"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                  >
                    View Order
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-4 space-y-4">
              <h3 className="text-lg font-bold">Order Summary</h3>

              {/* Product */}
              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between">
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

              {/* Pricing */}
              <div className="space-y-3 pb-4 border-b">
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
                  <p className="text-xs text-green-600">
                    ✓ Free shipping on orders over $100
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Product Details */}
              <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-700 space-y-1">
                <p>
                  <strong>Resolution:</strong> {product.dpi} DPI
                </p>
                <p>
                  <strong>Design Elements:</strong> {elements.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
