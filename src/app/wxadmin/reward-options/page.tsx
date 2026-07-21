'use client';

import { useEffect, useState } from 'react';
import { getRewardOptions, createRewardOption, updateRewardOption, deleteRewardOption, type RewardOption } from '@/lib/db';
import { Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminRewardOptionsPage() {
  const [options, setOptions] = useState<RewardOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<Partial<RewardOption>>({
    title: '',
    description: '',
    pointsCost: 100,
    discountType: 'percent',
    discountValue: 10,
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const data = await getRewardOptions();
      setOptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleEdit = (opt: RewardOption) => {
    setFormData(opt);
    setEditingId(opt.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this option?')) return;
    try {
      await deleteRewardOption(id);
      toast.success('Deleted successfully');
      fetchOptions();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRewardOption(editingId, formData);
        toast.success('Updated successfully');
      } else {
        await createRewardOption(formData as Omit<RewardOption, 'id' | 'createdAt'>);
        toast.success('Created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        pointsCost: 100,
        discountType: 'percent',
        discountValue: 10,
        isActive: true,
      });
      fetchOptions();
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Voucher Templates (Reward Options)</h1>
        <button 
          onClick={() => {
            setFormData({
              title: '', description: '', pointsCost: 100, discountType: 'percent', discountValue: 10, isActive: true
            });
            setEditingId(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Voucher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map(opt => (
          <div key={opt.id} className={`border rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between ${!opt.isActive ? 'opacity-60' : ''}`}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900">{opt.title}</h3>
                <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-lg text-xs">
                  {opt.pointsCost} pts
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{opt.description}</p>
              <div className="text-xl font-black text-blue-600 mb-4">
                {opt.discountType === 'percent' ? `${opt.discountValue}% OFF` : opt.discountType === 'fixed' ? `৳${opt.discountValue} OFF` : 'Free Delivery'}
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <button onClick={() => handleEdit(opt)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button onClick={() => handleDelete(opt.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
        {options.length === 0 && <p className="text-gray-500 col-span-3">No templates created yet.</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900 text-lg">
                {editingId ? 'Edit Voucher Template' : 'New Voucher Template'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-xl p-3 focus:outline-none focus:border-blue-500 text-sm" placeholder="e.g. 10% OFF Voucher" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-xl p-3 focus:outline-none focus:border-blue-500 text-sm" placeholder="Explain what it does..." rows={2}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Points Cost</label>
                  <input required type="number" value={formData.pointsCost} onChange={e => setFormData({...formData, pointsCost: Number(e.target.value)})} className="w-full border rounded-xl p-3 focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Discount Type</label>
                  <select required value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value as any})} className="w-full border rounded-xl p-3 focus:outline-none focus:border-blue-500 text-sm bg-white">
                    <option value="percent">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
              </div>
              {formData.discountType !== 'free_delivery' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Discount Value</label>
                  <input required type="number" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} className="w-full border rounded-xl p-3 focus:outline-none focus:border-blue-500 text-sm" />
                </div>
              )}
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-blue-600" />
                <span className="font-bold">Active (Available for users)</span>
              </label>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center gap-2">
                <Save className="w-5 h-5" /> {editingId ? 'Save Changes' : 'Create Template'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
