'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, discountPercent } from '@/lib/utils';
import { Product } from '@/types/product';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const { addItem } = useCartStore();
  const wishlisted = isWishlisted(product.id);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.sizes.length > 0) {
      addItem({
        productId: product.id,
        name: product.name,
        image: product.images[0],
        size: product.sizes[0],
        price: product.price,
        discountPrice: product.discountPrice,
        quantity: 1,
        slug: product.slug,
      });
    }
  };

  const isOutOfStock = !!product.isOutOfStock;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discountPrice && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discountPercent(product.price, product.discountPrice)}%
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            aria-label={isMounted && wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all duration-200 ${
              isMounted && wishlisted
                ? 'bg-red-50 text-red-500'
                : 'bg-white text-gray-400 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${isMounted && wishlisted ? 'fill-red-500' : ''}`} />
          </button>

          {/* Quick add overlay */}
          {!isOutOfStock && (
            <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <button
                onClick={handleQuickAdd}
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" /> Quick Add
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-600">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.discountPrice ?? product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Sizes preview */}
          {product.sizes.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {product.sizes.slice(0, 4).map((size) => (
                <span
                  key={size}
                  className="text-xs px-1.5 py-0.5 rounded border border-gray-200 text-gray-600"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-xs text-gray-400">+{product.sizes.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
