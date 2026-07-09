'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit, Loader2, Upload, ToggleLeft, ToggleRight } from 'lucide-react';
import { getPromoBanners, savePromoBanner, deletePromoBanner, getFlashSaleConfig, updateFlashSaleConfig, type PromoBanner, type FlashSaleConfig } from '@/lib/db';

const emptyPromo: Omit<PromoBanner, 'id'> = {
  title: '', subtitle: '', imageUrl: '', link: '', buttonText: 'Shop Now', isActive: true, order: 0
};

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<PromoBanner[]>([]);
  const [flashSale, setFlashSale] = useState<FlashSaleConfig>({ isActive: false, endsAt: '', label: '⚡ Flash Sale' });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<PromoBanner, 'id'>>(emptyPromo);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [flashSaving, setFlashSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([getPromoBanners(), getFlashSaleConfig()]).then(([promoData, flashData]) => {
      setPromos(promoData);
      if (flashData) setFlashSale(flashData);
      setLoading(false);
    });
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
    const saved = await savePromoBanner(form, editId || undefined);
    if (editId) setPromos(prev => prev.map(p => p.id === editId ? saved : p));
    else setPromos(prev => [...prev, saved]);
    setForm(emptyPromo); setEditId(null); setSaving(false);
  };

  const handleEdit = (p: PromoBanner) => {
    const { id, ...rest } = p;
    setForm(rest); setEditId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo box?')) return;
    await deletePromoBanner(id);
    setPromos(prev => prev.filter(p => p.id !== id));
  };

  const handleToggle = async (p: PromoBanner) => {
    await savePromoBanner({ ...p, isActive: !p.isActive } as any, p.id);
    setPromos(prev => prev.map(x => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
  };

  const handleFlashSave = async () => {
    setFlashSaving(true);
    await updateFlashSaleConfig(flashSale);
    setFlashSaving(false);
  };

  return (
    <div className="space-y-8">
      {/* Flash Sale Config */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">⚡ Flash Sale Configuration</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Label</label>
            <input value={flashSale.label} onChange={e => setFlashSale(prev => ({ ...prev, label: e.target.value }))}
              className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Ends At (ISO date)</label>
            <input type="datetime-local" value={flashSale.endsAt.slice(0, 16)} onChange={e => setFlashSale(prev => ({ ...prev, endsAt: new Date(e.target.value).toISOString() }))}
              className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 text-sm cursor-pointer mb-3">
              <input type="checkbox" checked={flashSale.isActive} onChange={e => setFlashSale(prev => ({ ...prev, isActive: e.target.checked }))} />
              <span className="font-medium text-gray-700">Flash Sale Active</span>
            </label>
            <button onClick={handleFlashSave} disabled={flashSaving}
              className="h-10 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-colors">
              {flashSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : '💾 Save Flash Sale'}
            </button>
          </div>
        </div>
      </div>

      {/* Promo Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Form */}
        <div className="md:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 h-fit">
          <h2 className="font-bold text-gray-900 text-sm border-b pb-3 border-gray-100">
            {editId ? 'Edit Promo Box' : 'Add Promo Box'}
          </h2>
          <form onSubmit={handleSave} className="space-y-3 text-sm">
            {[['Title', 'title'], ['Subtitle', 'subtitle'], ['Button Text', 'buttonText'], ['Link (e.g. /shop/jerseys)', 'link']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</label>
                <input required={key === 'title' || key === 'link'} value={(form as any)[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Display Order</label>
              <input type="number" min="0" value={form.order} onChange={e => setForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Box Image</label>
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
              <span className="font-medium text-gray-700">Active</span>
            </label>
            <div className="flex gap-2">
              <button type="submit" disabled={saving || !form.imageUrl}
                className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editId ? 'Update' : 'Add Promo Box'}
              </button>
              {editId && (
                <button type="button" onClick={() => { setForm(emptyPromo); setEditId(null); }}
                  className="px-4 h-10 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">Promo Boxes ({promos.length})</h2>
          {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            : promos.length === 0 ? <p className="text-center text-gray-400 text-sm py-10">No promo boxes yet.</p>
            : (
              <div className="space-y-3">
                {promos.map(p => (
                  <div key={p.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                    <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {p.imageUrl && <Image src={p.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-sm truncate">{p.title}</p>
                      <p className="text-xs text-blue-600 truncate">{p.link}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleToggle(p)}>
                        {p.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                      </button>
                      <button onClick={() => handleEdit(p)} className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-200"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
