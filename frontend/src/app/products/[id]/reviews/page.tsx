'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewsList from '@/components/reviews/ReviewsList';

export default function ProductReviewsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const productId = params.id as string;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            href={`/products/${productId}`}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
          >
            ← Back to Product
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Product Reviews</h1>
          <p className="text-gray-600 mt-1">
            Read and share feedback from other customers
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Review Form */}
            {user && (
              <div className="mb-12">
                <ReviewForm
                  productId={productId}
                  onSuccess={() => setReviewAdded(!reviewAdded)}
                />
              </div>
            )}

            {/* Reviews List */}
            <ReviewsList productId={productId} onReviewAdded={() => setReviewAdded(!reviewAdded)} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Box */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">About Reviews</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Verified purchases show with a badge</li>
                <li>✓ Your review helps other customers</li>
                <li>✓ Be honest and helpful</li>
                <li>✓ Reviews can be edited anytime</li>
              </ul>
            </div>

            {/* Review Guidelines */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-bold text-blue-900 mb-3">Review Guidelines</h3>
              <ul className="space-y-2 text-sm text-blue-900">
                <li>• Use 5-100 character titles</li>
                <li>• Write 10-1000 character reviews</li>
                <li>• Rate from 1-5 stars</li>
                <li>• Be constructive and specific</li>
                <li>• Avoid spoilers</li>
              </ul>
            </div>

            {/* Your Reviews */}
            {user && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-3">Your Reviews</h3>
                <Link
                  href="/reviews/my-reviews"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all your reviews →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
