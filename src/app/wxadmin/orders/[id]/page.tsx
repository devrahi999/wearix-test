'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Printer, Truck, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getOrderById, updateOrderStatus } from '@/lib/db';
import type { Order } from '@/types/order';
import toast from 'react-hot-toast';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params.id as string) || '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [status, setStatus] = useState<Order['orderStatus']>('placed');
  const [trackingLink, setTrackingLink] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      getOrderById(id).then((data) => {
        if (data) {
          setOrder(data);
          setStatus(data.orderStatus || 'placed');
        }
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setUpdating(true);
    
    let message = `Your order status has been updated to ${status}.`;
    if (status === 'shipped') {
      message = 'Your order has been shipped and is on the way.';
    } else if (status === 'delivered') {
      message = 'Your order has been delivered successfully.';
    } else if (status === 'cancelled') {
      message = 'Your order has been cancelled.';
    }

    try {
      await updateOrderStatus(id, status, message, trackingLink || undefined);
      toast.success('Order status updated successfully');
      setOrder({ ...order, orderStatus: status });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-800">Order not found</h2>
        <Link href="/wxadmin/orders" className="text-blue-600 mt-2 block hover:underline">Go back to orders</Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-gray-100">
        <div className="flex items-center gap-4">
          <Link
            href="/wxadmin/orders"
            className="p-2 border rounded-xl hover:bg-gray-50 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order ID: {id}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Invoice
        </button>
      </div>

      {/* Grid splits details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer & Shipping card */}
        <div className="md:col-span-2 space-y-6">
          {/* Customer info */}
          <div className="border rounded-2xl p-5 space-y-3 bg-gray-50/20">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              Customer Details
            </h3>
            <div className="text-xs sm:text-sm text-gray-600 space-y-2">
              <p className="font-bold text-gray-900">{order.customerName}</p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" /> {order.email}
              </p>
              <p className="flex items-center gap-1.5 font-semibold text-blue-600">
                <Phone className="w-4 h-4 text-gray-400" /> {order.phone}
              </p>
            </div>
          </div>

          {/* Shipping destination */}
          <div className="border rounded-2xl p-5 space-y-3 bg-gray-50/20">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-500" /> Shipping Destination
            </h3>
            <div className="text-xs sm:text-sm text-gray-600 space-y-1">
              <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine}</p>
              <p>
                {order.shippingAddress.area}, {order.shippingAddress.district}, {order.shippingAddress.division}
              </p>
            </div>
          </div>

          {/* Line items table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Line Items</h3>
            <div className="divide-y divide-gray-150 border rounded-2xl overflow-hidden bg-gray-50/10">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 items-center">
                  <div className="relative w-12 h-16 rounded overflow-hidden bg-gray-50 border shrink-0">
                    <img src={item.productImage || (item as any).image || '/logo.png'} alt="" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.productName || (item as any).name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase">
                      Size: {item.size} | Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Actions panel */}
        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 space-y-4 h-fit">
            <h2 className="font-bold text-gray-900 text-sm border-b pb-3 border-gray-200 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" /> Order Status
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Change Status
                </label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="placed">Placed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {status === 'shipped' && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Tracking Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={trackingLink}
                    onChange={(e) => setTrackingLink(e.target.value)}
                    placeholder="https://tracker.com/..."
                    className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm text-xs"
              >
                <Save className="w-4 h-4" /> {updating ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Pricing calculations details */}
          <div className="border rounded-2xl p-5 space-y-3 bg-gray-50/20 text-xs sm:text-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-2">
              Payment Summary
            </h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Coupon Discount</span>
                <span>-{formatPrice(order.discount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping fee</span>
                <span>
                  {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2 border-gray-250">
                <span>Payable Total</span>
                <span className="text-blue-600">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-500 text-xs mt-2 border-t pt-2 border-gray-250">
                <span>Payment Method</span>
                <span className="uppercase">{order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
