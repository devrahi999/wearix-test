'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Order } from '@/types/order';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, ExternalLink, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/account/orders/${id}`);
      return;
    }

    if (user && id) {
      const docRef = doc(db, 'orders', id as string);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Order;
          // Security check - only allow user to view their own orders
          if (data.userId === user.uid) {
            setOrder({ ...data, id: docSnap.id });
          } else {
            router.push('/account/orders');
          }
        }
        setFetching(false);
      });

      return () => unsubscribe();
    }
  }, [user, loading, id, router]);

  if (loading || fetching) {
    return <div className="min-h-[50vh] flex items-center justify-center">Loading order details...</div>;
  }

  if (!order) {
    return <div className="min-h-[50vh] flex items-center justify-center text-red-500">Order not found.</div>;
  }

  const statusIcons: Record<string, any> = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
  };
  const StatusIcon = statusIcons[order.orderStatus] || Clock;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
        <Link href="/account/orders" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Order #{order.id.startsWith('WX-') ? order.id : order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Order Items */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                <div className="w-16 h-16 rounded-xl border bg-white overflow-hidden shrink-0 relative">
                  <Image src={item.productImage || (item as any).image || '/logo.png'} alt={item.productName || (item as any).name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.productName || (item as any).name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-semibold text-gray-700">Qty: {item.quantity}</span>
                    <span className="text-sm font-bold text-blue-600">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping Fee</span>
              <span>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-gray-900">
              <span>Total Payable</span>
              <span className="text-blue-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Info */}
        <div className="space-y-6">
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Order Status</h2>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                <StatusIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 capitalize">{order.orderStatus}</p>
                <p className="text-xs text-gray-500 mt-1">Real-time updated status</p>
              </div>
            </div>

            {order.orderStatus === 'shipped' && order.trackingLink && (
              <div className="mt-5 pt-5 border-t border-blue-200">
                <p className="text-xs font-bold text-gray-600 mb-2">Courier Tracking Link:</p>
                <a href={order.trackingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline bg-white px-4 py-2 rounded-xl border border-blue-100">
                  Track Package <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Shipping Details</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-semibold text-gray-900">Name:</span> {order.customerName || order.shippingAddress?.fullName}</p>
              <p><span className="font-semibold text-gray-900">Phone:</span> {order.phone || order.shippingAddress?.phone}</p>
              <p><span className="font-semibold text-gray-900">Address:</span> {order.shippingAddress?.addressLine}, {order.shippingAddress?.area ? order.shippingAddress.area + ', ' : ''}{order.shippingAddress?.district}, {order.shippingAddress?.division}</p>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Payment Details</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold text-gray-900">Method:</span>{' '}
                <span className="uppercase">
                  {order.paymentMethod === 'cod' ? (
                    <>Cash on Delivery {order.paymentStatus === 'delivery_charge_paid' && <span className="text-blue-600 lowercase capitalize"> (Delivery Charge Paid)</span>}</>
                  ) : (
                    <>Online Payment {order.paymentStatus === 'paid' && <span className="text-green-600 lowercase capitalize"> (Paid Full)</span>}</>
                  )}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
