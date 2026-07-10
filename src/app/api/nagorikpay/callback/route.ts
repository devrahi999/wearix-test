import { NextResponse } from 'next/server';
import { updateOrderPaymentStatus, deleteOrder } from '@/lib/db';
import type { PaymentStatus } from '@/types/order';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get('order_id');
  const status = url.searchParams.get('status');
  const type = url.searchParams.get('type');
  const source = url.searchParams.get('source') || '';

  if (!orderId) {
    return NextResponse.redirect(new URL('/shop', req.url));
  }

  if (status === 'success') {
    try {
      const paymentStatus: PaymentStatus = type === 'cod' ? 'delivery_charge_paid' : 'paid';
      await updateOrderPaymentStatus(orderId, paymentStatus);
      return NextResponse.redirect(new URL(`/order-confirmation/${orderId}?source=${source}`, req.url));
    } catch (err) {
      console.error('Failed to update payment status:', err);
      // fallback
      return NextResponse.redirect(new URL(`/order-confirmation/${orderId}?error=payment_update_failed&source=${source}`, req.url));
    }
  } else {
    // Cancelled or failed
    try {
      await deleteOrder(orderId);
    } catch (err) {
      console.error('Failed to delete order on payment cancel:', err);
    }
    
    if (source === 'buy_now') {
      return NextResponse.redirect(new URL(`/checkout?buy_now=true&cancel=true`, req.url));
    }
    return NextResponse.redirect(new URL(`/cart?cancel=true`, req.url));
  }
}
