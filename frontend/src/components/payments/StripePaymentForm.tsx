'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { paymentsApi } from '@/api/payments-api';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ''
);

interface StripePaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

const StripeCheckoutForm: React.FC<StripePaymentFormProps> = ({
  orderId,
  amount,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Create payment intent when component mounts
  useEffect(() => {
    const createIntent = async () => {
      try {
        const data = await paymentsApi.createPaymentIntent(orderId, amount);
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        onError(err.response?.data?.message || 'Failed to create payment intent');
      }
    };

    createIntent();
  }, [orderId, amount, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setCardError(null);

    try {
      // Confirm payment with card element
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { email },
        },
      });

      if (result.error) {
        setCardError(result.error.message || 'Payment failed');
        onError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Payment successful
        onSuccess(result.paymentIntent.id);
      }
    } catch (err: any) {
      setCardError(err.message);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Details
        </label>
        <div className="px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#fca5a5',
                },
              },
              hidePostalCode: false,
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      {cardError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{cardError}</p>
        </div>
      )}

      {/* Amount Display */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Amount:</span>
          <span className="text-2xl font-bold text-blue-600">
            ${(amount / 100).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !stripe || !clientSecret}
        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-bold text-lg transition-colors"
      >
        {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </button>

      {/* Security Badge */}
      <div className="text-xs text-gray-600 text-center">
        🔒 Secure payment powered by Stripe
      </div>
    </form>
  );
};

export const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};
