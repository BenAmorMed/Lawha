'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, User, ShoppingCart, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    { name: 'GIFT BOXES', href: '/products?category=gift-boxes' },
    { name: 'GOBLET MODELS', href: '/products?category=goblet' },
    { name: 'CUP PRINTING', href: '/products?category=cups' },
    { name: 'TABLE/FRAMEWORK', href: '/products?category=tables' },
    { name: 'PHOTO PRINTING', href: '/products?category=photos' },
  ];

  return (
    <header className="w-full">
      {/* Top Banner */}
      <div className="bg-primary text-white text-center py-2 px-4 text-xs font-bold tracking-wider">
        INSTALLMENT OPPORTUNITY FOR CREDIT CARD
      </div>

      {/* Main Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Empty space for mobile centering logo */}
            <div className="hidden md:flex lg:hidden w-10"></div>

            {/* Logo */}
            <Link href="/" className="flex flex-col items-center">
              <span className="font-playfair text-3xl md:text-4xl font-bold tracking-tighter text-primary">
                Lawha
              </span>
              <span className="text-[10px] tracking-[0.3em] font-medium text-dark uppercase -mt-1">
                Custom Printing
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <button className="p-2 text-dark hover:text-primary transition-colors">
                <Search size={20} />
              </button>
              <Link href="/login" className="p-2 text-dark hover:text-primary transition-colors hidden sm:block">
                <User size={20} />
              </Link>
              <Link href="/checkout" className="p-2 text-dark hover:text-primary transition-colors relative">
                <ShoppingCart size={20} />
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="hidden lg:block border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <ul className="flex justify-center items-center gap-8 py-4">
            {categories.map((cat) => (
              <li key={cat.name}>
                <Link
                  href={cat.href}
                  className="text-xs font-bold tracking-widest text-dark hover:text-primary transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b absolute w-full z-50 shadow-xl animate-in slide-in-from-top duration-300">
          <ul className="flex flex-col p-4">
            {categories.map((cat) => (
              <li key={cat.name} className="border-b last:border-0">
                <Link
                  href={cat.href}
                  className="block py-4 text-sm font-bold tracking-widest text-dark"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li className="pt-4 flex gap-4">
              <Link href="/login" className="flex items-center gap-2 text-sm font-bold">
                <User size={18} /> Account
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
