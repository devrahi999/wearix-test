'use client';

import { useState, useEffect } from 'react';
import { getPromotionSettings, updatePromotionSettings, type PromotionSettings } from '@/lib/db';
import { Loader2, Zap, Save, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CampaignManagementPage() {
  const [settings, setSettings] = useState<PromotionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPromotionSettings().then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings({ ...settings, [name]: checked });
    } else if (type === 'number') {
      setSettings({ ...settings, [name]: Number(value) });
    } else {
      setSettings({ ...settings, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updatePromotionSettings(settings);
      toast.success('Campaign settings updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update campaign settings');
    }
    setSaving(false);
  };

  if (loading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" /> Campaign Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage global promotional offers and campaigns.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buy More, Save More */}
        <div className={`bg-white rounded-2xl border ${settings.buyMoreEnabled ? 'border-blue-200 ring-1 ring-blue-200' : 'border-gray-100'} shadow-sm overflow-hidden transition-all`}>
          <div className={`p-5 flex items-center justify-between border-b ${settings.buyMoreEnabled ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-blue-500" /> Buy More, Save More
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="buyMoreEnabled" checked={settings.buyMoreEnabled} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Promotion Title</label>
              <input type="text" name="buyMoreTitle" value={settings.buyMoreTitle} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
              <textarea name="buyMoreDesc" value={settings.buyMoreDesc} onChange={handleChange} rows={2} className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Min Quantity</label>
                <input type="number" name="buyMoreMinQty" min="2" value={settings.buyMoreMinQty} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Discount (%)</label>
                <input type="number" name="buyMoreDiscountPct" min="1" max="99" value={settings.buyMoreDiscountPct} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 mt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Start Date (Optional)</label>
                <input type="date" name="buyMoreStartDate" value={settings.buyMoreStartDate} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">End Date (Optional)</label>
                <input type="date" name="buyMoreEndDate" value={settings.buyMoreEndDate} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Free Delivery */}
        <div className={`bg-white rounded-2xl border ${settings.freeDeliveryEnabled ? 'border-emerald-200 ring-1 ring-emerald-200' : 'border-gray-100'} shadow-sm overflow-hidden transition-all`}>
          <div className={`p-5 flex items-center justify-between border-b ${settings.freeDeliveryEnabled ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-500" /> Free Delivery
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="freeDeliveryEnabled" checked={settings.freeDeliveryEnabled} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Promotion Title</label>
              <input type="text" name="freeDeliveryTitle" value={settings.freeDeliveryTitle} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
              <textarea name="freeDeliveryDesc" value={settings.freeDeliveryDesc} onChange={handleChange} rows={2} className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Min Order Amount (৳)</label>
              <input type="number" name="freeDeliveryMinOrder" min="0" value={settings.freeDeliveryMinOrder} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 mt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Start Date (Optional)</label>
                <input type="date" name="freeDeliveryStartDate" value={settings.freeDeliveryStartDate} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">End Date (Optional)</label>
                <input type="date" name="freeDeliveryEndDate" value={settings.freeDeliveryEndDate} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
