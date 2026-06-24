'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/products?limit=8`);
        setFeaturedProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Fallback with dummy data for demo if API fails
        setFeaturedProducts([
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
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[400px] md:h-[600px] bg-secondary overflow-hidden">
          <div className="container mx-auto h-full px-4 flex flex-col md:flex-row items-center">
            <div className="z-10 text-center md:text-left md:w-1/2 pt-12 md:pt-0">
              <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold text-dark mb-6 leading-tight">
                Capture Your <br />
                <span className="text-primary">Best Moments</span>
              </h1>
              <p className="text-gray-600 text-lg mb-8 max-w-lg">
                High-quality personalized prints and gifts for every occasion. Make it special, make it yours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button href="/products" size="lg" className="w-full sm:w-auto">
                  SHOP NOW
                </Button>
                <Button
                  href="/editor"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  CREATE YOUR OWN
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="absolute right-0 bottom-0 md:relative md:w-1/2 h-full hidden md:block">
               <div className="relative w-full h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1513519247388-19345ed5d467?q=80&w=1200&auto=format&fit=crop"
                    alt="Hero"
                    fill
                    className="object-cover object-center"
                    priority
                  />
               </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-dark mb-4">Our Categories</h2>
              <div className="w-20 h-1 bg-primary mx-auto"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-8">
              {[
                { name: 'GIFT BOXES', icon: '🎁', color: 'bg-pink-50', href: '/products?category=gift-boxes' },
                { name: 'GOBLET MODELS', icon: '🍷', color: 'bg-blue-50', href: '/products?category=goblet' },
                { name: 'CUP PRINTING', icon: '☕', color: 'bg-orange-50', href: '/products?category=cups' },
                { name: 'TABLES', icon: '🖼️', color: 'bg-green-50', href: '/products?category=tables' },
                { name: 'PHOTO PRINTING', icon: '📸', color: 'bg-purple-50', href: '/products?category=photos' },
              ].map((cat) => (
                <Link key={cat.name} href={cat.href} className="group">
                  <div className={`${cat.color} rounded-2xl p-8 flex flex-col items-center justify-center transition-transform group-hover:-translate-y-2 duration-300 shadow-sm border border-transparent group-hover:border-primary/20`}>
                    <span className="text-4xl mb-4">{cat.icon}</span>
                    <span className="text-xs font-bold tracking-widest text-dark group-hover:text-primary transition-colors text-center">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div className="mb-6 md:mb-0">
                <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">SELECTED FOR YOU</span>
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-dark">Featured Products</h2>
              </div>
              <Link href="/products" className="text-sm font-bold text-primary border-b-2 border-primary pb-1 hover:text-primary-dark hover:border-primary-dark transition-colors">
                VIEW ALL PRODUCTS
              </Link>
            </div>

            <ProductGrid products={featuredProducts} loading={loading} />
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-3xl overflow-hidden relative">
               <div className="flex flex-col md:flex-row items-center">
                  <div className="p-12 md:p-20 md:w-1/2 text-white z-10 text-center md:text-left">
                    <h2 className="font-playfair text-3xl md:text-5xl font-bold mb-6 leading-tight">Create Your Own <br />Unique Design</h2>
                    <p className="text-white/80 mb-8 text-lg">Use our professional editor to design your own products from scratch. Upload photos, add text, and choose effects.</p>
                    <Button
                      href="/editor"
                      variant="secondary"
                      size="lg"
                      className="bg-white text-primary hover:bg-gray-100"
                    >
                      GO TO EDITOR
                    </Button>
                  </div>
                  <div className="relative md:w-1/2 h-[300px] md:h-[500px] w-full">
                    <Image
                      src="https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop"
                      alt="Editor Promo"
                      fill
                      className="object-cover"
                    />
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
