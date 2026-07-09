'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCategories } from '@/lib/db';
import type { Category } from '@/types/product';

export default function CategoryShortcuts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(data => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  const visibleCategories = categories.slice(0, 4);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-xs text-gray-500 mt-0.5">Explore our collections</p>
        </div>
        <Link
          href="/categories"
          className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          See All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {visibleCategories.map((cat) => {
            return (
              <Link
                key={cat.id}
                href={`/shop/${cat.slug}`}
                className="group flex flex-col gap-2 p-2 bg-white border border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {cat.image && <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 768px) 25vw, 15vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />}
                </div>
                <span className="text-sm text-gray-800 group-hover:text-blue-600 transition-colors font-bold text-center leading-tight pb-1">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
