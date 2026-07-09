'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { BD_LOCATIONS } from '@/constants/locations';
import { ShoppingBag, ArrowRight, ShieldCheck, Check, AlertCircle, Loader2 } from 'lucide-react';
import { 
  getStoreSettings, type StoreSettings, 
  getCouponByCode, type Coupon, 
  createOrder, hasUserUsedCoupon, recordCouponUsage, getProducts 
} from '@/lib/db';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const { items: cartItems, buyNowItem, getTotalPrice, clearCart, clearBuyNowItem } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';
  const { user } = useAuth();
  
  const items = isBuyNow && buyNowItem ? [buyNowItem] : cartItems;

  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    getStoreSettings().then(setSettings);
  }, []);

  const [form, setForm] = useState(() => {
    const defaultDist = Object.keys(BD_LOCATIONS)[0];
    const defaultArea = BD_LOCATIONS[defaultDist][0];
    return {
      fullName: '',
      phone: '',
      district: defaultDist,
      area: defaultArea,
      addressLine: '',
    };
  });

  const availableDistricts = Object.keys(BD_LOCATIONS).sort();
  const availableAreas = BD_LOCATIONS[form.district] || ['Other'];

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dist = e.target.value;
    const areas = BD_LOCATIONS[dist] || ['Other'];
    setForm({ ...form, district: dist, area: areas[0] });
  };

  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'sslcommerz' | 'cod'>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Coupon Logic
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const cartSubtotal = isBuyNow && buyNowItem 
    ? (buyNowItem.discountPrice ?? buyNowItem.price) * buyNowItem.quantity 
    : getTotalPrice();

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const coupon = await getCouponByCode(couponCode);
      if (!coupon) {
        setCouponError('Invalid or expired coupon code.');
        setValidatingCoupon(false);
        return;
      }
      
      if (user) {
        const used = await hasUserUsedCoupon(user.uid, coupon.code);
        if (used) {
          setCouponError('You have already used this coupon code.');
          setValidatingCoupon(false);
          return;
        }
      }

      if (cartSubtotal < coupon.minOrderAmount) {
        setCouponError(`Minimum order amount for this coupon is ${formatPrice(coupon.minOrderAmount)}`);
      } else if (coupon.usedCount >= coupon.usageLimit) {
        setCouponError('Coupon usage limit reached.');
      } else if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        setCouponError('Coupon has expired.');
      } else {
        const hasCategory = coupon.validCategories && coupon.validCategories.length > 0;
        const hasProduct = coupon.validProducts && coupon.validProducts.length > 0;

        if (hasCategory || hasProduct) {
          const allProds = await getProducts();
          const cartProducts = allProds.filter(p => items.some(i => i.productId === p.id));
          
          let isValid = false;
          for (const cp of cartProducts) {
            if (hasCategory && coupon.validCategories!.includes(cp.category)) {
              isValid = true; break;
            }
            if (hasProduct && coupon.validProducts!.includes(cp.id)) {
              isValid = true; break;
            }
          }
          
          if (!isValid) {
            setCouponError('This coupon is not valid for the items in your cart.');
            setValidatingCoupon(false);
            return;
          }
        }

        setAppliedCoupon(coupon);
        setCouponCode('');
      }
    } catch (err) {
      setCouponError('Failed to apply coupon.');
    }
    setValidatingCoupon(false);
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const discount = appliedCoupon 
    ? (appliedCoupon.discountType === 'percent' 
        ? cartSubtotal * (appliedCoupon.discountValue / 100)
        : appliedCoupon.discountValue)
    : 0;

  const getShippingCharge = () => {
    if (!settings) return 0;
    if (settings.districtDeliveryCharges[form.district] !== undefined) {
      return settings.districtDeliveryCharges[form.district];
    }
    return settings.defaultDeliveryCharge;
  };

  const shippingCharge = getShippingCharge();
  const total = cartSubtotal - discount + shippingCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.fullName || !form.phone || !form.district || !form.addressLine) {
      setError('Please fill in all required shipping details.');
      return;
    }

    if (form.phone.length < 11) {
      setError('Please enter a valid 11-digit phone number.');
      return;
    }

    setSubmitting(true);

    try {
      const genId = 'WX-' + Math.floor(100000 + Math.random() * 900000);
      const newOrder = {
        id: genId,
        userId: user?.uid || 'guest',
        customerName: form.fullName,
        phone: form.phone,
        email: user?.email || '',
        shippingAddress: {
          fullName: form.fullName, // Backwards compatibility
          phone: form.phone,       // Backwards compatibility
          addressLine: form.addressLine,
          area: form.area,
          district: form.district,
          division: '',
        },
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          slug: i.slug,
          price: i.discountPrice ?? i.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color || null,
          image: i.image,
        })),
        subtotal: cartSubtotal,
        shippingFee: shippingCharge,
        discount: discount,
        total: total,
        paymentMethod: paymentMethod,
        orderStatus: 'processing' as const,
        paymentStatus: 'unpaid' as const,
        couponCode: appliedCoupon?.code || null,
      };

      // Strip any other undefined values just in case
      const cleanOrder = JSON.parse(JSON.stringify(newOrder));
      
      await createOrder(cleanOrder);

      if (appliedCoupon) {
        await recordCouponUsage(user?.uid || 'guest', appliedCoupon.id, appliedCoupon.code);
      }

      if (isBuyNow) {
        clearBuyNowItem();
      } else {
        clearCart();
      }
      
      router.push(`/order-confirmation/${genId}`);
    } catch (err) {
      console.error(err);
      setError('Failed to create order. Please try again.');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="text-4xl">🛒</span>
        <h1 className="text-xl font-bold text-gray-900 mt-4">Your cart is empty</h1>
        <p className="text-sm text-gray-500 mt-2">Add items to your cart before checking out.</p>
        <button
          onClick={() => router.push('/shop')}
          className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Go Shop
        </button>
      </div>
    );
  }

  if (!settings) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout Details</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Shipping Form & Payment Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address Form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3 border-gray-100">
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Full Name
                </label>
                <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Rahim Uddin"
                  className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Phone Number
                </label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 01712345678"
                  className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* District & Area Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">District</label>
                <select
                  value={form.district}
                  onChange={handleDistrictChange}
                  className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {availableDistricts.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Thana / Area</label>
                <select
                  value={form.area}
                  onChange={e => setForm({ ...form, area: e.target.value })}
                  className="w-full border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {availableAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Detailed Address (House, Road, etc.)
                </label>
                <textarea required rows={3} value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                  placeholder="e.g. House 12, Road 4, Block C, Banani"
                  className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-3 border-gray-100">
              Payment Method
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <label className="relative flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all border-blue-600 bg-blue-50">
                <div className="flex items-center gap-3">
                  <input type="radio" name="payment" value="cod" checked readOnly className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                  <span className="font-semibold text-sm text-gray-900">Cash on Delivery</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary & Coupon */}
        <div className="lg:col-span-5">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sticky top-24 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" /> Order Summary
            </h2>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-lg border bg-white overflow-hidden shrink-0 relative">
                    <Image src={item.image || '/placeholder.png'} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-semibold text-gray-700">Qty: {item.quantity}</span>
                      <span className="text-sm font-bold text-blue-600">
                        {formatPrice((item.discountPrice ?? item.price) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-4 border-t border-gray-200">
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-green-700 flex items-center gap-1"><Check className="w-4 h-4" /> Coupon Applied</p>
                    <p className="text-xs text-green-600">{appliedCoupon.code}</p>
                  </div>
                  <button type="button" onClick={removeCoupon} className="text-xs font-bold text-red-500 hover:underline">Remove</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">Have a coupon?</label>
                  <div className="flex gap-2">
                    <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter code"
                      className="flex-1 border border-gray-300 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                    <button type="button" onClick={handleApplyCoupon} disabled={!couponCode || validatingCoupon}
                      className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50">
                      {validatingCoupon ? 'Wait' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 font-medium">{couponError}</p>}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-gray-900">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-gray-900">{formatPrice(shippingCharge)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              {submitting ? 'Processing...' : 'Place Order'}
              {!submitting && <ArrowRight className="w-5 h-5" />}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Secure Encrypted Checkout
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
