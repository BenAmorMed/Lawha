'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewsList from '@/components/reviews/ReviewsList';

export default function ProductReviewsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const productId = params.id as string;
  const orderId = searchParams.get('orderId') || undefined;
  const [reviewAdded, setReviewAdded] = useState(false);

  if (!productId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h1>
          <Link href="/gallery" className="text-blue-600 hover:text-blue-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link
            href={`/products/${productId}`}
            className="text-primary hover:text-primary-dark font-bold text-xs uppercase tracking-widest mb-4 inline-flex items-center gap-1 group transition-colors"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Product
          </Link>
          <h1 className="font-playfair text-4xl font-bold text-dark mt-2">Product Reviews</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Read and share feedback from our community
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-12">
            {/* Review Form (Always show, component handles unauth state) */}
            <ReviewForm
              productId={productId}
              orderId={orderId}
              onSuccess={() => setReviewAdded(!reviewAdded)}
            />

            {/* Reviews List */}
            <ReviewsList productId={productId} onReviewAdded={() => setReviewAdded(!reviewAdded)} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Info Box */}
            <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
              <h3 className="font-bold text-dark mb-4 tracking-wider text-sm uppercase">About Reviews</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span> Verified purchases show with a badge
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span> Your review helps other customers
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span> Be honest and helpful
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">✓</span> Reviews can be edited anytime
                </li>
              </ul>
            </div>

            {/* Review Guidelines */}
            <div className="bg-primary/5 rounded-xl border border-primary/10 p-8 shadow-sm">
              <h3 className="font-bold text-primary-dark mb-4 tracking-wider text-sm uppercase">Review Guidelines</h3>
              <ul className="space-y-3 text-sm text-primary-dark/80 font-medium">
                <li className="flex items-start gap-2">• Use 5-100 character titles</li>
                <li className="flex items-start gap-2">• Write 10-1000 character reviews</li>
                <li className="flex items-start gap-2">• Rate from 1-5 stars</li>
                <li className="flex items-start gap-2">• Be constructive and specific</li>
                <li className="flex items-start gap-2">• Avoid spoilers</li>
              </ul>
            </div>

            {/* Your Reviews */}
            {user && (
              <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
                <h3 className="font-bold text-dark mb-4 tracking-wider text-sm uppercase">Your Activity</h3>
                <Link
                  href="/reviews/my-reviews"
                  className="text-primary hover:text-primary-dark text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  View all your reviews <span className="text-lg">→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
