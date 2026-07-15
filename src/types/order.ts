export type PaymentMethod = 'bkash' | 'nagad' | 'sslcommerz' | 'cod' | 'online';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'unpaid' | 'delivery_charge_paid';
export type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  color?: string;
  basePrice?: number;
  quantity: number;
  price: number;
  discountPrice?: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  division: string;
  district: string;
  area: string;
  addressLine: string;
}

export interface TrackingUpdate {
  status: OrderStatus;
  message: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderId?: string; // backwards compatibility
  userId?: string;
  customerName?: string;
  email?: string;
  phone?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  trackingUpdates: TrackingUpdate[];
  couponCode?: string;
  trackingLink?: string;
  createdAt: string;
}
