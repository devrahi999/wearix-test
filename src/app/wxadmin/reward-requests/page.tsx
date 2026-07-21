'use client';

import { useEffect, useState } from 'react';
import { getAllRewardRequests, updateRewardRequest, processRewardApproval, getCategories, getUser, updateUser, type RewardRequest } from '@/lib/db';
import type { Category } from '@/types/product';
import { Gift, CheckCircle2, XCircle, Clock, Loader2, X, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';

export default function AdminRewardRequestsPage() {
  const [requests, setRequests] = useState<RewardRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval Modal State
  const [approvalModal, setApprovalModal] = useState<RewardRequest | null>(null);
  const [voucherData, setVoucherData] = useState({
    title: '',
    discountType: 'percent' as 'percent' | 'fixed' | 'free_delivery',
    discountValue: 0,
    validCategories: [] as string[],
    minOrderAmount: 0
  });
  const [approving, setApproving] = useState(false);
  const { confirm } = useConfirm();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [reqData, catData] = await Promise.all([
        getAllRewardRequests(),
        getCategories()
      ]);
      setRequests(reqData);
      setCategories(catData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenApprove = (req: RewardRequest) => {
    // Attempt to parse default values based on the request
    let title = req.rewardOptionTitle || 'Custom Voucher';
    let type = 'percent';
    let val = 10;
    
    if (title.toLowerCase().includes('free delivery')) {
      type = 'free_delivery';
      val = 0;
    } else if (title.toLowerCase().includes('off')) {
      if (title.includes('%')) {
        type = 'percent';
        const m = title.match(/(\d+)%/);
        if (m) val = Number(m[1]);
      } else {
        type = 'fixed';
        const m = title.match(/(\d+)/);
        if (m) val = Number(m[1]);
      }
    }

    setVoucherData({
      title,
      discountType: type as any,
      discountValue: val,
      validCategories: [],
      minOrderAmount: 0
    });
    setApprovalModal(req);
  };

  const handleConfirmApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalModal) return;
    setApproving(true);
    try {
      const vData: any = {
        title: voucherData.title,
        discountType: voucherData.discountType,
        discountValue: voucherData.discountValue,
      };
      if (voucherData.minOrderAmount > 0) vData.minOrderAmount = voucherData.minOrderAmount;
      if (voucherData.validCategories.length > 0) vData.validCategories = voucherData.validCategories;

      await processRewardApproval(approvalModal.id, approvalModal.userId, approvalModal.pointsToRedeem, vData);
      toast.success('Request approved and voucher issued!');
      setApprovalModal(null);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve request');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (id: string) => {
    const ok = await confirm({ message: 'Are you sure you want to reject this request?' });
    if (!ok) return;
    try {
      await updateRewardRequest(id, { status: 'rejected' });
      toast.success('Request rejected');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to reject request');
    }
  };

  const handleRefund = async (req: RewardRequest) => {
    const ok = await confirm({ message: `Refund ${req.pointsToRedeem} points back to this user?` });
    if (!ok) return;
    try {
      const u = await getUser(req.userId);
      if (u) {
        await updateUser(req.userId, { rewardPoints: (u.rewardPoints || 0) + req.pointsToRedeem });
      }
      await updateRewardRequest(req.id, { status: 'refunded' as any });
      toast.success('Points refunded to user');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to refund points');
    }
  };

  const toggleCategory = (slug: string) => {
    setVoucherData(prev => ({
      ...prev,
      validCategories: prev.validCategories.includes(slug)
        ? prev.validCategories.filter(s => s !== slug)
        : [...prev.validCategories, slug]
    }));
  };

  if (loading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reward Coupon Requests</h1>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-gray-500 font-medium">Customer Email</th>
                <th className="pb-3 text-gray-500 font-medium">Points to Redeem</th>
                <th className="pb-3 text-gray-500 font-medium">Requested Offer</th>
                <th className="pb-3 text-gray-500 font-medium">Status</th>
                <th className="pb-3 text-gray-500 font-medium">Date</th>
                <th className="pb-3 text-gray-500 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No requests found.</td>
                </tr>
              ) : requests.map(req => (
                <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-medium text-gray-900">{req.userEmail}</td>
                  <td className="py-4 font-bold text-blue-600">{req.pointsToRedeem} pts</td>
                  <td className="py-4 font-medium text-gray-800">{req.rewardOptionTitle || 'Custom'}</td>
                  <td className="py-4">
                    {req.status === 'pending' && <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md text-xs font-bold"><Clock className="w-3 h-3" /> Pending</span>}
                    {req.status === 'approved' && <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-md text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> Approved</span>}
                    {req.status === 'rejected' && <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-md text-xs font-bold"><XCircle className="w-3 h-3" /> Rejected</span>}
                    {(req.status as any) === 'refunded' && <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-md text-xs font-bold"><RefreshCcw className="w-3 h-3" /> Refunded</span>}
                  </td>
                  <td className="py-4 text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 text-right">
                    {req.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenApprove(req)}
                          className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(req.id)}
                          className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {req.status === 'rejected' && (
                      <button 
                        onClick={() => handleRefund(req)}
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                      >
                        Refund Points
                      </button>
                    )}
                    {req.status === 'approved' && req.voucherId && (
                      <span className="text-xs text-gray-400">Voucher Issued</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {approvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900 text-lg">Approve & Issue Voucher</h2>
              <button onClick={() => setApprovalModal(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleConfirmApprove} className="p-6 overflow-y-auto space-y-4">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-2 border border-blue-100">
                <p><strong>User:</strong> {approvalModal.userEmail}</p>
                <p><strong>Points Cost:</strong> {approvalModal.pointsToRedeem} pts</p>
                <p><strong>Requested:</strong> {approvalModal.rewardOptionTitle || 'Unknown'}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Voucher Title</label>
                <input required type="text" value={voucherData.title} onChange={e => setVoucherData({...voucherData, title: e.target.value})} className="w-full border rounded-xl p-3 focus:outline-none focus:border-blue-500 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Discount Type</label>
                  <select required value={voucherData.discountType} onChange={e => setVoucherData({...voucherData, discountType: e.target.value as any})} className="w-full border rounded-xl p-3 focus:outline-none focus:border-blue-500 text-sm bg-white">
                    <option value="percent">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>
                {voucherData.discountType !== 'free_delivery' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Value</label>
                    <input required type="number" value={voucherData.discountValue} onChange={e => setVoucherData({...voucherData, discountValue: Number(e.target.value)})} className="w-full border rounded-xl p-3 focus:outline-none focus:border-blue-500 text-sm" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Order Amount (Optional)</label>
                <input type="number" min="0" value={voucherData.minOrderAmount} onChange={e => setVoucherData({...voucherData, minOrderAmount: Number(e.target.value)})} className="w-full border rounded-xl p-3 focus:outline-none focus:border-blue-500 text-sm" placeholder="e.g. 500" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Valid Categories (Optional)</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.slug)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                        voucherData.validCategories.includes(cat.slug)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">If none selected, voucher is valid for all categories.</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={approving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {approving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Issue Voucher & Deduct Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
