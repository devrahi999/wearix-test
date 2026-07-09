'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Loader2, Search } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { listenToAllOrders } from '@/lib/db';
import toast from 'react-hot-toast';
import type { Order } from '@/types/order';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
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
                  onClick={() => router.push(`/wxadmin/orders/${order.id}`)}
                  className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 font-bold text-gray-900">{order.id.startsWith('WX-') ? order.id : order.id.slice(-8).toUpperCase()}</td>
                  <td className="py-3.5 font-semibold text-gray-700">{order.shippingAddress.fullName}</td>
                  <td className="py-3.5">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3.5 uppercase">{order.paymentMethod}</td>
                  <td className="py-3.5 font-semibold text-blue-600">{formatPrice(order.total || 0)}</td>
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
    </div>
  );
}
