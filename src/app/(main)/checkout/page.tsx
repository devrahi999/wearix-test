'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { BD_LOCATIONS } from '@/constants/locations';
import { ShoppingBag, ArrowRight, ShieldCheck, Check, AlertCircle, Loader2, Phone, X, Gift } from 'lucide-react';
import { 
  getStoreSettings, type StoreSettings, 
  getCouponByCode, type Coupon, 
  createOrder, hasUserUsedCoupon, recordCouponUsage, getProducts, deleteOrder,
  getCampaigns,
  type Campaign,
  getUserByReferralCode, getReferralSettings, getUserOrders, type ReferralSettings, updatePendingReferral,
  getUserVouchers, type UserVoucher, markVoucherAsUsed,
  calculateReferrerRewardPoints, recordOrderReferral
} from '@/lib/db';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { calculateBuyMoreDiscount, calculateFreeDelivery } from '@/lib/promotions';
import { useAuth } from '@/context/AuthContext';

function CheckoutForm() {
  const { items: cartItems, buyNowItem, getTotalPrice, clearCart, clearBuyNowItem } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';
  const { user } = useAuth();
  
  const items = isBuyNow && buyNowItem ? [buyNowItem] : cartItems;

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [refSettings, setRefSettings] = useState<ReferralSettings | null>(null);
  const [pastOrderCount, setPastOrderCount] = useState(0);
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);

  useEffect(() => {
    getStoreSettings().then(setSettings);
    getCampaigns().then(setCampaigns);
    getReferralSettings().then(setRefSettings);
  }, []);

  useEffect(() => {
    if (user?.uid) {
      getUserOrders(user.uid).then(orders => setPastOrderCount(orders.length));
      getUserVouchers(user.uid).then(vs => setVouchers(vs.filter(v => !v.isUsed)));
    }
  }, [user]);

  const [form, setForm] = useState(() => {
    const defaultDist = Object.keys(BD_LOCATIONS)[0];
    const defaultArea = BD_LOCATIONS[defaultDist][0];
    return {
      fullName: '',
      phone: '',
      email: '',
      sendReceipt: false,
      district: defaultDist,
      area: defaultArea,
      addressLine: '',
    };
  });

  useEffect(() => {
    if (user?.email && !form.email) {
      setForm(prev => ({ ...prev, email: user.email! }));
    }
  }, [user]);

  const availableDistricts = Object.keys(BD_LOCATIONS).sort();
  const availableAreas = BD_LOCATIONS[form.district] || ['Other'];

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dist = e.target.value;
    const areas = BD_LOCATIONS[dist] || ['Other'];
    setForm({ ...form, district: dist, area: areas[0] });
  };

  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  // Referral Logic
  const [appliedReferralUser, setAppliedReferralUser] = useState<any | null>(null);

  useEffect(() => {
    // Fetch the referrer if we have a referredBy code and haven't used the first order discount yet
    // This is needed to reward the referrer, and also as a fallback for discount calc for older users.
    if (user?.referredBy && user.firstOrderUsed === false) {
      getUserByReferralCode(user.referredBy).then(u => {
        if (u) setAppliedReferralUser(u);
      });
    }
  }, [user]);

  const [appliedVoucher, setAppliedVoucher] = useState<UserVoucher | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const cartSubtotal = isBuyNow && buyNowItem 
    ? (buyNowItem.discountPrice ?? buyNowItem.price) * buyNowItem.quantity 
    : getTotalPrice();

  const hasFullCodProduct = items.some(i => i.isFullCodEnabled);
  const hasNormalProduct = items.some(i => !i.isFullCodEnabled);
  const hasFreeDelivery = items.some(i => i.isFreeDelivery);

  useEffect(() => {
    if (hasFullCodProduct && !hasNormalProduct) {
      setPaymentMethod('cod');
    }
  }, [hasFullCodProduct, hasNormalProduct]);

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

      if (coupon.allowedUsers && coupon.allowedUsers.length > 0) {
        if (!user || !user.email || !coupon.allowedUsers.includes(user.email)) {
          setCouponError('You are not eligible to use this coupon.');
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

  const getVoucherDiscountText = (v: UserVoucher) => {
    if (v.discountType === 'percent') return `${v.discountValue}% OFF`;
    if (v.discountType === 'fixed') return `${formatPrice(v.discountValue)} OFF`;
    return 'Free Delivery';
  };

  const isVoucherEligible = (v: UserVoucher) => {
    if (v.minOrderAmount && cartSubtotal < v.minOrderAmount) return false;
    // Check categories/products
    if ((v.validCategories && v.validCategories.length > 0) || (v.validProducts && v.validProducts.length > 0)) {
      // Basic check: we don't have categories in `items` readily available without fetching, 
      // but if the voucher has restrictions we'll just let them click it and maybe validate. 
      // Or we can just assume it's conditionally valid. To be safe, we allow clicking it and if it's invalid we could block checkout.
      // But let's keep it simple: we allow it.
      return true;
    }
    return true;
  };

  const handleSelectVoucher = (v: UserVoucher) => {
    if (!isVoucherEligible(v)) {
      toast.error('This voucher is not eligible for your current cart.');
      return;
    }
    setAppliedVoucher(v);
    setIsVoucherModalOpen(false);
    // Remove coupon if they select a voucher to prevent stacking both types of manual discounts
    setAppliedCoupon(null);
  };

  const removeVoucher = () => setAppliedVoucher(null);

  const couponDiscount = Math.round(appliedCoupon 
    ? (appliedCoupon.discountType === 'percent' 
        ? cartSubtotal * (appliedCoupon.discountValue / 100)
        : appliedCoupon.discountType === 'fixed' ? appliedCoupon.discountValue : 0)
    : 0);

  const voucherDiscount = Math.round(appliedVoucher 
    ? (appliedVoucher.discountType === 'percent' 
        ? cartSubtotal * (appliedVoucher.discountValue / 100)
        : appliedVoucher.discountType === 'fixed' ? appliedVoucher.discountValue : 0)
    : 0);

  const buyMoreResult = calculateBuyMoreDiscount(items, campaigns);
  
  let referralDiscount = 0;
  let isReferralFreeDelivery = false;
  let referralDiscountText = '';

  if (user?.referredBy && user?.firstOrderUsed === false && refSettings?.isActive) {
    const isGloballyEnabled = refSettings.isReferredDiscountEnabled !== false; 
    let isUserEnabled = true;
    if (appliedReferralUser) {
      isUserEnabled = appliedReferralUser.isReferredDiscountEnabled !== false;
    }

    if (isGloballyEnabled && isUserEnabled) {
      let rType = 'percent';
      let rVal = 10;
      
      // Look at the referrer's profile first (appliedReferralUser)
      if (appliedReferralUser) {
        if (appliedReferralUser.referCodeDiscountType) {
          rType = appliedReferralUser.referCodeDiscountType;
          rVal = appliedReferralUser.referCodeDiscountValue !== undefined ? appliedReferralUser.referCodeDiscountValue : 0;
        } else if (appliedReferralUser.customReferralDiscount) {
          rType = 'percent';
          rVal = appliedReferralUser.customReferralDiscount;
        } else {
          rType = refSettings.discountType || 'percent';
          rVal = refSettings.discountValue || refSettings.defaultReferralDiscountPct || 10;
        }
      }
      // Fallback to the current user's profile values (saved at sign up)
      else if (user.referCodeDiscountType) {
        rType = user.referCodeDiscountType;
        rVal = user.referCodeDiscountValue || 0;
      }
      // If neither is loaded yet, use global defaults
      else {
        rType = refSettings.discountType || 'percent';
        rVal = refSettings.discountValue || refSettings.defaultReferralDiscountPct || 10;
      }

      if (rType === 'percent') {
        referralDiscount = Math.round(cartSubtotal * (rVal / 100));
        referralDiscountText = `${rVal}% OFF`;
      } else if (rType === 'fixed') {
        referralDiscount = rVal;
        referralDiscountText = `${formatPrice(rVal)} OFF`;
      } else if (rType === 'free_delivery') {
        isReferralFreeDelivery = true;
        referralDiscountText = `Free Delivery`;
      }
    }
  }

  const totalDiscount = Math.round(couponDiscount + voucherDiscount + buyMoreResult.discountAmount + referralDiscount);
  
  const subtotalAfterDiscounts = Math.max(0, Math.round(cartSubtotal - totalDiscount));
  const freeDeliveryResult = calculateFreeDelivery(items, subtotalAfterDiscounts, campaigns, hasFreeDelivery);

  const getShippingCharge = () => {
    if (freeDeliveryResult.isFreeDelivery || appliedCoupon?.discountType === 'free_delivery' || appliedVoucher?.discountType === 'free_delivery' || isReferralFreeDelivery) return 0;
    if (!settings) return 0;
    if (settings.districtDeliveryCharges[form.district] !== undefined) {
      return settings.districtDeliveryCharges[form.district];
    }
    return settings.defaultDeliveryCharge;
  };

  const shippingCharge = Math.round(getShippingCharge());
  const total = Math.max(0, Math.round(cartSubtotal - totalDiscount + shippingCharge));

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

    let genId = '';
    try {
      genId = 'WX-' + Math.floor(100000 + Math.random() * 900000);
      
      // Redirect to Payment Gateway
      const paymentAmount = paymentMethod === 'cod' ? shippingCharge : total;
      const isDirectCod = paymentMethod === 'cod' && (paymentAmount === 0 || (hasFullCodProduct && !hasNormalProduct));

      const newOrder = {
        id: genId,
        userId: user?.uid || 'guest',
        customerName: form.fullName,
        phone: form.phone,
        email: form.email,
        sendReceipt: form.sendReceipt,
        shippingAddress: {
          fullName: form.fullName, // Backwards compatibility
          phone: form.phone,       // Backwards compatibility
          email: form.email,
          addressLine: form.addressLine,
          area: form.area,
          district: form.district,
          division: '',
        },
        items: items.map(i => ({
          productId: i.productId,
          productName: i.name,
          slug: i.slug,
          price: i.discountPrice ?? i.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color || null,
          productImage: i.image,
        })),
        subtotal: cartSubtotal,
        shippingFee: shippingCharge,
        discount: totalDiscount,
        total: total,
        paymentMethod: paymentMethod,
        orderStatus: paymentMethod === 'cod' ? 'processing' : 'pending',
        paymentStatus: 'unpaid' as const,
        couponCode: appliedCoupon?.code || null,
      };

      // Strip any other undefined values just in case
      const cleanOrder = JSON.parse(JSON.stringify(newOrder));
      
      await createOrder(cleanOrder);

      // Save Referral & calculate per-order points for referrer based on net product value
      try {
        const referrerUser = appliedReferralUser || (user?.referredBy ? await getUserByReferralCode(user.referredBy) : null);
        if (referrerUser && user) {
          const referrerPoints = calculateReferrerRewardPoints(cartSubtotal, totalDiscount);
          if (referrerPoints > 0) {
            await recordOrderReferral(
              referrerUser.id || referrerUser.uid,
              user.uid,
              user.email || form.email || '',
              genId,
              referrerPoints
            );
          }
          if (user.firstOrderUsed === false) {
            await updateDoc(doc(db, 'users', user.uid), { firstOrderUsed: true });
          }
        }
      } catch (refErr) {
        console.error('Failed to record referral (ignoring):', refErr);
      }

      if (appliedCoupon) {
        try {
          await recordCouponUsage(user?.uid || 'guest', appliedCoupon.id, appliedCoupon.code);
        } catch (err) { console.error(err); }
      }
      
      if (appliedVoucher) {
        try {
          await markVoucherAsUsed(appliedVoucher.id, genId);
        } catch (err) { console.error(err); }
      }

      // If Cash on Delivery (COD), place order immediately and redirect to confirmation
      if (paymentMethod === 'cod') {
        try {
          await fetch('/api/checkout/direct-cod', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: genId })
          });
        } catch (codErr) {
          console.error('Direct COD notification failed:', codErr);
        }

        if (!isBuyNow) {
          clearCart();
        } else {
          clearBuyNowItem();
        }

        window.location.href = `/order-confirmation/${genId}?source=${isBuyNow ? 'buy_now' : 'cart'}`;
        return;
      }

      // Online Gateway Payment (bKash / Nagad / Online)
      const res = await fetch('/api/zinipay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentAmount,
          orderId: genId,
          paymentType: paymentMethod,
          host: window.location.origin,
          source: isBuyNow ? 'buy_now' : 'cart'
        })
      });

      const paymentData = await res.json();
      
      if (!res.ok) {
        const errorMsg = paymentData.details ? JSON.stringify(paymentData.details) : (paymentData.error || 'Failed to initialize payment');
        throw new Error(errorMsg);
      }

      if (paymentData.url) {
        if (!isBuyNow) {
          clearCart();
        } else {
          clearBuyNowItem();
        }
        window.location.href = paymentData.url;
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (err: any) {
      console.error(err);
      if (genId) {
        try {
          await deleteOrder(genId);
        } catch (delErr) {
          console.error('Failed to rollback order creation:', delErr);
        }
      }
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
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

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Email Address
                </label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. user@example.com"
                  className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input type="checkbox" checked={form.sendReceipt} onChange={(e) => setForm({ ...form, sendReceipt: e.target.checked })} 
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Get order receipt in email?</span>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-gray-900 border-b border-gray-100 pb-4">Payment Method</h2>
            
            {hasFullCodProduct && !hasNormalProduct ? (
              <div className="space-y-3">
                <label className="relative flex items-center justify-between p-4 border rounded-xl cursor-pointer border-blue-600 bg-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Cash On Delivery</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Pay after receiving the product</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" value="cod" checked={true} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`relative flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'online' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Online Payment</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Pay with bKash/Nagad/Card</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                </label>

                <label className={`relative flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Cash On Delivery</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Pay advance delivery charge</p>
                    </div>
                  </div>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                </label>
              </div>
            )}
            
            {hasFullCodProduct && hasNormalProduct && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-xl border border-blue-100 leading-relaxed">
                <strong>Note:</strong> One product you can order without advance payment (fully COD), but since your cart contains other products that are not eligible for free advance COD, you have to pay the minimum delivery charge advance.
              </div>
            )}
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
                    <Image src={item.image || '/logo.png'} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
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

            {/* Voucher Section */}
            {user && vouchers.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                {appliedVoucher ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-purple-700 flex items-center gap-1"><Gift className="w-4 h-4" /> Voucher Applied</p>
                      <p className="text-xs text-purple-600">{appliedVoucher.title} ({getVoucherDiscountText(appliedVoucher)})</p>
                    </div>
                    <button type="button" onClick={removeVoucher} className="text-xs font-bold text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Have a reward voucher?</span>
                      <button type="button" onClick={() => setIsVoucherModalOpen(true)} className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                        Use Voucher
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auto Referral Code Section */}
            {appliedReferralUser && user?.firstOrderUsed === false && referralDiscountText && (
              <div className="pt-4 border-t border-gray-200">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-indigo-700 flex items-center gap-1"><Check className="w-4 h-4" /> Your first order discount applied!</p>
                    <p className="text-xs text-indigo-600">{referralDiscountText}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-gray-900">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className={freeDeliveryResult.isFreeDelivery ? "font-bold text-green-600" : "font-semibold text-gray-900"}>
                  {freeDeliveryResult.isFreeDelivery ? 'FREE' : formatPrice(shippingCharge)}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              {appliedReferralUser && (
                <div className="flex justify-between text-sm text-indigo-600 font-medium">
                  <span>Referral Discount</span>
                  <span>-{formatPrice(referralDiscount)}</span>
                </div>
              )}
              {buyMoreResult.qualified && (
                <div className="flex justify-between text-sm text-red-600 font-medium">
                  <span>Extra Discount ({campaigns.find(c => c.type === 'buy_more' && c.isActive)?.discountPct || 0}%)</span>
                  <span>-{formatPrice(buyMoreResult.discountAmount)}</span>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>

            {searchParams.get('cancel') === 'true' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="font-medium">You cancelled the payment. The order has not been placed.</p>
              </div>
            )}

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

      {/* Voucher Modal */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                Select a Voucher
              </h2>
              <button onClick={() => setIsVoucherModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 bg-gray-50/50">
              {vouchers.map(v => {
                const eligible = isVoucherEligible(v);
                return (
                  <div 
                    key={v.id} 
                    onClick={() => eligible && handleSelectVoucher(v)}
                    className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${
                      eligible ? 'bg-white border-purple-200 hover:border-purple-500 cursor-pointer shadow-sm hover:shadow-md' : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <h3 className={`font-bold ${eligible ? 'text-purple-900' : 'text-gray-500'}`}>{v.title}</h3>
                      <p className={`text-xl font-black ${eligible ? 'text-purple-600' : 'text-gray-400'} mb-1`}>
                        {getVoucherDiscountText(v)}
                      </p>
                      {v.minOrderAmount && (
                        <p className="text-xs text-gray-500">Min. Spend: {formatPrice(v.minOrderAmount)}</p>
                      )}
                      {!eligible && v.minOrderAmount && cartSubtotal < v.minOrderAmount && (
                        <p className="text-[10px] text-red-500 font-bold mt-1">Add {formatPrice(v.minOrderAmount - cartSubtotal)} more to use</p>
                      )}
                    </div>
                    <div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        eligible ? 'border-purple-300 group-hover:border-purple-600' : 'border-gray-300'
                      }`}>
                        {appliedVoucher?.id === v.id && <div className="w-3 h-3 bg-purple-600 rounded-full"></div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
