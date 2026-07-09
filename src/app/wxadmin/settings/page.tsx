'use client';

import { useState, useEffect } from 'react';
import { Save, Check, Loader2, Plus, Trash2 } from 'lucide-react';
import { getStoreSettings, updateStoreSettings, type StoreSettings } from '@/lib/db';
import { DISTRICTS } from '@/constants/locations';

export default function AdminSettingsPage() {
  const [store, setStore] = useState<StoreSettings>({
    email: '',
    phone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    defaultDeliveryCharge: 120,
    districtDeliveryCharges: {},
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotify, setSavedNotify] = useState(false);

  const [newDistrict, setNewDistrict] = useState('');
  const [newCharge, setNewCharge] = useState('');

  useEffect(() => {
    getStoreSettings().then(data => {
      setStore(data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateStoreSettings(store);
    setSaving(false);
    setSavedNotify(true);
    setTimeout(() => setSavedNotify(false), 3000);
  };

  const addDistrictCharge = () => {
    if (!newDistrict || !newCharge) return;
    setStore(prev => ({
      ...prev,
      districtDeliveryCharges: {
        ...prev.districtDeliveryCharges,
        [newDistrict]: Number(newCharge)
      }
    }));
    setNewDistrict('');
    setNewCharge('');
  };

  const removeDistrictCharge = (district: string) => {
    setStore(prev => {
      const next = { ...prev.districtDeliveryCharges };
      delete next[district];
      return { ...prev, districtDeliveryCharges: next };
    });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="border-b pb-4 border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-xs text-gray-500 mt-1">Configure global store details, delivery charges, and contact info.</p>
        </div>
      </div>

      {savedNotify && (
        <div className="bg-green-50 text-green-700 text-xs px-3 py-2 rounded-xl border border-green-150 flex items-center gap-2 font-medium">
          <Check className="w-4 h-4" /> Store settings saved successfully!
        </div>
      )}

      {/* Form content */}
      <form onSubmit={handleSubmit} className="space-y-8 text-xs sm:text-sm">
        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Support Email</label>
              <input type="email" required value={store.email} onChange={e => setStore({...store, email: e.target.value})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Phone Number</label>
              <input type="text" required value={store.phone} onChange={e => setStore({...store, phone: e.target.value})}
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">WhatsApp Number (For Floating Button)</label>
              <input type="text" required value={store.whatsapp} onChange={e => setStore({...store, whatsapp: e.target.value})}
                placeholder="e.g. +8801700000000"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            {/* Social Links */}
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Facebook Link</label>
              <input type="url" value={store.facebook || ''} onChange={e => setStore({...store, facebook: e.target.value})}
                placeholder="https://facebook.com/..."
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Instagram Link</label>
              <input type="url" value={store.instagram || ''} onChange={e => setStore({...store, instagram: e.target.value})}
                placeholder="https://instagram.com/..."
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Delivery Charges */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Delivery Charges</h3>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Default Delivery Charge (BDT ৳)</label>
            <input type="number" required value={store.defaultDeliveryCharge} onChange={e => setStore({...store, defaultDeliveryCharge: Number(e.target.value)})}
              className="w-full sm:w-1/2 border border-gray-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-[10px] text-gray-500 mt-1">This charge applies to all districts unless a specific override is added below.</p>
          </div>

          <div className="mt-6 border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-4">
            <label className="block text-xs font-bold text-gray-700">Specific District Delivery Charges</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select value={newDistrict} onChange={e => setNewDistrict(e.target.value)} className="flex-1 border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none">
                <option value="">Select District</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="number" placeholder="Charge (৳)" value={newCharge} onChange={e => setNewCharge(e.target.value)}
                className="w-full sm:w-32 border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none" />
              <button type="button" onClick={addDistrictCharge} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shrink-0">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="space-y-2 mt-4">
              {Object.entries(store.districtDeliveryCharges).length === 0 && (
                <p className="text-xs text-gray-500 italic">No specific district charges. Default charge will be used everywhere.</p>
              )}
              {Object.entries(store.districtDeliveryCharges).map(([dist, charge]) => (
                <div key={dist} className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-xl">
                  <span className="font-semibold text-gray-700 text-sm">{dist}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-blue-600">৳{charge}</span>
                    <button type="button" onClick={() => removeDistrictCharge(dist)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-all text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
