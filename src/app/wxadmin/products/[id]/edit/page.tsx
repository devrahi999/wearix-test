'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Upload, Plus, X, Loader2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getProductById, updateProduct, getCategories } from '@/lib/db';
import type { Category } from '@/types/product';
import type { Product } from '@/types/product';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params.id as string) || '';
  const fileRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    gender: 'men' as 'men' | 'women' | 'kids' | 'unisex',
    price: '',
    discountPrice: '',
    tags: '',
    rating: '5.0',
    reviewCount: '1',
    soldCount: '0',
    colors: '',
    isFeatured: false,
    isActive: true,
    isFlashSale: false,
    isOutOfStock: false,
    isFullCodEnabled: false,
    isFreeDelivery: false,
  });

  const [stock, setStock] = useState<Record<string, number>>({});
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([getProductById(id), getCategories()]).then(([p, cats]) => {
      setCategories(cats);
      if (p) {
        setProduct(p);
        setForm({
          name: p.name || '',
          slug: p.slug || id,
          description: p.description || '',
          category: p.category || '',
          gender: p.gender || 'men',
          price: (p.price || '').toString(),
          discountPrice: p.discountPrice ? p.discountPrice.toString() : '',
          tags: (p.tags || []).join(', '),
          rating: p.rating !== undefined ? p.rating.toString() : '5.0',
          reviewCount: p.reviewCount !== undefined ? p.reviewCount.toString() : '1',
          soldCount: p.soldCount !== undefined ? p.soldCount.toString() : '0',
          colors: (p.colors || []).join(', '),
          isFeatured: !!p.isFeatured,
          isActive: !!p.isActive,
          isFlashSale: !!p.isFlashSale,
          isOutOfStock: !!p.isOutOfStock,
          isFullCodEnabled: !!p.isFullCodEnabled,
          isFreeDelivery: !!p.isFreeDelivery,
        });
        setImages(p.images || []);
        setSelectedSizes(p.sizes || []);
      }
      setFetching(false);
    });
  }, [id]);

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(prev => prev.filter(s => s !== size));
    } else {
      setSelectedSizes(prev => [...prev, size]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    setImages(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setError('');
    if (!images.length) { setError('Please upload at least one product image.'); return; }
    if (!selectedSizes.length) { setError('Please select at least one size.'); return; }
    setSaving(true);
    try {
      await updateProduct(id, {
        name: form.name,
        description: form.description,
        category: form.category,
        gender: form.gender,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        images,
        sizes: selectedSizes,
        colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        rating: Number(form.rating) || 5,
        reviewCount: Number(form.reviewCount) || 1,
        soldCount: Number(form.soldCount) || 0,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        isFlashSale: form.isFlashSale,
        isOutOfStock: form.isOutOfStock,
        isFullCodEnabled: form.isFullCodEnabled,
        isFreeDelivery: form.isFreeDelivery,
        stock: {},
      });
      router.push('/wxadmin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to update product.');
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Product not found</h2>
        <Link href="/wxadmin/products" className="text-blue-600 font-medium">Go back to products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/wxadmin/products" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-xs text-gray-500">Update {product.name}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-sm">Product Images *</h2>
          <div className="flex flex-wrap gap-4">
            {images.map((url, idx) => (
              <div key={idx} className="relative w-24 h-32 rounded-xl border bg-gray-50 overflow-hidden group">
                <Image src={url} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-sm">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="w-24 h-32 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
              {uploading ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />}
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500 text-center px-2">
                {uploading ? 'Uploading...' : 'Upload Image'}
              </span>
              <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-sm">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Product Title *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g. Premium Cotton Shirt"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Description *</label>
              <textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Category *</label>
              <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value as any})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="men">Men</option><option value="women">Women</option>
                <option value="kids">Kids</option><option value="unisex">Unisex</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Regular Price (৳) *</label>
              <input type="number" required min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sale Price (৳)</label>
              <input type="number" min="0" value={form.discountPrice} onChange={e => setForm({...form, discountPrice: e.target.value})}
                placeholder="Optional"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {Number(form.price) > 0 && Number(form.discountPrice) > 0 && Number(form.discountPrice) < Number(form.price) && (
                <p className="text-xs text-green-600 mt-1.5 font-bold">
                  {Math.round(((Number(form.price) - Number(form.discountPrice)) / Number(form.price)) * 100)}% Off
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-sm">Available Sizes *</h2>
          <div className="flex flex-wrap gap-2">
            {SIZES.map(s => (
              <button type="button" key={s} onClick={() => handleSizeToggle(s)}
                className={`w-10 h-10 rounded-xl text-sm font-bold border transition-colors ${
                  selectedSizes.includes(s) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-500 hover:border-blue-300'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Details & Visibility */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-sm">Details & Visibility</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Colors (Comma separated)</label>
              <input value={form.colors} onChange={e => setForm({...form, colors: e.target.value})}
                placeholder="Black, White, Navy"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tags (Comma separated)</label>
              <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
                placeholder="summer, casual"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Rating (Out of 5.0)</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Total Reviews</label>
              <input type="number" min="0" value={form.reviewCount} onChange={e => setForm({...form, reviewCount: e.target.value})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Total Sold</label>
              <input type="number" min="0" value={form.soldCount} onChange={e => setForm({...form, soldCount: e.target.value})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-sm font-medium text-gray-700">Product is Active (Visible)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-sm font-bold text-gray-700">Feature on Homepage</span>
            </label>
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="checkbox" checked={form.isFlashSale} onChange={e => setForm({...form, isFlashSale: e.target.checked})}
                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500" />
              <span className="text-sm font-bold text-gray-700">Add to Flash Sale</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isOutOfStock} onChange={e => setForm({...form, isOutOfStock: e.target.checked})}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500" />
              <span className="text-sm font-medium text-red-600">Mark as Out of Stock</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Delivery & Payment Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={form.isFullCodEnabled} onChange={e => setForm({...form, isFullCodEnabled: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Full COD Enabled</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Allow ordering without advance delivery charge</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={form.isFreeDelivery} onChange={e => setForm({...form, isFreeDelivery: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Free Delivery</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Order will have 0 delivery charge</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving || uploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors w-full sm:w-auto">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
