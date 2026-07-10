import { NextResponse } from 'next/server';
import { updateOrderPaymentStatus } from '@/lib/db';
import type { PaymentStatus } from '@/types/order';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get('order_id');
  const status = url.searchParams.get('status');
  const type = url.searchParams.get('type');

  if (!orderId) {
    return NextResponse.redirect(new URL('/shop', req.url));
  }

  if (status === 'success') {
    try {
      const paymentStatus: PaymentStatus = type === 'cod' ? 'delivery_charge_paid' : 'paid';
      await updateOrderPaymentStatus(orderId, paymentStatus);
      return NextResponse.redirect(new URL(`/order-confirmation/${orderId}`, req.url));
    } catch (err) {
      console.error('Failed to update payment status:', err);
      // fallback
      return NextResponse.redirect(new URL(`/order-confirmation/${orderId}?error=payment_update_failed`, req.url));
    }
  } else {
    // Cancelled or failed
    try {
      await updateOrderPaymentStatus(orderId, 'failed');
    } catch (err) {}
    
    return NextResponse.redirect(new URL(`/order-confirmation/${orderId}?error=payment_failed`, req.url));
  }
}
