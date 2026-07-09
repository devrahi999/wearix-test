'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Trash2, ShoppingBag, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { getStoreSettings, type StoreSettings } from '@/lib/db';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const discountedSubtotal = getTotalPrice();

  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    getStoreSettings().then(setSettings);
  }, []);

  const shippingFee = settings?.defaultDeliveryCharge || 0;
  const total = Math.max(0, discountedSubtotal + shippingFee);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h1>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
          Looks like you haven&apos;t added any fashion apparel to your cart yet. Let&apos;s start shopping!
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
        >
          Explore Shop <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-blue-600" /> Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0 last:pb-0 first:pt-0"
              >
                {/* Image */}
                <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-50">
                  <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-1 capitalize">
                    Size: <span className="font-semibold text-gray-600">{item.size}</span>
                    {item.color && (
                      <>
                        {' '}
                        | Color:{' '}
                        <span className="font-semibold text-gray-600">{item.color}</span>
                      </>
                    )}
                  </p>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrice(item.discountPrice ?? item.price)}
                    </span>
                    {item.discountPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stepper & Delete */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0 bg-white">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 font-semibold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 font-semibold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.size)}
                    aria-label="Remove item"
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price & Summary Checkout Drawer */}
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900 border-b pb-3 border-gray-100">Order Summary</h2>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {subtotal > discountedSubtotal && (
                <div className="flex justify-between text-red-600">
                  <span>Product Discount</span>
                  <span>-{formatPrice(subtotal - discountedSubtotal)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>
                  {settings ? (shippingFee === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )) : (
                    <span className="text-gray-400">Calculated at checkout</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-gray-900 text-lg border-t pt-3 border-gray-100">
              <span>Total</span>
              <span className="text-blue-600">{formatPrice(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>


        </div>
      </div>
    </div>
  );
}
