'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Trash2, FolderTree, Loader2, Upload } from 'lucide-react';
import { getCategories, createCategory, deleteCategory } from '@/lib/db';
import type { Category } from '@/types/product';

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '', image: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCategories().then(data => {
      setCats(data);
      setLoading(false);
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setNewCat(prev => ({ ...prev, image: data.url }));
    setImagePreview(data.url);
    setUploading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name || !newCat.image || !newCat.slug) return;
    setSaving(true);
    const created = await createCategory(
      { name: newCat.name, slug: newCat.slug, image: newCat.image },
      newCat.slug
    );
    setCats([...cats, created]);
    setNewCat({ name: '', slug: '', image: '' });
    setImagePreview('');
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await deleteCategory(id);
    setCats(cats.filter(c => c.id !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* List */}
      <div className="md:col-span-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" /> Manage Categories
          </h1>
          <p className="text-xs text-gray-500 mt-1">{loading ? 'Loading...' : `${cats.length} categories`}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 uppercase font-bold text-[10px]">
                  <th className="pb-3">Image</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Slug</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {cats.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="py-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100">
                        <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                      </div>
                    </td>
                    <td className="py-3 font-bold text-gray-900">{cat.name}</td>
                    <td className="py-3 font-mono text-gray-400">{cat.slug}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Form */}
      <div className="md:col-span-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
        <h2 className="font-bold text-gray-900 text-sm border-b pb-3 border-gray-100">Add Category</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Category Name</label>
            <input
              type="text"
              required
              value={newCat.name}
              onChange={(e) => {
                const val = e.target.value;
                setNewCat({ ...newCat, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') });
              }}
              className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Winter Collection"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Custom ID / Slug</label>
            <input
              type="text"
              required
              value={newCat.slug}
              onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
              className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. winter-collection"
            />
            <p className="text-[10px] text-gray-400 mt-1">This will be the document ID in Firebase and URL slug.</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Category Image</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl h-24 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              <span className="text-xs">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
            </button>
            {imagePreview && (
              <div className="relative w-full h-24 rounded-xl overflow-hidden border mt-2">
                <Image src={imagePreview} alt="Preview" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || uploading || !newCat.image}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Add Category'}
          </button>
        </form>
      </div>
    </div>
  );
}
