'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders } from '@/lib/db';
import type { Order } from '@/types/order';
import { useRouter } from 'next/navigation';

export default function AccountOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account/orders');
    } else if (user) {
      getUserOrders(user.uid).then(data => {
        setOrders(data);
        setFetching(false);
      });
    }
  }, [user, loading, router]);

  if (loading || fetching) {
    return <div className="min-h-[50vh] flex items-center justify-center">Loading orders...</div>;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order History</h1>
          <p className="text-xs text-gray-500 mt-1">Review tracking information and invoices for past purchases.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline">
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 text-xs uppercase font-bold">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Placed Date</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Total Payable</th>
                <th className="pb-3">Delivery Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 font-bold text-gray-900">{order.id.slice(-8).toUpperCase()}</td>
                  <td className="py-3.5">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3.5 text-xs font-medium uppercase">{order.paymentMethod}</td>
                  <td className="py-3.5 font-semibold text-blue-600">{formatPrice(order.total)}</td>
                  <td className="py-3.5">
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                        order.orderStatus === 'delivered'
                          ? 'bg-green-50 text-green-700'
                          : order.orderStatus === 'cancelled'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </Link>
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
