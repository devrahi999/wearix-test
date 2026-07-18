'use client';

import { useState, useEffect } from 'react';
import { getCampaigns, saveCampaign, updateCampaign, deleteCampaign, type Campaign, getCategories } from '@/lib/db';
import type { Category } from '@/types/product';
import { Loader2, Plus, Zap, Save, Settings2, Trash2, Edit, X, Pencil, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';

const emptyForm: Omit<Campaign, 'id' | 'createdAt'> = {
  type: 'buy_more',
  title: '',
  description: '',
  isActive: true,
  minQty: 2,
  discountPct: 5,
  minOrderAmount: 1499,
  categories: [],
  startDate: '',
  endDate: ''
};

export default function CampaignManagementPage() {
  const { confirm } = useConfirm();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCampaigns(), getCategories()]).then(([camps, cats]) => {
      setCampaigns(camps);
      setCategories(cats);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      toast.error('Failed to load campaigns. Check permissions.');
      setLoading(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else if (type === 'number') {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateCampaign(editingId, form);
        setCampaigns(prev => prev.map(c => c.id === editingId ? { ...c, ...form } : c));
        toast.success('Campaign updated');
      } else {
        const saved = await saveCampaign(form);
        setCampaigns(prev => [saved, ...prev]);
        toast.success('Campaign created');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save campaign');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ message: 'Delete this campaign?' });
    if (!ok) return;
    try {
      await deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast.success('Deleted successfully');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (c: Campaign) => {
    try {
      await updateCampaign(c.id, { isActive: !c.isActive });
      setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
      toast.success(c.isActive ? 'Deactivated' : 'Activated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" /> Campaigns & Promotions
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage buy more & free delivery rules.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition"
          >
            <Plus className="w-5 h-5" /> Add Campaign
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">{editingId ? 'Edit Campaign' : 'Create New Campaign'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:bg-gray-200 p-1.5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-4 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Campaign Type *</label>
                <select name="type" required value={form.type} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="buy_more">Buy More, Save More (Percentage)</option>
                  <option value="free_delivery">Free Delivery (Min Order)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Title *</label>
                <input type="text" name="title" required value={form.title} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Free Delivery above ৳1499" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Short description for the user..." />
              </div>

              {form.type === 'buy_more' ? (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Min Quantity *</label>
                    <input type="number" name="minQty" min="1" required value={form.minQty} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Discount Percentage (%) *</label>
                    <input type="number" name="discountPct" min="1" max="100" required value={form.discountPct} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Min Order Amount (৳) *</label>
                  <input type="number" name="minOrderAmount" min="0" required value={form.minOrderAmount} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Start Date (Optional)</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">End Date (Optional)</label>
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Apply to Categories (Leave empty for ALL products)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(form.categories || []).map(catSlug => {
                  const catName = categories.find(c => c.slug === catSlug)?.name || catSlug;
                  return (
                    <span key={catSlug} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                      {catName}
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, categories: prev.categories.filter(c => c !== catSlug) }))} className="hover:text-blue-900 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
              <select value="" onChange={e => {
                  const val = e.target.value;
                  if (val && !(form.categories || []).includes(val)) {
                    setForm(prev => ({ ...prev, categories: [...(prev.categories || []), val] }));
                  }
                }}
                className="w-full max-w-sm border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">+ Add a Category</option>
                {categories.filter(c => !(form.categories || []).includes(c.slug)).map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <label className="flex items-center gap-2 text-sm cursor-pointer w-fit pt-2">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              <span className="font-medium text-gray-700">Active Status</span>
            </label>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2.5 font-bold rounded-xl flex items-center gap-2 transition text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : editingId ? 'Update Campaign' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {!showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          {campaigns.length === 0 ? <p className="text-center text-gray-400 text-sm py-10">No campaigns found.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 uppercase font-bold text-[10px]">
                    <th className="pb-3">Title / Type</th>
                    <th className="pb-3">Condition & Reward</th>
                    <th className="pb-3">Categories</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-4">
                        <p className="font-bold text-gray-900">{c.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Settings2 className="w-3 h-3" />
                          {c.type === 'buy_more' ? 'Buy More, Save More' : 'Free Delivery'}
                        </p>
                      </td>
                      <td className="py-4">
                        {c.type === 'buy_more' ? (
                          <div className="text-xs">
                            <span className="font-bold text-gray-700">Min:</span> {c.minQty} items <br/>
                            <span className="font-bold text-blue-600">{c.discountPct}% OFF</span>
                          </div>
                        ) : (
                          <div className="text-xs">
                            <span className="font-bold text-gray-700">Min Order:</span> ৳{c.minOrderAmount} <br/>
                            <span className="font-bold text-emerald-600">FREE Delivery</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        {(!c.categories || c.categories.length === 0) ? (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold">ALL PRODUCTS</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {c.categories.map(cat => (
                              <span key={cat} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold">{categories.find(x => x.slug === cat)?.name || cat}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        {c.isActive ? (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><Check className="w-3 h-3" /> Active</span>
                        ) : (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-bold w-fit">Inactive</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setForm(c as any); setEditingId(c.id); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 transition">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleToggle(c)} className="transition hover:scale-110">
                            {c.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-300" />}
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
