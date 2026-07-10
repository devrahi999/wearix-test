import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { PaymentStatus } from '@/types/order';
import { sendTelegramOrderAlert } from '@/lib/telegram';

export async function GET(req: Request) {
  return handleRequest(req);
}

export async function POST(req: Request) {
  return handleRequest(req);
}

async function handleRequest(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get('order_id');
  const type = url.searchParams.get('type');
  const source = url.searchParams.get('source') || '';

  if (!orderId) {
    return NextResponse.redirect(new URL('/shop', req.url), 303);
  }

  try {
    const paymentStatus: PaymentStatus = type === 'cod' ? 'delivery_charge_paid' : 'paid';
    await adminDb.collection('orders').doc(orderId).update({ paymentStatus });
    
    // Send Telegram alert
    await sendTelegramOrderAlert(orderId, type || 'online');

    return NextResponse.redirect(new URL(`/order-confirmation/${orderId}?source=${source}`, req.url), 303);
  } catch (err) {
    console.error('Failed to update payment status:', err);
    return NextResponse.redirect(new URL(`/order-confirmation/${orderId}?error=payment_update_failed&source=${source}`, req.url), 303);
  }
}
