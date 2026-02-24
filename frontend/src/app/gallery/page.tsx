'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { productsApi } from '@/api/products-api';
import { useEditorStore } from '@/store/editorStore';

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  image_url: string;
  is_active: boolean;
}

interface ProductSize {
  id: string;
  name: string;
  dimensions: string;
  price_modifier: number;
}

interface FrameOption {
  id: string;
  name: string;
  description: string;
  price_modifier: number;
}

export default function GalleryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [frames, setFrames] = useState<FrameOption[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFrame, setSelectedFrame] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { setProduct } = useEditorStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productsApi.getProducts();
        setProducts(data);
        if (data.length > 0) {
          setSelectedProduct(data[0]);
          const productDetails = await productsApi.getProductById(data[0].id);
          setSizes(productDetails.sizes || []);
          setFrames(productDetails.frame_options || []);
          setSelectedSize(productDetails.sizes?.[0]?.id || '');
          setSelectedFrame(productDetails.frame_options?.[0]?.id || '');
        }
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductChange = async (product: Product) => {
    setSelectedProduct(product);
    try {
      const productDetails = await productsApi.getProductById(product.id);
      setSizes(productDetails.sizes || []);
      setFrames(productDetails.frame_options || []);
      setSelectedSize(productDetails.sizes?.[0]?.id || '');
      setSelectedFrame(productDetails.frame_options?.[0]?.id || '');
    } catch (err) {
      console.error('Failed to load product details:', err);
    }
  };

  const handleStartDesigning = () => {
    if (selectedProduct && selectedSize && selectedFrame) {
      setProduct({
        productId: selectedProduct.id,
        name: selectedProduct.name,
        width: 1200,
        height: 900,
        dpi: 300,
        selectedSize,
        selectedFrame,
      });
      setShowModal(false);
      // Redirect to editor
      window.location.href = '/editor';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-lg font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Canvas Products</h1>
          <p className="text-gray-600 mt-2">
            Choose a product and start designing your custom canvas
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Product Image */}
              <div className="relative h-64 bg-gray-200">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                <p className="text-gray-600 text-sm mt-2">{product.description}</p>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.base_price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">starting price</span>
                </div>

                {/* Category */}
                <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">
                  {product.category}
                </p>

                {/* Actions */}
                <button
                  onClick={() => {
                    handleProductChange(product);
                    setShowModal(true);
                  }}
                  className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                >
                  Customize Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Customization Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Size Selection */}
              <div>
                <h3 className="text-lg font-bold mb-3">Select Size</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedSize === size.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{size.name}</div>
                      <div className="text-sm text-gray-600">{size.dimensions}</div>
                      {size.price_modifier > 0 && (
                        <div className="text-sm text-gray-500">
                          +${size.price_modifier.toFixed(2)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frame Selection */}
              <div>
                <h3 className="text-lg font-bold mb-3">Select Frame</h3>
                <div className="space-y-2">
                  {frames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                        selectedFrame === frame.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{frame.name}</div>
                          <div className="text-sm text-gray-600">
                            {frame.description}
                          </div>
                        </div>
                        {frame.price_modifier > 0 && (
                          <div className="text-sm text-gray-700 font-medium">
                            +${frame.price_modifier.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium">
                    ${selectedProduct.base_price.toFixed(2)}
                  </span>
                </div>
                {sizes.find((s) => s.id === selectedSize)?.price_modifier > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Size Modifier:</span>
                    <span className="font-medium">
                      +$
                      {(
                        sizes.find((s) => s.id === selectedSize)?.price_modifier || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                {frames.find((f) => f.id === selectedFrame)?.price_modifier > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Frame:</span>
                    <span className="font-medium">
                      +$
                      {(
                        frames.find((f) => f.id === selectedFrame)?.price_modifier ||
                        0
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold">Estimated Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    $
                    {(
                      selectedProduct.base_price +
                      (sizes.find((s) => s.id === selectedSize)?.price_modifier || 0) +
                      (frames.find((f) => f.id === selectedFrame)?.price_modifier || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartDesigning}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                >
                  Start Designing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
