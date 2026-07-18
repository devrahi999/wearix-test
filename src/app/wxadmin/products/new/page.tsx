'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Plus, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createProduct, getCategories } from '@/lib/db';
import type { Category } from '@/types/product';
import { useEffect } from 'react';

// Removed SIZES constant as we're using a text input

export default function NewProductPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    gender: 'men' as 'men' | 'women' | 'kids' | 'unisex',
    basePrice: '',
    price: '',
    discountPrice: '',
    rating: '5.0',
    reviewCount: '1',
    soldCount: '0',
    tags: '',
    colors: '',
    isFeatured: false,
    isActive: true,
    isFlashSale: false,
    isOutOfStock: false,
    isFullCodEnabled: false,
    isFreeDelivery: false,
    discountPercent: '',
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryToggle = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(prev => prev.filter(c => c !== cat));
    } else {
      setSelectedCategories(prev => [...prev, cat]);
    }
  };

  const [sizesStr, setSizesStr] = useState<string>('M, L, XL');

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
    setError('');
    const selectedSizes = sizesStr.split(',').map(s => s.trim()).filter(Boolean);
    if (!images.length) { setError('Please upload at least one product image.'); return; }
    if (!selectedSizes.length) { setError('Please enter at least one size.'); return; }
    if (!selectedCategories.length) { setError('Please select at least one category.'); return; }
    setSaving(true);
    try {
      const productSlug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      await createProduct({
        name: form.name,
        slug: productSlug,
        description: form.description,
        category: selectedCategories[0] || '',
        categories: selectedCategories,
        gender: form.gender,
        basePrice: form.basePrice ? Number(form.basePrice) : undefined,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        images,
        sizes: selectedSizes,
        colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
        stock: {},
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        rating: Number(form.rating) || 5,
        reviewCount: Number(form.reviewCount) || 1,
        soldCount: Number(form.soldCount) || 0,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        isFlashSale: form.isFlashSale,
        isOutOfStock: form.isOutOfStock,
        isFullCodEnabled: form.isFullCodEnabled,
        isFreeDelivery: form.isFreeDelivery,
      }, productSlug);
      router.push('/wxadmin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/wxadmin/products" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">Product Images</h2>
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative w-24 h-28 rounded-xl overflow-hidden border border-gray-200">
                <Image src={url} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-24 h-28 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-blue-500 transition-colors"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              <span className="text-[10px]">{uploading ? 'Uploading' : 'Add Image'}</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Product Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Slug (auto if empty)</label>
              <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})}
                placeholder="auto-generated"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Description *</label>
              <textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Categories *</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCategoryToggle(c.slug)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      selectedCategories.includes(c.slug)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              {selectedCategories.length === 0 && <p className="text-xs text-red-500 mt-1">Select at least one category.</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value as any})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Base Price / Buying Price (Admin only)</label>
              <input type="number" min="0" value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})}
                placeholder="Optional (Used for profit calculation)"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Regular Price (BDT) *</label>
              <input required type="number" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sale Price (optional)</label>
              <input type="number" min="0" value={form.discountPrice} onChange={e => {
                const dp = Number(e.target.value);
                const p = Number(form.price);
                setForm({...form, discountPrice: e.target.value, discountPercent: dp > 0 && p > 0 ? Math.round(((p - dp) / p) * 100).toString() : ''});
              }}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Discount Percent (%)</label>
              <input type="number" min="0" max="100" value={form.discountPercent} onChange={e => {
                const pct = Number(e.target.value);
                const p = Number(form.price);
                setForm({...form, discountPercent: e.target.value, discountPrice: pct > 0 && p > 0 ? Math.round(p - (p * pct / 100)).toString() : ''});
              }}
                placeholder="e.g. 10"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Colors (comma separated)</label>
              <input value={form.colors} onChange={e => setForm({...form, colors: e.target.value})}
                placeholder="Black, White, Red"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tags (comma separated)</label>
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
          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} />
              <span className="font-medium text-gray-700">Active (visible on site)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} />
              <span className="text-sm font-bold text-gray-700">Feature on Homepage</span>
            </label>
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="checkbox" checked={form.isFlashSale} onChange={e => setForm({...form, isFlashSale: e.target.checked})}
                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500" />
              <span className="text-sm font-bold text-gray-700">Add to Flash Sale</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isOutOfStock} onChange={e => setForm({...form, isOutOfStock: e.target.checked})} />
              <span className="font-medium text-red-600">Mark as Out of Stock</span>
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

        {/* Sizes */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">Available Sizes *</h2>
          <p className="text-xs text-gray-500 mb-2">Enter sizes separated by commas (e.g. S, M, L, XL or 28, 30, 32)</p>
          <input
            type="text"
            required
            value={sizesStr}
            onChange={(e) => setSizesStr(e.target.value)}
            placeholder="e.g. S, M, L, XL, XXL"
            className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {saving ? 'Saving Product...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
}
