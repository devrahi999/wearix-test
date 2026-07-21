'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getReferralsByUser, getReferralSettings, createRewardRequest, type Referral, type ReferralSettings } from '@/lib/db';
import { SITE_URL } from '@/constants';
import toast from 'react-hot-toast';
import { Copy, Gift, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ReferralsPage() {
  const { user, loading } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [fetching, setFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      Promise.all([
        getReferralsByUser(user.uid),
        getReferralSettings()
      ]).then(([refs, sets]) => {
        setReferrals(refs);
        setSettings(sets);
        setFetching(false);
      });
    }
  }, [user]);

  if (loading || fetching) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  if (!user) return <div className="p-8 text-center text-gray-500">Please login.</div>;

  const referralLink = `${SITE_URL}/signup?ref=${user.referralCode || ''}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode || '');
    toast.success('Referral code copied!');
  };

  const handleRequestCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const points = user.rewardPoints || 0;
    if (points < 50) {
      toast.error('You need at least 50 points to redeem.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createRewardRequest({
        userId: user.uid,
        userEmail: user.email || '',
        pointsToRedeem: points
      });
      toast.success('Coupon request submitted! Admin will approve soon.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPending = referrals.filter(r => r.status === 'pending').reduce((s, r) => s + (r.earnedPoints || 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/account" className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Gift className="w-6 h-6 text-blue-600 hidden sm:block" />
        <h1 className="text-2xl font-bold text-gray-900">Referrals {'&'} Rewards</h1>
      </div>

      {!settings?.isActive && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Our referral program is currently paused. Please check back later.</p>
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold opacity-75 uppercase tracking-wide">Available Points</p>
          <p className="text-4xl font-black mt-1">{user.rewardPoints || 0}</p>
          <p className="text-xs opacity-70 mt-1">1 Pt = ৳1 Value</p>
        </div>
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Earned</p>
          <p className="text-4xl font-black text-gray-900 mt-1">{(user as any).totalEarnedPoints || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Points all-time</p>
        </div>
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending Points</p>
          <p className="text-4xl font-black text-yellow-500 mt-1">{totalPending}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting delivery</p>
        </div>
      </div>

      {/* Referral Link + Redeem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Referral Code */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-1">Your Referral Link</h2>
          <p className="text-sm text-gray-500 mb-4">
            Share this link. Friends get a discount on first order, you earn points on every order they make!
          </p>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-xs focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium flex items-center justify-between">
            <div>
              Your Code: <span className="font-bold text-lg ml-1">{user.referralCode}</span>
            </div>
            <button onClick={copyCode} className="text-blue-600 hover:text-blue-800">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Redeem Points */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1">Redeem Points</h2>
            <p className="text-sm text-gray-500 mb-4">
              Convert your points into discount vouchers. Minimum 50 points to redeem.
            </p>
          </div>
          <div>
            {(user.rewardPoints || 0) >= 50 ? (
              <form onSubmit={handleRequestCoupon}>
                <p className="text-sm text-gray-700 mb-3">
                  You have <span className="font-bold text-blue-600">{user.rewardPoints}</span> points available.
                  This will request a voucher worth <span className="font-bold text-green-600">৳{user.rewardPoints}</span>.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                  {isSubmitting ? 'Submitting...' : 'Request Voucher'}
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">
                  You need <span className="font-bold text-gray-900">50 points</span> to redeem.
                  You currently have <span className="font-bold text-blue-600">{user.rewardPoints || 0}</span>.
                </p>
                <p className="text-xs text-gray-400 mt-2">Keep earning by referring friends!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Points & Referral History */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Referred Orders {'&'} Points History</h2>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-semibold">
            {referrals.length} {referrals.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>
        {referrals.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">
            You have not referred anyone yet. Share your code to start earning reward points!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Referred Friend</th>
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Points</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {referrals.map(ref => (
                  <tr key={ref.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium text-gray-900">{ref.referredUserEmail}</td>
                    <td className="py-4 text-xs font-mono text-gray-600">
                      {ref.orderId ? `#${ref.orderId}` : '—'}
                    </td>
                    <td className="py-4 font-bold text-green-600">
                      {ref.earnedPoints > 0 ? `+${ref.earnedPoints} pts` : '0 pts'}
                    </td>
                    <td className="py-4">
                      {ref.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <Clock className="w-3 h-3" /> Pending Delivery
                        </span>
                      )}
                      {ref.status === 'rewarded' && (
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Rewarded
                        </span>
                      )}
                      {ref.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <XCircle className="w-3 h-3" /> Cancelled
                        </span>
                      )}
                      {ref.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <AlertCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-xs text-gray-500">
                      {new Date(ref.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
