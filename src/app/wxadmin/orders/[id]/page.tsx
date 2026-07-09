'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Printer, Truck, Check, Mail, Phone, MapPin } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params.id as string) || '';

  const [status, setStatus] = useState<'Placed' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'>('Confirmed');
  const [updating, setUpdating] = useState(false);

  const mockOrder = useMemo(() => {
    return {
      id,
      date: 'July 5, 2026',
      customer: {
        name: 'Rahim Uddin',
        email: 'rahim.uddin@example.com',
        phone: '01712345678',
      },
      shippingAddress: {
        fullName: 'Rahim Uddin',
        phone: '01712345678',
        division: 'Dhaka',
        district: 'Dhaka',
        area: 'Dhanmondi',
        addressLine: 'House 12, Road 4, Sector 3',
      },
      items: [
        {
          name: 'Premium Cotton Oxford Shirt',
          size: 'L',
          price: 990,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200',
        },
        {
          name: 'Bangladesh Cricket Jersey',
          size: 'M',
          price: 850,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=200',
        },
      ],
      subtotal: 1840,
      discount: 300,
      shippingFee: 0,
      total: 1540,
    };
  }, [id]);

  const handleUpdateStatus = () => {
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      alert('Order status updated successfully!');
    }, 1000);
  };

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
            <p className="text-xs text-gray-400 mt-0.5">Placed on {mockOrder.date}</p>
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
              <p className="font-bold text-gray-900">{mockOrder.customer.name}</p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" /> {mockOrder.customer.email}
              </p>
              <p className="flex items-center gap-1.5 font-semibold text-blue-600">
                <Phone className="w-4 h-4 text-gray-400" /> {mockOrder.customer.phone}
              </p>
            </div>
          </div>

          {/* Shipping destination */}
          <div className="border rounded-2xl p-5 space-y-3 bg-gray-50/20">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-500" /> Shipping Destination
            </h3>
            <div className="text-xs sm:text-sm text-gray-600 space-y-1">
              <p className="font-bold text-gray-900">{mockOrder.shippingAddress.fullName}</p>
              <p>{mockOrder.shippingAddress.phone}</p>
              <p>{mockOrder.shippingAddress.addressLine}</p>
              <p>
                {mockOrder.shippingAddress.area}, {mockOrder.shippingAddress.district},{' '}
                {mockOrder.shippingAddress.division}
              </p>
            </div>
          </div>

          {/* Line items table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Line Items</h3>
            <div className="divide-y divide-gray-150 border rounded-2xl overflow-hidden bg-gray-50/10">
              {mockOrder.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 items-center">
                  <div className="relative w-12 h-16 rounded overflow-hidden bg-gray-50 border shrink-0">
                    <img src={item.image} alt="" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.name}</p>
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
                  <option value="Placed">Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

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
                <span>{formatPrice(mockOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Coupon Discount</span>
                <span>-{formatPrice(mockOrder.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping fee</span>
                <span>
                  {mockOrder.shippingFee === 0 ? 'FREE' : formatPrice(mockOrder.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base border-t pt-2 border-gray-250">
                <span>Payable Total</span>
                <span className="text-blue-600">{formatPrice(mockOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
