'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Loader2, Copy, X, CheckCircle, Search, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { listenToAllOrders, updateOrderStatus, deleteOrder } from '@/lib/db';
import toast from 'react-hot-toast';
import type { Order } from '@/types/order';

const STATUS_OPTIONS: Order['orderStatus'][] = ['processing', 'shipped', 'delivered'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<Order['orderStatus']>('processing');
  const [trackingLink, setTrackingLink] = useState('');
  const [updating, setUpdating] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    let initialLoad = true;
    const unsubscribe = listenToAllOrders((data, changes) => {
      setOrders(data);
      if (!initialLoad) {
        // Find added orders
        const added = changes.filter(c => c.type === 'added');
        if (added.length > 0) {
          toast.success(`New order received! (${added[0].doc.id.slice(-8)})`, {
            duration: 5000,
            icon: '🛍️',
          });
        }
      }
      initialLoad = false;
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = orders.filter((o) => {
    const matchesFilter = activeFilter === 'all' || o.orderStatus === activeFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (o.id || '').toLowerCase().includes(searchLower) ||
      (o.customerName || '').toLowerCase().includes(searchLower) ||
      (o.shippingAddress?.fullName || '').toLowerCase().includes(searchLower) ||
      (o.email || '').toLowerCase().includes(searchLower) ||
      (o.phone || '').toLowerCase().includes(searchLower) ||
      (o.items || []).some((item: any) => 
        (item.productName || item.name || '').toLowerCase().includes(searchLower) || 
        (item.productId || '').toLowerCase().includes(searchLower)
      );
    
    return matchesFilter && matchesSearch;
  });

  const handleOpenModal = (order: Order) => {
    setSelectedOrder(order);
    setStatusUpdate(order.orderStatus);
    setTrackingLink(order.trackingLink || '');
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await updateOrderStatus(
        selectedOrder.id,
        statusUpdate,
        `Status updated to ${statusUpdate}`,
        statusUpdate === 'shipped' ? trackingLink : undefined
      );
      setOrders(orders.map(o => o.id === selectedOrder.id ? { 
        ...o, 
        orderStatus: statusUpdate,
        trackingLink: statusUpdate === 'shipped' ? trackingLink : o.trackingLink
      } : o));
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update order', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to completely delete this order? This action cannot be undone.')) return;
    try {
      await deleteOrder(order.id, order.userId, order.orderStatus);
      toast.success('Order deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete order');
    }
  };

  const copyToClipboard = (text: string, type: 'address' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'address') {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" /> Manage Store Orders
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {loading ? 'Loading...' : `${orders.length} total orders`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-sm w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by ID, name, or product..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex bg-gray-50 p-1 rounded-xl border w-fit flex-wrap gap-1">
            {(['all', 'processing', 'shipped', 'delivered'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFilter === tab ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm font-medium">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 uppercase font-bold text-[10px]">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Total</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {filtered.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => handleOpenModal(order)}
                  className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 font-bold text-gray-900">{order.id.startsWith('WX-') ? order.id : order.id.slice(-8).toUpperCase()}</td>
                  <td className="py-3.5 font-semibold text-gray-700">{order.shippingAddress.fullName}</td>
                  <td className="py-3.5">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3.5 uppercase">{order.paymentMethod}</td>
                  <td className="py-3.5 font-semibold text-blue-600">{formatPrice(order.total)}</td>
                  <td className="py-3.5 text-right">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700'
                      : order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700'
                      : 'bg-blue-50 text-blue-700'
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  Order #{selectedOrder.id.startsWith('WX-') ? selectedOrder.id : selectedOrder.id.slice(-8).toUpperCase()}
                </h2>
                <p className="text-xs font-medium text-gray-500 mt-0.5">Placed on: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">

              {/* User Details */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="text-xs font-bold text-gray-500 uppercase mb-2 block">Customer Details</span>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Name</p>
                    <p className="font-bold text-gray-900">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="font-bold text-gray-900">{selectedOrder.email || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">User ID (Firebase)</p>
                    <p className="font-mono text-gray-900 text-xs bg-gray-200 px-2 py-1 rounded inline-block">{selectedOrder.userId}</p>
                  </div>
                </div>
              </div>
              
              {/* Address & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Phone Number</span>
                    <button 
                      onClick={() => copyToClipboard(selectedOrder.phone || '', 'phone')}
                      className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
                    >
                      {copiedPhone ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPhone ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="font-bold text-gray-900">{selectedOrder.phone}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Shipping Address</span>
                    <button 
                      onClick={() => {
                        const addr = [selectedOrder.shippingAddress.addressLine, selectedOrder.shippingAddress.area, selectedOrder.shippingAddress.district].filter(Boolean).join(', ');
                        copyToClipboard(addr, 'address');
                      }}
                      className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
                    >
                      {copiedAddress ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedAddress ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">
                    {selectedOrder.shippingAddress.addressLine}<br />
                    {selectedOrder.shippingAddress.area && `${selectedOrder.shippingAddress.area}, `}{selectedOrder.shippingAddress.district}
                  </p>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                <h3 className="font-bold text-gray-900">Update Order Status</h3>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Status</label>
                  <select 
                    value={statusUpdate} 
                    onChange={e => setStatusUpdate(e.target.value as any)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {statusUpdate === 'shipped' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Courier Tracking Link (Optional)</label>
                    <input 
                      type="url" 
                      placeholder="e.g. https://steadfast.com.bd/t/12345"
                      value={trackingLink}
                      onChange={e => setTrackingLink(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">If provided, the customer will see this link on their order details page.</p>
                  </div>
                )}
              </div>

            </div>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-between gap-3 shrink-0">
              <button 
                onClick={(e) => {
                  setSelectedOrder(null);
                  handleDeleteOrder(e, selectedOrder);
                }}
                className="px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Order
              </button>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              <button 
                onClick={handleSaveStatus}
                disabled={updating || (statusUpdate === selectedOrder.orderStatus && trackingLink === (selectedOrder.trackingLink || ''))}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Save Changes
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
