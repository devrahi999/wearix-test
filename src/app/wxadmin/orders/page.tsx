'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Loader2, Search, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { listenToAllOrders, deleteOrder } from '@/lib/db';
import toast from 'react-hot-toast';
import type { Order } from '@/types/order';
import { useConfirm } from '@/components/ui/ConfirmDialog';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const router = useRouter();
  const { confirm } = useConfirm();
  
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(filtered.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedOrders(prev => [...prev, id]);
    } else {
      setSelectedOrders(prev => prev.filter(orderId => orderId !== id));
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const ok = await confirm({ message: 'Are you sure you want to delete this order? This action cannot be undone.' });
    if (!ok) return;

    try {
      await deleteOrder(id);
      toast.success('Order deleted successfully');
      setSelectedOrders(prev => prev.filter(orderId => orderId !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete order');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    const ok = await confirm({ message: `Are you sure you want to delete ${selectedOrders.length} selected orders?` });
    if (!ok) return;

    try {
      await Promise.all(selectedOrders.map(id => deleteOrder(id)));
      toast.success(`${selectedOrders.length} orders deleted`);
      setSelectedOrders([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete some orders');
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
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {selectedOrders.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors flex items-center gap-2 border border-red-200"
            >
              <Trash2 className="w-4 h-4" /> Delete Selected ({selectedOrders.length})
            </button>
          )}
          <div className="relative max-w-sm w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by ID, name..." 
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
                <th className="pb-3 px-2 w-10">
                  <input 
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={filtered.length > 0 && selectedOrders.length === filtered.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Total</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {filtered.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => router.push(`/wxadmin/orders/${order.id}`)}
                  className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-2" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => handleSelectOne(e, order.id)}
                    />
                  </td>
                  <td className="py-3.5 font-bold text-gray-900">{order.id.startsWith('WX-') ? order.id : order.id.slice(-8).toUpperCase()}</td>
                  <td className="py-3.5 font-semibold text-gray-700">{order.shippingAddress.fullName}</td>
                  <td className="py-3.5">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3.5 uppercase">{order.paymentMethod}</td>
                  <td className="py-3.5 font-semibold text-blue-600">{formatPrice(order.total || 0)}</td>
                  <td className="py-3.5 text-center">
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700'
                      : order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700'
                      : 'bg-blue-50 text-blue-700'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button 
                      onClick={(e) => handleDelete(order.id, e)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
