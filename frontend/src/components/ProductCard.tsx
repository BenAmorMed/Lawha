import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Rating from './ui/Rating';
import Badge from './ui/Badge';
import Button from './ui/Button';

export interface Product {
  id: string;
  name: string;
  category: string;
  originalPrice?: number;
  currentPrice: number;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  isSpecial: boolean;
  shippingFree: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group flex flex-col h-full border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.imageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {product.shippingFree && (
          <div className="absolute top-2 right-2">
            <Badge variant="pink">Shipping Free</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            IT'S SPECIAL FOR YOU
          </span>
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-medium text-dark hover:text-primary transition-colors line-clamp-2 mb-2 h-10">
            {product.name}
          </h3>
        </Link>

        <div className="mb-3">
          <Rating rating={product.rating} count={product.reviewsCount} />
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-4">
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through font-medium">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-primary">
              ${product.currentPrice.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="primary" size="sm" fullWidth asChild>
              <Link href={`/editor?productId=${product.id}`}>
                Customize
              </Link>
            </Button>
            <Button variant="secondary" size="sm">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
