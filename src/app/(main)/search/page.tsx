'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useEffect, useState, Suspense } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import Link from 'next/link';
import { getProducts } from '@/lib/db';
import type { Product } from '@/types/product';

function SearchForm() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(data => setAllProducts(data.filter(p => p.isActive)));
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const normalized = query.toLowerCase().trim();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(normalized) ||
        p.description.toLowerCase().includes(normalized) ||
        p.category.toLowerCase().includes(normalized) ||
        p.categories?.some(c => c.toLowerCase().includes(normalized)) ||
        p.tags.some((t) => t.toLowerCase().includes(normalized))
    );
  }, [query, allProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="border-b border-gray-100 pb-5 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        <p className="text-sm text-gray-500 mt-1">
          {query ? (
            <>
              Showing {searchResults.length} results for "
              <span className="font-semibold text-blue-600">{query}</span>
              "
            </>
          ) : (
            'Enter a search query to browse products'
          )}
        </p>
      </div>

      {query ? (
        searchResults.length > 0 ? (
          <ProductGrid products={searchResults} />
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm mt-10">
            <span className="text-4xl">🔍</span>
            <h3 className="text-lg font-bold text-gray-900 mt-4">No Results Found</h3>
            <p className="text-sm text-gray-500 mt-2">
              We couldn't find any products matching your search term. Try looking for general categories like "shirts", "panjabi", or "jersey".
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse All Shop
            </Link>
          </div>
        )
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-sm">Please type something in the search bar above.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-24 flex justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <SearchForm />
    </Suspense>
  );
}
