import { NextResponse } from 'next/server';
import { deleteOrder } from '@/lib/db';

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
      await deleteOrder(orderId);
    } catch (err) {
      console.error('Failed to delete order on payment cancel:', err);
    }
  }
  
  if (source === 'buy_now') {
    return NextResponse.redirect(new URL(`/checkout?buy_now=true&cancel=true`, req.url), 303);
  }
  return NextResponse.redirect(new URL(`/cart?cancel=true`, req.url), 303);
}
