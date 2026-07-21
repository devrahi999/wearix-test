'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, User as UserIcon, ShieldCheck, Package, CheckCircle, ExternalLink, Save } from 'lucide-react';
import { getUser, updateUser, getUserOrders, getReferralSettings, getReferralsByUser, type Referral } from '@/lib/db';
import type { Order } from '@/types/order';
import type { User } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

import { use } from 'react';
export default function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit states
  const [editData, setEditData] = useState<Partial<User>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const u = await getUser(resolvedParams.id);
        if (u) {
          setUser(u as User);
          setEditData(u);
        }
        const [o, r] = await Promise.all([
          getUserOrders(resolvedParams.id),
          getReferralsByUser(resolvedParams.id)
        ]);
        setOrders(o);
        setReferrals(r);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = { ...editData };
      if (!dataToSave.referCodeDiscountType) {
        const refSettings = await getReferralSettings();
        if (refSettings) {
          dataToSave.referCodeDiscountType = refSettings.discountType || 'percent';
          dataToSave.referCodeDiscountValue = refSettings.discountValue || refSettings.defaultReferralDiscountPct || 10;
        }
      }
      
      await updateUser(resolvedParams.id, dataToSave);
      setUser(dataToSave as User);
      toast.success('User updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (!user) {
    return <div className="py-20 text-center text-gray-500">User not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Customer Details</h1>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center relative">
            <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-sm overflow-hidden mb-4">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-blue-300" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.displayName || 'No Name'}</h2>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            
            <div className="mt-4 flex justify-center">
              <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <input 
                  type="checkbox" 
                  checked={editData.isAdmin || false} 
                  onChange={e => setEditData({ ...editData, isAdmin: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Admin Access</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Display Name</label>
                <input type="text" value={editData.displayName || ''} onChange={e => setEditData({...editData, displayName: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number</label>
                <input type="text" value={editData.phone || ''} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Reward Points</label>
                <input type="number" value={editData.rewardPoints || 0} onChange={e => setEditData({...editData, rewardPoints: Number(e.target.value)})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">First Order Discount Used?</label>
                <select value={String(editData.firstOrderUsed || false)} onChange={e => setEditData({...editData, firstOrderUsed: e.target.value === 'true'})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Referral & Orders */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
            <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Referral Settings</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-indigo-50">
                <p className="text-xs text-indigo-500 font-medium mb-1">Own Referral Code</p>
                <input type="text" value={editData.referralCode || ''} onChange={e => setEditData({...editData, referralCode: e.target.value.toUpperCase()})} className="w-full font-mono font-bold text-indigo-900 border-b border-indigo-100 pb-1 focus:outline-none focus:border-indigo-400 bg-transparent uppercase" placeholder="None" />
              </div>
              <div className="bg-white rounded-xl p-4 border border-indigo-50">
                <p className="text-xs text-indigo-500 font-medium mb-1">Referred By (Code)</p>
                <input type="text" value={editData.referredBy || ''} onChange={e => setEditData({...editData, referredBy: e.target.value.toUpperCase()})} className="w-full font-mono font-bold text-indigo-900 border-b border-indigo-100 pb-1 focus:outline-none focus:border-indigo-400 bg-transparent uppercase" placeholder="None" />
              </div>
            </div>

            <div className="space-y-4 bg-white p-5 rounded-xl border border-indigo-50">
              <label className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={editData.isReferredDiscountEnabled !== false} 
                  onChange={e => setEditData({ ...editData, isReferredDiscountEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                />
                <span className="text-sm font-bold text-gray-700">Allow discount for new users using this code</span>
              </label>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Type Override</label>
                  <select 
                    value={editData.referCodeDiscountType || ''} 
                    onChange={e => setEditData({...editData, referCodeDiscountType: e.target.value as any})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Use Global Default --</option>
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
                {editData.referCodeDiscountType && editData.referCodeDiscountType !== 'free_delivery' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Discount Value</label>
                    <input 
                      type="number" 
                      value={editData.referCodeDiscountValue || ''} 
                      onChange={e => setEditData({...editData, referCodeDiscountValue: Number(e.target.value)})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Referrals & Earned Points Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-indigo-500" /> Referrals Made & Points</h3>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">
                Total Earned: {user.totalEarnedPoints || 0} pts
              </span>
            </div>

            {referrals.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-xs">
                No referrals recorded for this user yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500 font-semibold uppercase">
                      <th className="pb-2">Referred User Email</th>
                      <th className="pb-2">Order ID</th>
                      <th className="pb-2">Earned Points</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {referrals.map(ref => (
                      <tr key={ref.id} className="hover:bg-gray-50 transition">
                        <td className="py-2.5 font-medium text-gray-900">{ref.referredUserEmail}</td>
                        <td className="py-2.5 font-mono text-gray-600">{ref.orderId ? `#${ref.orderId}` : 'Initial Signup'}</td>
                        <td className="py-2.5 font-bold text-green-600">+{ref.earnedPoints} pts</td>
                        <td className="py-2.5">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                            ref.status === 'rewarded' ? 'bg-green-100 text-green-700' :
                            ref.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {ref.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-500">{new Date(ref.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Orders Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Package className="w-5 h-5 text-gray-400" /> Order History</h3>
              <div className="text-sm">
                <span className="text-gray-500">Total Spent: </span>
                <span className="font-bold text-gray-900">{formatPrice(orders.filter(o => o.orderStatus !== 'cancelled').reduce((sum, o) => sum + o.total, 0))}</span>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
                No orders placed yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                      <th className="pb-3 font-medium">Order ID</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Total</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="py-3">
                          <Link href={`/wxadmin/orders?search=${order.id}`} className="font-bold text-blue-600 hover:underline flex items-center gap-1">
                            {order.id.slice(0,8)}... <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                        <td className="py-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 font-bold text-gray-900">{formatPrice(order.total)}</td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
