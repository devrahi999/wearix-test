'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit, Loader2, Upload, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { getAllHeroBanners, saveHeroBanner, deleteHeroBanner, type HeroBanner } from '@/lib/db';

const empty: Omit<HeroBanner, 'id'> = {
  title: '', subtitle: '', imageUrl: '', link: '', buttonText: 'Shop Now', isActive: true, order: 0
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<HeroBanner, 'id'>>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllHeroBanners().then(d => { setBanners(d); setLoading(false); });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setForm(prev => ({ ...prev, imageUrl: data.url }));
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const saved = await saveHeroBanner(form, editId || undefined);
    if (editId) {
      setBanners(prev => prev.map(b => b.id === editId ? saved : b));
    } else {
      setBanners(prev => [...prev, saved]);
    }
    setForm(empty); setEditId(null); setSaving(false);
  };

  const handleEdit = (b: HeroBanner) => {
    const { id, ...rest } = b;
    setForm(rest); setEditId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await deleteHeroBanner(id);
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const handleToggle = async (b: HeroBanner) => {
    await saveHeroBanner({ ...b, isActive: !b.isActive } as any, b.id);
    setBanners(prev => prev.map(x => x.id === b.id ? { ...x, isActive: !x.isActive } : x));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Form */}
      <div className="md:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
        <h2 className="font-bold text-gray-900 text-sm border-b pb-3 border-gray-100">
          {editId ? 'Edit Banner' : 'Add Hero Banner'}
        </h2>
        <form onSubmit={handleSave} className="space-y-3 text-sm">
          {[['Link (e.g. /shop/jerseys)', 'link']].map(([label, key]) => (
            <div key={key}>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</label>
              <input required value={(form as any)[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Display Order</label>
            <input type="number" min="0" value={form.order} onChange={e => setForm(prev => ({ ...prev, order: Number(e.target.value) }))}
              className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Banner Image</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl h-20 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-blue-500 transition-colors text-xs">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {uploading ? 'Uploading...' : 'Upload image'}
            </button>
            {form.imageUrl && (
              <div className="relative w-full h-24 rounded-xl overflow-hidden border mt-2">
                <Image src={form.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))} />
            <span className="font-medium text-gray-700">Active (show on site)</span>
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={saving || !form.imageUrl}
              className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {editId ? 'Update Banner' : 'Add Banner'}
            </button>
            {editId && (
              <button type="button" onClick={() => { setForm(empty); setEditId(null); }}
                className="px-4 h-10 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="md:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Hero Banners</h1>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : banners.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No banners yet. Add one!</p>
        ) : (
          <div className="space-y-3">
            {banners.map(b => (
              <div key={b.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  {b.imageUrl && <Image src={b.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 text-sm truncate">Banner {b.order}</p>
                  <p className="text-xs text-blue-600 truncate">{b.link}</p>
                  <p className="text-[10px] text-gray-400">Order: {b.order}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleToggle(b)} title={b.isActive ? 'Disable' : 'Enable'}>
                    {b.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                  </button>
                  <button onClick={() => handleEdit(b)} className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-200">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
