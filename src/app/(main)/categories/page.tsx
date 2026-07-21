'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import { getCategories } from '@/lib/db';
import type { Category } from '@/types/product';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(data => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 font-medium">All Categories</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
        <p className="text-gray-500 text-sm mt-1.5">
          {loading ? 'Loading...' : `${categories.length} categories`} • Find exactly what you're looking for
        </p>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">No categories found. Add categories from the admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-200 aspect-square flex flex-col"
            >
              {/* Image */}
              <div className="relative flex-1 w-full overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </div>

              {/* Name */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-sm font-bold text-white drop-shadow">{cat.name}</span>
                <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-12 rounded-3xl bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 p-8 text-center text-white">
        <p className="text-blue-300 text-sm font-semibold uppercase tracking-wider mb-2">Explore Everything</p>
        <h2 className="text-2xl font-bold mb-3">Can't find what you need?</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
          Browse our full shop to discover all products across every style and category.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-3.5 rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-500/30 text-sm"
        >
          Browse Full Shop <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
