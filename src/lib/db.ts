import { db } from './firebase';
import { 
  collection, doc, getDoc, getDocs, query, where, orderBy, 
  setDoc, updateDoc, deleteDoc, runTransaction, limit as fsLimit, increment, arrayUnion, onSnapshot
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
}


// ─── USERS ───────────────────────────────────────────────────────────────────
export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
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
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  validCategories?: string[];
  validProducts?: string[];
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
