'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/components/ProductCard';
import axios from 'axios';
import { ChevronDown, Filter, X } from 'lucide-react';

function ProductListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sortBy') || 'newest';
  const currentSearch = searchParams.get('search') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/products/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(['gift-boxes', 'goblet', 'cups', 'tables', 'photos']);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/products`, {
          params
        });
        if (response.data.products && response.data.products.length > 0) {
          setProducts(response.data.products);
        } else {
          throw new Error('No products found');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback for demo
        setProducts([
          {
            id: '1',
            name: 'Personalized Magic Mug',
            category: 'cups',
            currentPrice: 19.99,
            originalPrice: 24.99,
            imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fbed20?q=80&w=800&auto=format&fit=crop',
            rating: 4.8,
            reviewsCount: 124,
            isSpecial: true,
            shippingFree: true
          },
          {
            id: '2',
            name: 'Luxury Wooden Gift Box',
            category: 'gift-boxes',
            currentPrice: 45.00,
            imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop',
            rating: 5.0,
            reviewsCount: 86,
            isSpecial: true,
            shippingFree: false
          },
          {
            id: '3',
            name: 'Custom Canvas Print 40x60',
            category: 'tables',
            currentPrice: 34.90,
            originalPrice: 49.90,
            imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop',
            rating: 4.7,
            reviewsCount: 215,
            isSpecial: false,
            shippingFree: true
          },
          {
            id: '4',
            name: 'Glass Photo Frame',
            category: 'photos',
            currentPrice: 22.50,
            imageUrl: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5db?q=80&w=800&auto=format&fit=crop',
            rating: 4.9,
            reviewsCount: 42,
            isSpecial: true,
            shippingFree: false
          },
          {
            id: '5',
            name: 'Ceramic Goblet Model A',
            category: 'goblet',
            currentPrice: 28.00,
            imageUrl: 'https://images.unsplash.com/photo-1574633912318-77c8e5454129?q=80&w=800&auto=format&fit=crop',
            rating: 4.6,
            reviewsCount: 57,
            isSpecial: false,
            shippingFree: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', e.target.value);
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === '') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/products?${params.toString()}`);
    setShowMobileFilters(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow">
        {/* Page Header */}
        <div className="bg-secondary py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-dark mb-2">
              {currentCategory ? currentCategory.replace('-', ' ').toUpperCase() : 'ALL PRODUCTS'}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="hover:text-primary cursor-pointer" onClick={() => router.push('/')}>Home</span>
              <span>/</span>
              <span className="text-dark font-medium">Shop</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters (Desktop) */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-32">
                <div className="mb-10">
                  <h3 className="font-bold text-dark mb-6 tracking-wider text-sm uppercase border-b pb-2">Categories</h3>
                  <ul className="flex flex-col gap-3">
                    <li>
                      <button
                        onClick={() => handleCategoryFilter('')}
                        className={`text-sm transition-colors ${currentCategory === '' ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'}`}
                      >
                        All Categories
                      </button>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => handleCategoryFilter(cat)}
                          className={`text-sm transition-colors capitalize ${currentCategory === cat ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'}`}
                        >
                          {cat.replace('-', ' ')}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-dark mb-6 tracking-wider text-sm uppercase border-b pb-2">Price Range</h3>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" aria-label="Minimum price" className="w-full px-3 py-2 border rounded-md text-sm" />
                    <span className="text-gray-400">-</span>
                    <input type="number" placeholder="Max" aria-label="Maximum price" className="w-full px-3 py-2 border rounded-md text-sm" />
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-grow">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <button
                    className="lg:hidden flex items-center gap-2 text-sm font-bold text-dark border px-4 py-2 rounded-md"
                    onClick={() => setShowMobileFilters(true)}
                  >
                    <Filter size={16} /> Filters
                  </button>
                  <p className="text-sm text-gray-500">
                    Showing <span className="text-dark font-medium">{products.length}</span> results
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 hidden sm:block">Sort by:</span>
                  <div className="relative">
                    <select
                      value={currentSort}
                      onChange={handleSortChange}
                      className="appearance-none bg-white border rounded-md px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="newest">Newest</option>
                      <option value="popular">Popular</option>
                      <option value="priceLowHigh">Price: Low to High</option>
                      <option value="priceHighLow">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Grid */}
              <ProductGrid products={products} loading={loading} />

              {!loading && products.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
                  <button
                    onClick={() => router.push('/products')}
                    className="text-primary font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[100] bg-black/50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white p-6 shadow-xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} aria-label="Close filters">
                <X size={24} />
              </button>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-dark mb-4 text-sm uppercase">Categories</h3>
              <ul className="flex flex-col gap-4">
                <li>
                  <button
                    onClick={() => handleCategoryFilter('')}
                    className={`text-sm w-full text-left py-2 px-4 rounded-md ${currentCategory === '' ? 'bg-primary text-white font-bold' : 'text-gray-600 border'}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => handleCategoryFilter(cat)}
                      className={`text-sm w-full text-left py-2 px-4 rounded-md capitalize ${currentCategory === cat ? 'bg-primary text-white font-bold' : 'text-gray-600 border'}`}
                    >
                      {cat.replace('-', ' ')}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <button
                className="w-full bg-primary text-white py-4 rounded-md font-bold"
                onClick={() => setShowMobileFilters(false)}
              >
                APPLY FILTERS
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductListingContent />
    </Suspense>
  );
}
