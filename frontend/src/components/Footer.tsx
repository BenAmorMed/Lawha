import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary pt-16 pb-8 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div>
            <h2 className="font-playfair text-2xl font-bold text-primary mb-6">Lawha</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Create personalized gifts and custom printing products that capture your special moments forever. High quality materials and fast shipping.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white flex items-center justify-center rounded-full text-primary hover:bg-primary hover:text-white transition-colors shadow-sm">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white flex items-center justify-center rounded-full text-primary hover:bg-primary hover:text-white transition-colors shadow-sm">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white flex items-center justify-center rounded-full text-primary hover:bg-primary hover:text-white transition-colors shadow-sm">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-dark mb-6 tracking-wider text-sm uppercase">Quick Links</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/gallery" className="text-gray-600 hover:text-primary text-sm transition-colors">All Products</Link></li>
              <li><Link href="/products?category=gift-boxes" className="text-gray-600 hover:text-primary text-sm transition-colors">Gift Boxes</Link></li>
              <li><Link href="/products?category=cups" className="text-gray-600 hover:text-primary text-sm transition-colors">Custom Cups</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-primary text-sm transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-primary text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-dark mb-6 tracking-wider text-sm uppercase">Customer Service</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/shipping" className="text-gray-600 hover:text-primary text-sm transition-colors">Shipping Information</Link></li>
              <li><Link href="/returns" className="text-gray-600 hover:text-primary text-sm transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-primary text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-primary text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-primary text-sm transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-dark mb-6 tracking-wider text-sm uppercase">Contact Us</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary mt-1" size={18} />
                <span className="text-gray-600 text-sm">123 Printing Street, Creative District<br />Istanbul, Turkey</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary" size={18} />
                <span className="text-gray-600 text-sm">+90 (555) 123 45 67</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary" size={18} />
                <span className="text-gray-600 text-sm">hello@lawha.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-200 pt-12 pb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-bold text-dark mb-4 text-xl">Join Our Newsletter</h3>
            <p className="text-gray-600 text-sm mb-6">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                required
              />
              <button
                type="submit"
                className="bg-primary text-white px-6 py-3 rounded-md font-bold text-sm hover:bg-primary-dark transition-colors"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Lawha. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
