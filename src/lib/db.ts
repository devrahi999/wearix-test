import { db } from './firebase';
import { 
  collection, doc, getDoc, getDocs, query, where, orderBy, 
  setDoc, updateDoc, deleteDoc, addDoc, runTransaction, limit as fsLimit, increment, arrayUnion, onSnapshot, writeBatch
} from 'firebase/firestore';
import type { Product, Category } from '@/types/product';
import type { Order } from '@/types/order';

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export async function getProducts(options?: { category?: string }) {
  let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  if (options?.category) {
    q = query(collection(db, 'products'), where('category', '==', options.category), orderBy('createdAt', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
}

export function listenToProducts(callback: (products: Product[]) => void, options?: { category?: string }) {
  let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  if (options?.category) {
    q = query(collection(db, 'products'), where('category', '==', options.category), orderBy('createdAt', 'desc'));
  }
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
  });
}

export async function getProductBySlug(slug: string) {
  const q = query(collection(db, 'products'), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as Product;
}

export async function getProductById(id: string) {
  const snapshot = await getDoc(doc(db, 'products', id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Product;
}

// customId: admin can specify document ID (slug-based)
export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt'>,
  customId?: string
) {
  const ref = customId ? doc(db, 'products', customId) : doc(collection(db, 'products'));
  const productData = { ...data, createdAt: new Date().toISOString() };
  await setDoc(ref, productData);
  return { id: ref.id, ...productData } as Product;
}

export async function updateProduct(id: string, data: Partial<Product>) {
  await updateDoc(doc(db, 'products', id), data as any);
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, 'products', id));
}


// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export async function getCategories() {
  const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
}

export function listenToCategories(callback: (categories: Category[]) => void) {
  const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
  });
}

// customId: admin can specify the slug as document ID
export async function createCategory(data: Omit<Category, 'id'>, customId?: string) {
  const ref = customId ? doc(db, 'categories', customId) : doc(collection(db, 'categories'));
  await setDoc(ref, data);
  return { id: ref.id, ...data } as Category;
}

export async function updateCategory(id: string, data: Partial<Category>) {
  await updateDoc(doc(db, 'categories', id), data as any);
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, 'categories', id));
}


// ─── ORDERS ──────────────────────────────────────────────────────────────────
export async function getUserOrders(userId: string) {
  const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
}

export async function getOrderById(id: string) {
  const docRef = doc(db, 'orders', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

export async function getAllOrders() {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
}

export async function getOrdersByCoupon(couponCode: string) {
  const q = query(collection(db, 'orders'), where('couponCode', '==', couponCode.toUpperCase()));
  const snapshot = await getDocs(q);
  const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
  // Sort descending by createdAt locally to avoid composite index requirement
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function listenToAllOrders(callback: (orders: Order[], changes: any[]) => void) {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    callback(orders, snapshot.docChanges());
  });
}

export async function deleteOrder(id: string, userId?: string, orderStatus?: string) {
  // Delete the order document
  await deleteDoc(doc(db, 'orders', id));
  
  // Decrement user stats if applicable
  if (userId && userId !== 'guest') {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const updates: any = {
        totalOrders: increment(-1)
      };
      if (orderStatus === 'delivered') {
        updates.completedOrders = increment(-1);
      }
      await updateDoc(userRef, updates);
    }
  }
}

export async function createOrder(data: Partial<Order> & Omit<Order, 'id' | 'createdAt' | 'trackingUpdates'> & { id?: string }) {
  const newRef = data.id ? doc(db, 'orders', data.id) : doc(collection(db, 'orders'));
  const orderData = {
    ...data,
    trackingUpdates: [{ status: 'placed', message: 'Order placed successfully.', timestamp: new Date().toISOString() }],
    createdAt: new Date().toISOString()
  };
  await setDoc(newRef, orderData);

  // Increment soldCount for products if allowed by security rules
  if (data.items && data.items.length > 0) {
    for (const item of data.items) {
      if (item.productId) {
        const prodRef = doc(db, 'products', item.productId);
        try {
          await updateDoc(prodRef, {
            soldCount: increment(item.quantity),
            realSoldCount: increment(item.quantity)
          });
        } catch {
          // Ignore permission-denied error on client-side product updates
        }
      }
    }
  }

  return { id: newRef.id, ...orderData } as Order;
}

export async function updateOrderStatus(id: string, status: Order['orderStatus'], message: string, trackingLink?: string) {
  const orderRef = doc(db, 'orders', id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(orderRef);
    if (!snap.exists()) throw new Error('Order not found');
    const updates = snap.data()?.trackingUpdates || [];
    updates.push({ status, message, timestamp: new Date().toISOString() });
    
    const updateData: any = { orderStatus: status, trackingUpdates: updates };
    if (trackingLink !== undefined) {
      updateData.trackingLink = trackingLink;
    }
    
    tx.update(orderRef, updateData);
  });
  
  // Trigger referral rewards if applicable
  if (status === 'delivered' || status === 'cancelled' || status === 'returned') {
    try {
      await processReferralReward(id, status);
    } catch (err) {
      console.error('Failed to process referral reward:', err);
    }
  }
}


// ─── USERS ───────────────────────────────────────────────────────────────────
export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getUser(uid: string) {
  const docSnap = await getDoc(doc(db, 'users', uid));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as User;
  }
  return null;
}

export async function updateUser(id: string, data: Record<string, any>) {
  await updateDoc(doc(db, 'users', id), data);
}


// ─── HERO BANNERS ─────────────────────────────────────────────────────────────
export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;       // e.g. /shop/jerseys or /product/my-product
  buttonText: string;
  isActive: boolean;
  order: number;
}

export async function getHeroBanners() {
  const q = query(collection(db, 'heroBanners'), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HeroBanner));
}

export function listenToHeroBanners(callback: (banners: HeroBanner[]) => void) {
  const q = query(collection(db, 'heroBanners'), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HeroBanner)));
  });
}

export async function saveHeroBanner(data: Omit<HeroBanner, 'id'>, id?: string) {
  const ref = id ? doc(db, 'heroBanners', id) : doc(collection(db, 'heroBanners'));
  await setDoc(ref, data);
  return { id: ref.id, ...data } as HeroBanner;
}

export async function deleteHeroBanner(id: string) {
  await deleteDoc(doc(db, 'heroBanners', id));
}


// ─── PROMO BANNERS ────────────────────────────────────────────────────────────
export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  buttonText: string;
  isActive: boolean;
  order: number;
}

export async function getPromoBanners() {
  const q = query(collection(db, 'promoBanners'), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PromoBanner));
}

export function listenToPromoBanners(callback: (banners: PromoBanner[]) => void) {
  const q = query(collection(db, 'promoBanners'), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PromoBanner)));
  });
}

export async function savePromoBanner(data: Omit<PromoBanner, 'id'>, id?: string) {
  const ref = id ? doc(db, 'promoBanners', id) : doc(collection(db, 'promoBanners'));
  await setDoc(ref, data);
  return { id: ref.id, ...data } as PromoBanner;
}

export async function deletePromoBanner(id: string) {
  await deleteDoc(doc(db, 'promoBanners', id));
}


// ─── FLASH SALE ───────────────────────────────────────────────────────────────
export interface FlashSaleConfig {
  isActive: boolean;
  endsAt: string; // ISO string
  label: string;
}

export async function getFlashSaleConfig(): Promise<FlashSaleConfig | null> {
  const snapshot = await getDoc(doc(db, 'config', 'flashSale'));
  return snapshot.exists() ? (snapshot.data() as FlashSaleConfig) : null;
}

export function listenToFlashSaleConfig(callback: (config: FlashSaleConfig | null) => void) {
  return onSnapshot(doc(db, 'config', 'flashSale'), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data() as FlashSaleConfig) : null);
  });
}

export async function updateFlashSaleConfig(data: FlashSaleConfig) {
  await setDoc(doc(db, 'config', 'flashSale'), data);
}


// ─── COUPONS ─────────────────────────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed' | 'free_delivery';
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  validCategories?: string[];
  validProducts?: string[];
  allowedUsers?: string[];
}

export async function getCoupons() {
  const snapshot = await getDocs(collection(db, 'coupons'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Coupon));
}

export function listenToCoupons(callback: (coupons: Coupon[]) => void) {
  return onSnapshot(collection(db, 'coupons'), (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Coupon)));
  });
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const q = query(collection(db, 'coupons'), where('code', '==', code.toUpperCase()), where('isActive', '==', true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Coupon;
}

export async function saveCoupon(data: Omit<Coupon, 'id' | 'usedCount'>, customId?: string) {
  const ref = customId
    ? doc(db, 'coupons', customId)
    : doc(collection(db, 'coupons'));
  // Ensure we don't accidentally overwrite usedCount if updating
  let usedCount = 0;
  if (customId) {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      usedCount = existing.data().usedCount || 0;
    }
  }
  const couponData = { ...data, code: data.code.toUpperCase(), usedCount };
  await setDoc(ref, couponData, { merge: true });
  return { id: ref.id, ...couponData } as Coupon;
}

export async function hasUserUsedCoupon(userId: string, code: string): Promise<boolean> {
  if (!userId || userId === 'guest') return false;
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return false;
  const couponsUsed = snap.data().couponsUsed || [];
  return couponsUsed.includes(code.toUpperCase());
}

export async function recordCouponUsage(userId: string, couponId: string, code: string) {
  // Increment coupon usedCount
  const couponRef = doc(db, 'coupons', couponId);
  await updateDoc(couponRef, {
    usedCount: increment(1)
  });

  // Add to user's couponsUsed
  if (userId && userId !== 'guest') {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      couponsUsed: arrayUnion(code.toUpperCase())
    });
  }
}

export async function updateCoupon(id: string, data: Partial<Coupon>) {
  await updateDoc(doc(db, 'coupons', id), data as any);
}

export async function deleteCoupon(id: string) {
  await deleteDoc(doc(db, 'coupons', id));
}

// ─── STORE SETTINGS ──────────────────────────────────────────────────────────
export interface StoreSettings {
  email: string;
  phone: string;
  whatsapp: string;
  facebook?: string;
  instagram?: string;
  defaultDeliveryCharge: number;
  districtDeliveryCharges: Record<string, number>;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const snap = await getDoc(doc(db, 'config', 'settings'));
  if (!snap.exists()) {
    return {
      email: '',
      phone: '',
      whatsapp: '',
      defaultDeliveryCharge: 120,
      districtDeliveryCharges: {}
    };
  }
  return snap.data() as StoreSettings;
}

export async function updateStoreSettings(data: StoreSettings) {
  await setDoc(doc(db, 'config', 'settings'), data);
}

// ─── MARKETING SETTINGS (Top Banner & Popup) ───────────────────────────────
export interface MarketingSettings {
  topBannerActive: boolean;
  topBannerText: string;
  topBannerLink: string;
  popupActive: boolean;
  popupImage: string;
  popupLink: string;
}

export async function getMarketingSettings(): Promise<MarketingSettings> {
  const snap = await getDoc(doc(db, 'config', 'marketing'));
  if (!snap.exists()) {
    return {
      topBannerActive: false,
      topBannerText: 'Welcome to our store!',
      topBannerLink: '/shop',
      popupActive: false,
      popupImage: '',
      popupLink: '/shop'
    };
  }
  return snap.data() as MarketingSettings;
}

export async function updateMarketingSettings(data: MarketingSettings) {
  await setDoc(doc(db, 'config', 'marketing'), data);
}

// ─── PROMOTION SETTINGS ──────────────────────────────────────────────────────
// ─── CAMPAIGNS ───────────────────────────────────────────────────────────────
export type CampaignType = 'buy_more' | 'free_delivery';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt?: string;
  address?: {
    district: string;
    area: string;
    addressLine: string;
  };
  referralCode?: string;
  referredBy?: string;
  firstOrderUsed?: boolean;
  rewardPoints?: number;
  isReferredDiscountEnabled?: boolean;
  referCodeDiscountType?: 'percent' | 'fixed' | 'free_delivery';
  referCodeDiscountValue?: number;
  totalEarnedPoints?: number;
  totalReferrals?: number;
}

export interface Campaign {
  id: string;
  type: CampaignType;
  title: string;
  description: string;
  isActive: boolean;
  minQty?: number;
  discountPct?: number;
  minOrderAmount?: number;
  categories: string[]; 
  startDate: string;
  endDate: string;
  createdAt: number;
}

export async function getCampaigns(): Promise<Campaign[]> {
  const snapshot = await getDocs(collection(db, 'campaigns'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Campaign));
}

export async function saveCampaign(data: Omit<Campaign, 'id' | 'createdAt'>): Promise<Campaign> {
  const newCampaign = {
    ...data,
    createdAt: Date.now()
  };
  const docRef = await addDoc(collection(db, 'campaigns'), newCampaign);
  return { id: docRef.id, ...newCampaign } as Campaign;
}

export async function updateCampaign(id: string, data: Partial<Campaign>) {
  await updateDoc(doc(db, 'campaigns', id), data);
}

export async function deleteCampaign(id: string) {
  await deleteDoc(doc(db, 'campaigns', id));
}

export function listenToCampaigns(callback: (data: Campaign[]) => void) {
  return onSnapshot(collection(db, 'campaigns'), (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Campaign)));
  });
}

export function listenToMarketingSettings(callback: (data: MarketingSettings) => void) {
  return onSnapshot(doc(db, 'config', 'marketing'), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as MarketingSettings);
    } else {
      callback({
        topBannerActive: false,
        topBannerText: 'Welcome to our store!',
        topBannerLink: '/shop',
        popupActive: false,
        popupImage: '',
        popupLink: '/shop'
      });
    }
  });
}

// ─── SUPPORT MESSAGES ────────────────────────────────────────────────────────
export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export async function submitSupportMessage(data: Omit<SupportMessage, 'id' | 'createdAt' | 'isRead'>) {
  const ref = doc(collection(db, 'supportMessages'));
  const docData = { ...data, createdAt: new Date().toISOString(), isRead: false };
  await setDoc(ref, docData);
  return { id: ref.id, ...docData } as SupportMessage;
}

export async function getSupportMessages() {
  const q = query(collection(db, 'supportMessages'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportMessage));
}

export async function markSupportMessageRead(id: string) {
  await updateDoc(doc(db, 'supportMessages', id), { isRead: true });
}

export async function deleteSupportMessage(id: string) {
  await deleteDoc(doc(db, 'supportMessages', id));
}

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

export async function getReviewsByProduct(productId: string) {
  const q = query(collection(db, 'reviews'), where('productId', '==', productId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ProductReview));
}

export async function getAllReviews() {
  const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ProductReview));
}

export async function submitReview(data: Omit<ProductReview, 'id' | 'createdAt'>) {
  const ref = doc(collection(db, 'reviews'));
  const docData = { ...data, createdAt: new Date().toISOString() };
  await setDoc(ref, docData);
  return { id: ref.id, ...docData } as ProductReview;
}

export async function deleteReview(id: string) {
  await deleteDoc(doc(db, 'reviews', id));
}

export async function updateOrderPaymentStatus(id: string, paymentStatus: Order['paymentStatus']) {
  try {
    const docRef = doc(db, 'orders', id);
    await updateDoc(docRef, { paymentStatus });
  } catch (error) {
    console.error('Error updating order payment status: ', error);
    throw error;
  }
}

export async function resetProductRealSoldCount(productId?: string) {
  if (productId) {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, { realSoldCount: 0 });
  } else {
    const q = collection(db, 'products');
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach(d => {
      batch.update(d.ref, { realSoldCount: 0 });
    });
    await batch.commit();
  }
}

// ─── REFERRALS & REWARDS ─────────────────────────────────────────────────────

export interface ReferralSettings {
  isActive: boolean;
  referrerRewardPoints: number;
  referredDiscountPct: number; // legacy
  defaultReferralDiscountPct: number; // legacy
  discountType?: 'percent' | 'fixed' | 'free_delivery';
  discountValue?: number;
  minOrderAmount: number;
  isReferredDiscountEnabled?: boolean;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserEmail: string;
  status: 'pending' | 'rewarded' | 'cancelled' | 'rejected';
  orderId: string;
  earnedPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface RewardRequest {
  id: string;
  userId: string;
  userEmail: string;
  pointsToRedeem: number;
  status: 'pending' | 'approved' | 'rejected';
  rewardOptionId?: string;
  rewardOptionTitle?: string;
  voucherId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RewardOption {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discountType: 'percent' | 'fixed' | 'free_delivery';
  discountValue: number;
  isActive: boolean;
  createdAt: string;
}

export async function getRewardOptions() {
  const q = query(collection(db, 'reward_options'), orderBy('pointsCost', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RewardOption));
}

export async function createRewardOption(data: Omit<RewardOption, 'id' | 'createdAt'>) {
  const ref = doc(collection(db, 'reward_options'));
  const docData = { ...data, createdAt: new Date().toISOString() };
  await setDoc(ref, docData);
  return { id: ref.id, ...docData } as RewardOption;
}

export async function updateRewardOption(id: string, data: Partial<RewardOption>) {
  await updateDoc(doc(db, 'reward_options', id), data);
}

export async function deleteRewardOption(id: string) {
  await deleteDoc(doc(db, 'reward_options', id));
}

export interface UserVoucher {
  id: string;
  userId: string;
  title: string;
  discountType: 'percent' | 'fixed' | 'free_delivery';
  discountValue: number;
  validCategories?: string[];
  validProducts?: string[];
  minOrderAmount?: number;
  isUsed: boolean;
  createdAt: string;
  usedAt?: string;
  orderId?: string;
}

export async function getUserVouchers(userId: string) {
  const q = query(collection(db, 'user_vouchers'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserVoucher));
}

export async function createUserVoucher(data: Omit<UserVoucher, 'id' | 'createdAt' | 'isUsed'>) {
  const ref = doc(collection(db, 'user_vouchers'));
  const docData = { ...data, isUsed: false, createdAt: new Date().toISOString() };
  await setDoc(ref, docData);
  return { id: ref.id, ...docData } as UserVoucher;
}

export async function processRewardApproval(
  requestId: string, 
  userId: string, 
  pointsCost: number,
  voucherData: Omit<UserVoucher, 'id' | 'createdAt' | 'isUsed' | 'userId'>
) {
  await runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', userId);
    const reqRef = doc(db, 'reward_requests', requestId);
    
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error('User not found');
    const userData = userSnap.data();
    
    if ((userData.rewardPoints || 0) < pointsCost) {
      throw new Error('User does not have enough points');
    }
    
    // Create voucher
    const voucherRef = doc(collection(db, 'user_vouchers'));
    const docData = { ...voucherData, userId, isUsed: false, createdAt: new Date().toISOString() };
    tx.set(voucherRef, docData);
    
    // Update request
    tx.update(reqRef, { 
      status: 'approved', 
      voucherId: voucherRef.id,
      updatedAt: new Date().toISOString()
    });
    
    // Deduct points
    tx.update(userRef, {
      rewardPoints: increment(-pointsCost)
    });
  });
}

export async function updateUserVoucher(id: string, data: Partial<UserVoucher>) {
  await updateDoc(doc(db, 'user_vouchers', id), data as any);
}

export async function markVoucherAsUsed(voucherId: string, orderId: string) {
  await updateDoc(doc(db, 'user_vouchers', voucherId), {
    isUsed: true,
    usedAt: new Date().toISOString(),
    orderId: orderId
  });
}

export async function getReferralSettings(): Promise<ReferralSettings> {
  const snap = await getDoc(doc(db, 'config', 'referral'));
  if (!snap.exists()) {
    return { isActive: true, isReferredDiscountEnabled: true, defaultReferralDiscountPct: 10, defaultRewardPoints: 50 };
  }
  return snap.data() as ReferralSettings;
}

export async function updateReferralSettings(data: Partial<ReferralSettings>) {
  const ref = doc(db, 'config', 'referral');
  await setDoc(ref, data, { merge: true });
}

export async function getUserByReferralCode(code: string) {
  const q = query(collection(db, 'users'), where('referralCode', '==', code.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
}

export async function createReferral(data: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = doc(collection(db, 'referrals'));
  const docData = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await setDoc(ref, docData);
  return { id: ref.id, ...docData } as Referral;
}

/**
 * Calculate referrer reward points for an order.
 * Safe Formula:
 * 1 point = per ৳25 net product value
 * Net Product Value = Product subtotal minus all applied discounts (coupon, voucher, referral, etc.)
 * Shipping fee is NOT included.
 * Points are rounded down to flat integer (no decimals).
 * Cap: Maximum 80 points per order.
 */
export function calculateReferrerRewardPoints(
  subtotal: number,
  discount: number,
  items?: Array<{ price: number; discountPrice?: number; quantity: number; isClearance?: boolean }>
): number {
  let effectiveSubtotal = subtotal;

  if (items && items.length > 0) {
    const clearanceSubtotal = items
      .filter(i => i?.isClearance)
      .reduce((sum, i) => sum + ((i.discountPrice ?? i.price) * i.quantity), 0);
    effectiveSubtotal = Math.max(0, subtotal - clearanceSubtotal);
  }

  const netProductValue = Math.max(0, effectiveSubtotal - discount);
  const points = Math.floor(netProductValue / 25);
  return Math.min(80, points);
}

export async function recordOrderReferral(
  referrerId: string,
  referredUserId: string,
  referredUserEmail: string,
  orderId: string,
  earnedPoints: number
) {
  if (!referrerId || !referredUserId || !orderId) return;

  try {
    // Check if there is a pending referral record with an empty orderId (created at signup)
    const qEmpty = query(
      collection(db, 'referrals'),
      where('referredUserId', '==', referredUserId),
      where('status', '==', 'pending'),
      where('orderId', '==', '')
    );
    const snapEmpty = await getDocs(qEmpty);

    if (!snapEmpty.empty) {
      const refDoc = snapEmpty.docs[0];
      await updateDoc(refDoc.ref, {
        referrerId,
        orderId,
        earnedPoints,
        updatedAt: new Date().toISOString()
      });
      return;
    }

    // Check if there is already a referral record for this exact orderId
    const qOrder = query(
      collection(db, 'referrals'),
      where('orderId', '==', orderId)
    );
    const snapOrder = await getDocs(qOrder);
    if (!snapOrder.empty) {
      const refDoc = snapOrder.docs[0];
      await updateDoc(refDoc.ref, {
        referrerId,
        earnedPoints,
        updatedAt: new Date().toISOString()
      });
      return;
    }

    // Otherwise, create a new referral record for this order
    await createReferral({
      referrerId,
      referredUserId,
      referredUserEmail: referredUserEmail || 'No Email',
      status: 'pending',
      orderId,
      earnedPoints
    });
  } catch (err) {
    console.error('Error in recordOrderReferral:', err);
  }
}

export async function updatePendingReferral(referredUserId: string, orderId: string, earnedPoints: number) {
  const q = query(collection(db, 'referrals'), where('referredUserId', '==', referredUserId), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const refDoc = snap.docs[0];
    await updateDoc(refDoc.ref, { orderId, earnedPoints, updatedAt: new Date().toISOString() });
  }
}


export async function getReferralsByUser(userId: string) {
  const q = query(collection(db, 'referrals'), where('referrerId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Referral));
}

export async function getAllReferrals() {
  const q = query(collection(db, 'referrals'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Referral));
}

export async function createRewardRequest(data: Omit<RewardRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) {
  const ref = doc(collection(db, 'reward_requests'));
  const docData = { ...data, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await setDoc(ref, docData);
  return { id: ref.id, ...docData } as RewardRequest;
}

export async function getUserRewardRequests(userId: string) {
  const q = query(collection(db, 'reward_requests'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as RewardRequest));
}

export async function getAllRewardRequests() {
  const q = query(collection(db, 'reward_requests'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as RewardRequest));
}

export async function updateRewardRequest(id: string, data: Partial<RewardRequest>) {
  await updateDoc(doc(db, 'reward_requests', id), { ...data, updatedAt: new Date().toISOString() });
}

export async function processReferralReward(orderId: string, status: Order['orderStatus']) {
  if (status !== 'delivered' && status !== 'cancelled' && status !== 'returned') return;

  const q = query(collection(db, 'referrals'), where('orderId', '==', orderId), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  if (snap.empty) return;

  const referralDoc = snap.docs[0];
  const referral = referralDoc.data() as Referral;
  
  if (status === 'delivered') {
    await updateDoc(referralDoc.ref, { status: 'rewarded', updatedAt: new Date().toISOString() });
    await updateDoc(doc(db, 'users', referral.referrerId), {
      rewardPoints: increment(referral.earnedPoints),
      totalEarnedPoints: increment(referral.earnedPoints),
      totalReferrals: increment(1)
    });
  } else {
    await updateDoc(referralDoc.ref, { status: 'cancelled', updatedAt: new Date().toISOString() });
  }
}
