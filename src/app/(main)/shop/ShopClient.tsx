'use client';

import { useState, useMemo, useEffect } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { SIZES_GENERAL } from '@/constants';
import { ProductFilters, Gender, Product, Category } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { Grid, ListFilter, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { getProducts, getCategories } from '@/lib/db';

export default function ShopClient({ initialProducts = [], initialCategories = [] }: { initialProducts?: Product[], initialCategories?: Category[] }) {
  const [filters, setFilters] = useState<ProductFilters>({
    sizes: [],
    colors: [],
    sort: 'newest',
  });
  const [selectedGender, setSelectedGender] = useState<Gender | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [dbLoading, setDbLoading] = useState(initialProducts.length === 0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    Promise.all([getProducts(), getCategories()]).then(([prods, cats]) => {
      setAllProducts(prods.filter(p => p.isActive));
      setCategories(cats);
      setDbLoading(false);
    });
  }, []);

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
    setSelectedGender('all');
    setSelectedCategory('all');
    setMaxPrice(3000);
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filter by gender
    if (selectedGender !== 'all') {
      result = result.filter(
        (p) => p.gender === selectedGender || p.gender === 'unisex'
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase() || p.categories?.some(c => c.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

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
  }, [selectedGender, selectedCategory, maxPrice, filters, allProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGender, selectedCategory, maxPrice, filters]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-5 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">
            {dbLoading ? 'Loading products...' : `Showing ${filteredProducts.length} of ${allProducts.length} fashion items`}
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
          {/* Gender */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Gender</h3>
            <div className="flex flex-col gap-2">
              {['all', 'men', 'women', 'kids'].map((gender) => (
                <label key={gender} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={selectedGender === gender}
                    onChange={() => setSelectedGender(gender as any)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="capitalize">{gender}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Category</h3>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === 'all'}
                  onChange={() => setSelectedCategory('all')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span>All Categories</span>
              </label>
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat.slug}
                    onChange={() => setSelectedCategory(cat.slug)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

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
          {paginatedProducts.length > 0 ? (
            <>
              <ProductGrid products={paginatedProducts} />
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${
                          currentPage === i + 1
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm mt-10">
              <span className="text-4xl">🔍</span>
              <h3 className="text-lg font-bold text-gray-900 mt-4">No Products Found</h3>
              <p className="text-sm text-gray-500 mt-2">
                We couldn't find any items matching your filter criteria. Try clearing them to see all catalog items.
              </p>
              <button
                onClick={clearFilters}
                className="mt-5 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
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

              {/* Gender */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'men', 'women', 'kids'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setSelectedGender(gender as any)}
                      className={`px-4 py-2 rounded-xl border text-sm capitalize ${
                        selectedGender === gender
                          ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</p>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
