'use client';

import { useEffect, useState } from 'react';
import { getReferralSettings, updateReferralSettings, getAllReferrals, type ReferralSettings, type Referral } from '@/lib/db';
import { Settings, Save, CheckCircle2, Clock, XCircle, AlertCircle, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReferralsPage() {
  const [settings, setSettings] = useState<ReferralSettings>({
    isActive: true,
    isReferredDiscountEnabled: true,
    defaultReferralDiscountPct: 10,
    referrerRewardPoints: 50,
    referredDiscountPct: 10,
    minOrderAmount: 0,
    discountType: 'percent',
    discountValue: 10,
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getReferralSettings(),
      getAllReferrals()
    ]).then(([s, r]) => {
      if (s) setSettings(s);
      setReferrals(r);
      setLoading(false);
    });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateReferralSettings(settings);
      toast.success('Referral settings updated!');
    } catch (err) {
      toast.error('Failed to update settings');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const totalPoints = referrals.filter(r => r.status === 'rewarded').reduce((acc, curr) => acc + curr.earnedPoints, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Global Settings</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
              <input 
                type="checkbox" 
                checked={settings.isActive}
                onChange={e => setSettings({...settings, isActive: e.target.checked})}
                className="w-5 h-5 rounded border-gray-300 text-blue-600"
              />
              <div>
                <span className="font-bold block">Enable Referral Program</span>
                <span className="text-xs text-gray-500 block">Turn the entire referral program ON or OFF globally.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
              <input 
                type="checkbox" 
                checked={settings.isReferredDiscountEnabled}
                onChange={e => setSettings({...settings, isReferredDiscountEnabled: e.target.checked})}
                className="w-5 h-5 rounded border-gray-300 text-blue-600"
              />
              <div>
                <span className="font-bold block">Enable Referral Discounts</span>
                <span className="text-xs text-gray-500 block">Allow referred users to get discounts using codes.</span>
              </div>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Global Discount Type</label>
                <select 
                  value={settings.discountType || 'percent'}
                  onChange={e => setSettings({...settings, discountType: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-blue-500"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (৳)</option>
                  <option value="free_delivery">Free Delivery</option>
                </select>
              </div>
              
              {settings.discountType !== 'free_delivery' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Global Discount Value</label>
                  <input 
                    type="number"
                    min="0"
                    value={settings.discountValue ?? settings.defaultReferralDiscountPct ?? 10}
                    onChange={e => setSettings({...settings, discountValue: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Reward Points (Referrer)</label>
              <input 
                type="number"
                min="0"
                value={settings.referrerRewardPoints || 50}
                onChange={e => setSettings({...settings, referrerRewardPoints: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Points given to referrer when order is Delivered.</p>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Total Referrals</p>
              <p className="text-3xl font-black text-gray-900">{referrals.length}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border p-6 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Total Points Issued</p>
              <p className="text-3xl font-black text-gray-900">{totalPoints}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Recent Referrals</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-gray-500 font-medium">Referred Email</th>
                <th className="pb-3 text-gray-500 font-medium">Order ID</th>
                <th className="pb-3 text-gray-500 font-medium">Status</th>
                <th className="pb-3 text-gray-500 font-medium">Points</th>
                <th className="pb-3 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(ref => (
                <tr key={ref.id} className="border-b last:border-0">
                  <td className="py-4 font-medium text-gray-900">{ref.referredUserEmail}</td>
                  <td className="py-4 font-mono text-blue-600">{ref.orderId}</td>
                  <td className="py-4">
                    {ref.status === 'pending' && <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md text-xs font-bold"><Clock className="w-3 h-3" /> Pending</span>}
                    {ref.status === 'rewarded' && <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-md text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> Rewarded</span>}
                    {ref.status === 'cancelled' && <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-md text-xs font-bold"><XCircle className="w-3 h-3" /> Cancelled</span>}
                    {ref.status === 'rejected' && <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-md text-xs font-bold"><AlertCircle className="w-3 h-3" /> Rejected</span>}
                  </td>
                  <td className="py-4 text-green-600 font-bold">{ref.earnedPoints}</td>
                  <td className="py-4 text-gray-500">{new Date(ref.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
