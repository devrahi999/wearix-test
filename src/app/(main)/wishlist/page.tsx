'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import ProductGrid from '@/components/product/ProductGrid';
import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/db';
import type { Product } from '@/types/product';

export default function WishlistPage() {
  const { productIds } = useWishlistStore();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(data => setAllProducts(data));
  }, []);

  const wishlistedProducts = allProducts.filter((p) => productIds.includes(p.id));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Your Wishlist is Empty</h1>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
          Save items you love here so you can easily review them later or add them directly to your cart.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
        >
          Explore Shop <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" /> My Wishlist
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            You have saved {wishlistedProducts.length} items to your collection
          </p>
        </div>
        <Link
          href="/shop"
          className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
        >
          Explore More <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <ProductGrid products={wishlistedProducts} />
    </div>
  );
}
