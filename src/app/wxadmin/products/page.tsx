'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, CheckCircle2, XCircle, Trash2, Edit, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getProducts, deleteProduct, updateProduct } from '@/lib/db';
import type { Product } from '@/types/product';
import { useConfirm } from '@/components/ui/ConfirmDialog';

export default function AdminProductsPage() {
  const { confirm } = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));

  const filtered = products.filter(
    (p) => {
      const matchesSearch = p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    }
  );

  const handleToggleActive = async (id: string, current: boolean) => {
    setTogglingId(id);
    await updateProduct(id, { isActive: !current });
    setProducts(products.map(p => p.id === id ? { ...p, isActive: !current } : p));
    setTogglingId(null);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ message: 'Are you sure you want to delete this product?' });
    if (!ok) return;
    await deleteProduct(id);
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manage Store Products</h1>
          <p className="text-xs text-gray-500 mt-1">
            {loading ? 'Loading...' : `${products.length} products in inventory`}
          </p>
        </div>
        <Link
          href="/wxadmin/products/new"
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full sm:w-48 border border-gray-200 px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Categories</option>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-10 text-sm">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 uppercase font-bold text-[10px]">
                <th className="pb-3">Product</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Sale Price</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Active</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {filtered.map((product) => {
                const outOfStock = product.isOutOfStock;
                return (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded overflow-hidden bg-gray-50 border shrink-0">
                          {product.images[0] && (
                            <img src={product.images[0]} alt="" className="object-cover w-full h-full" />
                          )}
                        </div>
                        <span className="font-bold text-gray-900 line-clamp-1 max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 capitalize">{product.category}</td>
                    <td className="py-3.5">{formatPrice(product.price)}</td>
                    <td className="py-3.5 text-red-600 font-semibold">
                      {product.discountPrice ? formatPrice(product.discountPrice) : '-'}
                    </td>
                    <td className="py-3.5 font-medium">
                      {outOfStock ? (
                        <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-[10px]">Out of stock</span>
                      ) : (
                        <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded text-[10px]">In Stock</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <button onClick={() => handleToggleActive(product.id, product.isActive)} disabled={togglingId === product.id}>
                        {togglingId === product.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        ) : product.isActive ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 text-right space-x-1.5 shrink-0">
                      <Link
                        href={`/wxadmin/products/${product.id}/edit`}
                        className="inline-flex p-1.5 border border-gray-200 rounded-lg hover:border-blue-200 text-gray-500 hover:text-blue-600"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="inline-flex p-1.5 border border-gray-200 rounded-lg hover:border-red-200 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
