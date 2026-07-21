'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRewardOptions, getUserRewardRequests, createRewardRequest, getUserVouchers, updateUser, type RewardOption, type RewardRequest, type UserVoucher } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { Gift, Loader2, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RedeemPointsPage() {
  const { user, loading, refreshUser } = useAuth();
  const { confirm } = useConfirm();
  const [options, setOptions] = useState<RewardOption[]>([]);
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);
  const [requests, setRequests] = useState<RewardRequest[]>([]);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      Promise.all([
        getRewardOptions(),
        getUserVouchers(user.uid),
        getUserRewardRequests(user.uid)
      ]).then(([opts, vchs, reqs]) => {
        setOptions(opts.filter(o => o.isActive));
        setVouchers(vchs);
        setRequests(reqs);
        setFetching(false);
      });
    }
  }, [user]);

  if (loading || fetching) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!user) return <div className="p-8 text-center text-gray-500">Please login.</div>;

  const handleRedeem = async (option: RewardOption) => {
    if ((user.rewardPoints || 0) < option.pointsCost) {
      toast.error('Not enough points to redeem this option.');
      return;
    }
    const ok = await confirm({ message: `Are you sure you want to redeem ${option.pointsCost} points for "${option.title}"?` });
    if (!ok) return;

    setSubmitting(option.id);
    try {
      const newPoints = (user.rewardPoints || 0) - option.pointsCost;
      
      const req = await createRewardRequest({
        userId: user.uid,
        userEmail: user.email || '',
        rewardOptionId: option.id,
        rewardOptionTitle: option.title,
        pointsToRedeem: option.pointsCost
      });
      
      await updateUser(user.uid, { rewardPoints: newPoints });
      
      setRequests([req, ...requests]);
      if (refreshUser) await refreshUser();
      toast.success('Redemption request submitted! Points deducted.');
    } catch (err) {
      toast.error('Failed to submit request.');
    } finally {
      setSubmitting(null);
    }
  };

  const getDiscountText = (type: string, value: number) => {
    if (type === 'percent') return `${value}% OFF`;
    if (type === 'free_delivery') return 'Free Delivery';
    return `${formatPrice(value)} OFF`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/account/referrals" className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Gift className="w-6 h-6 text-blue-600 hidden sm:block" />
        <h1 className="text-2xl font-bold text-gray-900">Redeem Points</h1>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl p-6 shadow-sm flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold opacity-90">Your Balance</h2>
          <p className="text-4xl font-black">{user.rewardPoints || 0} pts</p>
        </div>
      </div>

      {/* Available Reward Options */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Available Offers</h2>
        {options.length === 0 ? (
          <p className="text-gray-500">No offers available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map(opt => {
              const canAfford = (user.rewardPoints || 0) >= opt.pointsCost;
              return (
                <div key={opt.id} className="border rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900">{opt.title}</h3>
                      <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-lg text-xs shrink-0 ml-2">
                        {opt.pointsCost} pts
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{opt.description}</p>
                    <div className="text-lg font-black text-blue-600 mb-3">
                      {getDiscountText(opt.discountType, opt.discountValue)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRedeem(opt)}
                    disabled={!canAfford || submitting === opt.id}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                      canAfford ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {submitting === opt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Redeem Now'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Active Vouchers */}
      <div className="pt-8 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">My Active Vouchers</h2>
        {vouchers.filter(v => !v.isUsed).length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-500">You don't have any active vouchers yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.filter(v => !v.isUsed).map(voucher => (
              <div key={voucher.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 relative overflow-hidden group flex items-center justify-between gap-4">
                <div className="absolute -right-6 -top-6 w-20 h-20 bg-blue-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 flex-1">
                  <h3 className="font-bold text-blue-900 text-sm mb-0.5">{voucher.title}</h3>
                  <p className="text-xl font-black text-blue-600 mb-1.5">{getDiscountText(voucher.discountType, voucher.discountValue)}</p>
                  
                  {voucher.minOrderAmount ? (
                    <p className="text-xs text-blue-700 font-medium">Min. Order: {formatPrice(voucher.minOrderAmount)}</p>
                  ) : null}
                  
                  {voucher.validCategories && voucher.validCategories.length > 0 && (
                    <p className="text-xs text-blue-700">
                      Valid on: {voucher.validCategories.join(', ')}
                    </p>
                  )}
                  {voucher.validProducts && voucher.validProducts.length > 0 && (
                    <p className="text-xs text-blue-700">
                      Valid on specific products
                    </p>
                  )}
                  
                  <Link 
                    href={voucher.validCategories && voucher.validCategories.length === 1 ? `/category/${voucher.validCategories[0]}` : "/shop"} 
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg mt-4 hover:bg-blue-700 transition"
                  >
                    Shop Now <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Redemption History */}
      <div className="pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Request History</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">No past requests found.</p>
        ) : (
          <div className="bg-white border rounded-2xl p-0 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="p-4 text-gray-500 font-medium">Offer</th>
                    <th className="p-4 text-gray-500 font-medium">Points</th>
                    <th className="p-4 text-gray-500 font-medium">Status</th>
                    <th className="p-4 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50/50">
                      <td className="p-4 font-bold text-gray-900">{req.rewardOptionTitle || 'Custom Reward'}</td>
                      <td className="p-4 text-gray-600">{req.pointsToRedeem} pts</td>
                      <td className="p-4">
                        {req.status === 'pending' && <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md text-xs font-bold"><Clock className="w-3 h-3" /> Pending</span>}
                        {req.status === 'approved' && <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-md text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> Approved</span>}
                        {req.status === 'rejected' && <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-md text-xs font-bold"><XCircle className="w-3 h-3" /> Rejected</span>}
                      </td>
                      <td className="p-4 text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
