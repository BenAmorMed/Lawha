import React, { memo } from 'react';
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

/**
 * ProductCard component displays product information in a grid item.
 *
 * PERFORMANCE OPTIMIZATIONS:
 * 1. React.memo: Prevents unnecessary re-renders when parent component (ProductGrid)
 *    re-renders but individual product data hasn't changed.
 * 2. next/image 'sizes' attribute: Crucial for images using 'fill' layout.
 *    Ensures the browser requests correctly scaled images for different viewports,
 *    reducing bandwidth usage significantly (e.g. from 100vw to ~25vw on desktop).
 *    Impact: ~75% reduction in image payload size on desktop screens.
 */
const ProductCard: React.FC<ProductCardProps> = memo(({ product }) => {
  return (
    <div className="group flex flex-col h-full border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.imageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
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
            <Link href={`/editor?productId=${product.id}`} className="w-full">
              <Button variant="primary" size="sm" fullWidth>
                Customize
              </Button>
            </Link>
            <Button variant="secondary" size="sm">
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
