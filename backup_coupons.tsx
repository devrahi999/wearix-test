'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, ToggleLeft, ToggleRight, X, Eye, ChevronRight } from 'lucide-react';
import { 
  getCoupons, saveCoupon, deleteCoupon, updateCoupon, type Coupon, 
  getCategories, getProducts, getAllUsers,
  getOrdersByCoupon
} from '@/lib/db';
import type { Category, Product } from '@/types/product';
import type { Order } from '@/types/order';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { useConfirm } from '@/components/ui/ConfirmDialog';

const empty: Omit<Coupon, 'id' | 'usedCount'> = {
  code: '', discountType: 'percent', discountValue: 10, minOrderAmount: 0,
  isActive: true, usageLimit: 100, expiresAt: '', validCategories: [], validProducts: [], allowedUsers: []
};

export default function AdminCouponsPage() {
  const { confirm } = useConfirm();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Coupon, 'id' | 'usedCount'>>(empty);
  const [saving, setSaving] = useState(false);

  // Details Modal
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponOrders, setCouponOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCoupons(), getCategories(), getProducts(), getAllUsers()]).then(([c, cat, p, u]) => {
      setCoupons(c);
      setCategories(cat);
      setProducts(p);
      setUsers(u);
      setLoading(false);
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await saveCoupon(form, form.code.toUpperCase());
      setCoupons(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
      setForm(empty);
      setShowForm(false);
      toast.success('Coupon created successfully!');
    } catch (err) {
      toast.error('Failed to create coupon.');
    }
    setSaving(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await confirm({ message: 'Delete this coupon?' });
    if (!ok) return;
    try {
      await deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success('Coupon deleted.');
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  const handleToggle = async (e: React.MouseEvent, c: Coupon) => {
    e.stopPropagation();
    try {
      await updateCoupon(c.id, { isActive: !c.isActive });
      setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
      toast.success(c.isActive ? 'Coupon deactivated' : 'Coupon activated');
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const openDetails = async (c: Coupon) => {
    setSelectedCoupon(c);
    setLoadingOrders(true);
    try {
      const orders = await getOrdersByCoupon(c.code);
      setCouponOrders(orders);
    } catch (err) {
      toast.error('Failed to fetch orders for this coupon.');
    }
    setLoadingOrders(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Manage Coupons</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add New Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 text-sm border-b pb-3 border-gray-100 mb-4">Create New Coupon</h2>
          <form onSubmit={handleAdd} className="space-y-4 text-sm max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Coupon Code *</label>
                <input required value={form.code} onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SAVE20"
                  className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Discount Type</label>
                <select value={form.discountType} onChange={e => setForm(prev => ({ ...prev, discountType: e.target.value as any }))}
                  className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (৳)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Discount Value ({form.discountType === 'percent' ? '%' : '৳'})
                </label>
                <input type="number" min="0" required value={form.discountValue} onChange={e => setForm(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                  className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Min Order Amount (৳)</label>
                <input type="number" min="0" value={form.minOrderAmount} onChange={e => setForm(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                  className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Usage Limit</label>
                <input type="number" min="1" value={form.usageLimit} onChange={e => setForm(prev => ({ ...prev, usageLimit: Number(e.target.value) }))}
                  className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Expires At</label>
                <input type="datetime-local" onChange={e => setForm(prev => ({ ...prev, expiresAt: new Date(e.target.value).toISOString() }))}
                  className="w-full border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            
            <label className="flex items-center gap-2 text-sm cursor-pointer w-fit">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))} />
              <span className="font-medium text-gray-700">Active Status</span>
            </label>
            
            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Valid Categories (Optional)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(form.validCategories || []).map(catSlug => {
                    const catName = categories.find(c => c.slug === catSlug)?.name || catSlug;
                    return (
                      <span key={catSlug} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                        {catName}
                        <button type="button" onClick={() => setForm(prev => ({ ...prev, validCategories: prev.validCategories!.filter(c => c !== catSlug) }))} className="hover:text-blue-900 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
                <select value="" onChange={e => {
                    const val = e.target.value;
                    if (val && !(form.validCategories || []).includes(val)) {
                      setForm(prev => ({ ...prev, validCategories: [...(prev.validCategories || []), val] }));
                    }
                  }}
                  className="w-full border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">+ Select a Category</option>
                  {categories.filter(c => !(form.validCategories || []).includes(c.slug)).map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Valid Products (Optional)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(form.validProducts || []).map(prodId => {
                    const prodName = products.find(p => p.id === prodId)?.name || prodId;
                    return (
                      <span key={prodId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 text-xs font-semibold">
                        {prodName}
                        <button type="button" onClick={() => setForm(prev => ({ ...prev, validProducts: prev.validProducts!.filter(p => p !== prodId) }))} className="hover:text-pink-900 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
                <select value="" onChange={e => {
                    const val = e.target.value;
                    if (val && !(form.validProducts || []).includes(val)) {
                      setForm(prev => ({ ...prev, validProducts: [...(prev.validProducts || []), val] }));
                    }
                  }}
                  className="w-full border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">+ Select a Product</option>
                  {products.filter(p => !(form.validProducts || []).includes(p.id)).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2.5 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
          : coupons.length === 0 ? <p className="text-center text-gray-400 text-sm py-10">No coupons yet.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 uppercase font-bold text-[10px]">
                    <th className="pb-3">Code</th>
                    <th className="pb-3">Discount</th>
                    <th className="pb-3">Min Order</th>
                    <th className="pb-3">Usage</th>
                    <th className="pb-3">Expires</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  {coupons.map(c => (
                    <tr 
                      key={c.id} 
                      onClick={() => openDetails(c)}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">{c.code}</span>
                      </td>
                      <td className="py-3 font-semibold text-gray-900">
                        {c.discountType === 'percent' ? `${c.discountValue}%` : `৳${c.discountValue}`}
                      </td>
                      <td className="py-3">৳{c.minOrderAmount}</td>
                      <td className="py-3">
                        <span className={`${c.usedCount >= c.usageLimit ? 'text-red-500' : 'text-green-600'} font-semibold`}>
                          {c.usedCount}
                        </span> / {c.usageLimit}
                      </td>
                      <td className="py-3 text-xs">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); openDetails(c); }} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => handleToggle(e, c)} className="transition-transform hover:scale-110">
                            {c.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-300" />}
                          </button>
                          <button onClick={(e) => handleDelete(e, c.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
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

      {/* Details Modal */}
      {selectedCoupon && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Coupon Details
                <span className="font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-sm">{selectedCoupon.code}</span>
              </h2>
              <button onClick={() => setSelectedCoupon(null)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Discount</p>
                  <p className="font-bold text-gray-900">
                    {selectedCoupon.discountType === 'percent' ? `${selectedCoupon.discountValue}%` : `৳${selectedCoupon.discountValue}`}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Usage</p>
                  <p className="font-bold text-gray-900">
                    {selectedCoupon.usedCount} / {selectedCoupon.usageLimit}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Min Order</p>
                  <p className="font-bold text-gray-900">৳{selectedCoupon.minOrderAmount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                  <p className={`font-bold ${selectedCoupon.isActive ? 'text-green-600' : 'text-red-500'}`}>
                    {selectedCoupon.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Usage History</h3>
              {loadingOrders ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : couponOrders.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  This coupon hasn't been used yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {couponOrders.map(order => (
                    <div key={order.id} className="border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden transition-all">
                      <button 
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-gray-900">{order.id}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 font-medium text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-blue-600 text-sm">{formatPrice(order.total)}</span>
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`} />
                        </div>
                      </button>
                      
                      {expandedOrderId === order.id && (
                        <div className="px-4 pb-4 pt-1 border-t border-gray-50 flex flex-col md:flex-row justify-between gap-6">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Customer Info</p>
                            <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
                            <p className="text-xs text-gray-500">{order.email || 'No email'} • {order.phone}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-lg text-xs md:max-w-xs flex-1">
                            <p className="font-bold text-gray-700 mb-1">Items Bought:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="truncate" title={item.productName || (item as any).name}>
                                  {item.quantity}x {item.productName || (item as any).name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
