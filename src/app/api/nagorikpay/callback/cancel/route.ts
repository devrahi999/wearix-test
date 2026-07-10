import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  return handleRequest(req);
}

export async function POST(req: Request) {
  return handleRequest(req);
}

async function handleRequest(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get('order_id');
  const source = url.searchParams.get('source') || '';

  if (orderId) {
    try {
      await adminDb.collection('orders').doc(orderId).delete();
    } catch (err) {
      console.error('Failed to delete order on payment cancel:', err);
    }
  }
  
  if (source === 'buy_now') {
    return NextResponse.redirect(new URL(`/checkout?buy_now=true&cancel=true`, req.url), 303);
  }
  return NextResponse.redirect(new URL(`/cart?cancel=true`, req.url), 303);
}
