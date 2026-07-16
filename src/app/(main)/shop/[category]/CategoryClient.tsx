'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { SIZES_GENERAL } from '@/constants';
import { ProductFilters, Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { SlidersHorizontal, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getProducts, getCategories } from '@/lib/db';
import type { Category } from '@/types/product';

interface CategoryClientProps {
  categorySlug: string;
  initialProducts?: Product[];
  initialCategoryInfo?: Category | null;
}

export default function CategoryClient({ categorySlug, initialProducts = [], initialCategoryInfo = null }: CategoryClientProps) {

  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(initialCategoryInfo);
  const [dbLoading, setDbLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    Promise.all([
      getProducts(),
      getCategories(),
    ]).then(([prods, cats]) => {
      const activeProds = prods.filter(p => p.isActive);
      const catInfo = cats.find(c => c.slug.toLowerCase() === categorySlug.toLowerCase());
      setCategoryInfo(catInfo || null);
      
      if (catInfo) {
        setAllProducts(activeProds.filter(p => {
          const matchPrimary = p.category === catInfo.slug || p.category === catInfo.name || p.category.toLowerCase() === categorySlug.toLowerCase();
          const matchSecondary = p.categories?.some(c => c === catInfo.slug || c === catInfo.name || c.toLowerCase() === categorySlug.toLowerCase());
          return matchPrimary || matchSecondary;
        }));
      } else {
        setAllProducts(activeProds.filter(p => p.category.toLowerCase() === categorySlug.toLowerCase() || p.categories?.some(c => c.toLowerCase() === categorySlug.toLowerCase())));
      }
      setDbLoading(false);
    });
  }, [categorySlug]);

  const [filters, setFilters] = useState<ProductFilters>({
    sizes: [],
    colors: [],
    sort: 'newest',
  });
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const toggleSize = (size: string) => {
    setFilters((prev) => {
      const sizes = prev.sizes || [];
      const nextSizes = sizes.includes(size)
        ? sizes.filter((s) => s !== size)
        : [...sizes, size];
      return { ...prev, sizes: nextSizes };
    });
  };

  const clearFilters = () => {
    setFilters({ sizes: [], colors: [], sort: 'newest' });
    setMaxPrice(3000);
  };

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filter by price
    result = result.filter((p) => (p.discountPrice ?? p.price) <= maxPrice);

    // Filter by sizes
    if (filters.sizes && filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((size) => filters.sizes?.includes(size))
      );
    }

    // Sort products
    if (filters.sort === 'price-asc') {
      result.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    } else if (filters.sort === 'price-desc') {
      result.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    } else if (filters.sort === 'popular') {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [categorySlug, maxPrice, filters, allProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-5 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 capitalize flex items-center gap-2">
            {categoryInfo?.emoji && <span>{categoryInfo.emoji}</span>}
            {categoryInfo?.name || categorySlug}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredProducts.length} items in this category
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Sort By:</span>
            <select
              value={filters.sort}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sort: e.target.value as any,
                }))
              }
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest Drops</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 shrink-0 space-y-6">
          {/* Price Range */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Max Price</h3>
              <span className="text-sm font-semibold text-blue-600">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="300"
              max="3000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>৳300</span>
              <span>৳3,000</span>
            </div>
          </div>

          {/* Size filter */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {SIZES_GENERAL.map((size) => {
                const isSelected = filters.sizes?.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`w-10 h-10 border rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold'
                        : 'border-gray-200 text-gray-600 hover:border-blue-400'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={clearFilters}
            className="w-full py-2.5 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 bg-white rounded-xl text-sm font-semibold transition-colors"
          >
            Clear All Filters
          </button>
        </aside>

        {/* Product Grid content */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm mt-10">
              <span className="text-4xl">🛍️</span>
              <h3 className="text-lg font-bold text-gray-900 mt-4">No Products in Category</h3>
              <p className="text-sm text-gray-500 mt-2">
                We couldn&apos;t find any items in this category matching your filters. Try exploring other collections.
              </p>
              <Link
                href="/shop"
                className="mt-5 inline-block px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Browse All Shop
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 md:hidden">
          <div className="w-80 bg-white h-full overflow-y-auto p-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                <span className="font-bold text-lg text-gray-900">Filters</span>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Max Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Max Price</span>
                  <span className="text-sm font-semibold text-blue-600">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="3000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {SIZES_GENERAL.map((size) => {
                    const isSelected = filters.sizes?.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`w-9 h-9 border rounded-lg text-xs font-semibold ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  clearFilters();
                  setShowMobileFilters(false);
                }}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold text-center"
              >
                Clear
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold text-center hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
