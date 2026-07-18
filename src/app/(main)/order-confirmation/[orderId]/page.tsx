'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, Truck, Calendar, MapPin, MessageCircle, FileText } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { getStoreSettings, type StoreSettings } from '@/lib/db';
import { WHATSAPP_NUMBER as DEFAULT_WA } from '@/constants';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/types/order';

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = (params.orderId as string) || 'UNKNOWN_ORDER';
  
  const source = searchParams.get('source');

  const { clearCart, clearBuyNowItem } = useCartStore();

  useEffect(() => {
    if (source === 'buy_now') {
      clearBuyNowItem();
    } else if (source === 'cart') {
      clearCart();
    }
  }, [source, clearCart, clearBuyNowItem]);
  
  const [waNumber, setWaNumber] = useState(DEFAULT_WA);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    getStoreSettings().then(settings => {
      if (settings?.whatsapp) {
        setWaNumber(settings.whatsapp);
      }
    });
    
    if (orderId && orderId !== 'UNKNOWN_ORDER') {
      getDoc(doc(db, 'orders', orderId)).then(snap => {
        if (snap.exists()) {
          setOrder(snap.data() as Order);
        }
      });
    }
  }, [orderId]);

  const mockOrderDate = new Date().toLocaleDateString('en-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const whatsappMessage = encodeURIComponent(
    `Hi WearixBD! I just placed an order. Order ID: ${orderId}. Please confirm it.`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Header card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            Order Placed Successfully
          </span>
          
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-3">
            Thank you for your order!
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
            Your order has been logged in our system. We will call you shortly on your phone number to verify and confirm your delivery.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 max-w-sm mx-auto grid grid-cols-2 gap-2 text-left text-xs text-gray-600">
          <div>
            <p className="text-gray-400 font-semibold uppercase">Order ID</p>
            <p className="font-bold text-gray-900 text-sm mt-0.5">{orderId}</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold uppercase">Order Date</p>
            <p className="font-semibold text-gray-900 mt-0.5">{mockOrderDate}</p>
          </div>
          {order && (
            <div className="col-span-2 border-t border-gray-200 mt-2 pt-2 grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-400 font-semibold uppercase">Payment Method</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5 capitalize">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (ZiniPay)'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase">Payment Status</p>
                <div className="mt-0.5 flex items-center">
                  {order.paymentStatus === 'paid' || order.paymentStatus === 'delivery_charge_paid' ? (
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">Paid</span>
                  ) : order.orderStatus === 'pending' ? (
                    <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Pending Verification</span>
                  ) : (
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">Not Paid</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details layout */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="font-bold text-gray-900 border-b pb-3 border-gray-100">
          Next Steps & Tracking
        </h2>

        {/* Vertical tracking steps */}
        <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-150">
          <div className="flex gap-4 relative">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 z-10 font-bold text-xs">
              1
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Order Verification</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Our support team will call you to confirm items and address.
              </p>
            </div>
          </div>

          <div className="flex gap-4 relative">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 z-10 font-bold text-xs">
              2
            </div>
            <div>
              <p className="text-sm font-bold text-gray-600">Packaging & Dispatch</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Apparel will be steam-ironed, barcoded, and bagged in premium WearixBD poly envelopes.
              </p>
            </div>
          </div>

          <div className="flex gap-4 relative">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 z-10 font-bold text-xs">
              3
            </div>
            <div>
              <p className="text-sm font-bold text-gray-600">Courier Delivery</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Pathao/Steadfast courier will deliver to your doorstep inside 1-3 days.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Quick WhatsApp confirm */}
          <a
            href={`https://wa.me/${waNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 sm:h-14 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-[13px] sm:text-sm shadow-sm"
          >
            <MessageCircle className="w-5 h-5 fill-white" /> Quick Confirm on WhatsApp
          </a>

          <Link
            href="/shop"
            className="w-full h-12 sm:h-14 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-[13px] sm:text-sm"
          >
            <ShoppingBag className="w-5 h-5" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
