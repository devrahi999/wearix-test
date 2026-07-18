import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { PaymentStatus, Order } from '@/types/order';
import { sendTelegramOrderAlert } from '@/lib/telegram';
import { sendOrderReceiptEmail } from '@/lib/email';

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

  let invoiceId = url.searchParams.get('invoice_id');

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      if (body.invoice_id) invoiceId = body.invoice_id;
    } catch(e) {}
  }

  if (!orderId) {
    return NextResponse.redirect(new URL('/shop', req.url), 303);
  }

  try {
    if (!invoiceId) {
      // User returned without invoice (e.g. manual review pending)
      return NextResponse.redirect(new URL(`/?toast=payment_pending`, req.url), 303);
    }

    const verifyRes = await fetch('https://api.zinipay.com/v1/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'zini-api-key': process.env.ZINIPAY_API_KEY || ''
      },
      body: JSON.stringify({ invoice_id: invoiceId })
    });
    const verifyData = await verifyRes.json();
    
    if (verifyData.status !== 'COMPLETED') {
      console.error('ZiniPay verification not completed:', verifyData);
      return NextResponse.redirect(new URL(`/?toast=payment_pending`, req.url), 303);
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return NextResponse.redirect(new URL('/shop', req.url), 303);
    }

    if (orderDoc.data()?.telegramAlertSent) {
      return NextResponse.redirect(new URL(`/order-confirmation/${orderId}?source=${source}`, req.url), 303);
    }

    const paymentStatus: PaymentStatus = type === 'cod' ? 'delivery_charge_paid' : 'paid';
    await orderRef.update({ 
      paymentStatus,
      orderStatus: 'processing',
      telegramAlertSent: true,
      zinipayInvoiceId: invoiceId
    });
    
    // Send Telegram alert
    await sendTelegramOrderAlert(orderId, type || 'online');

    // Send email receipt if opted in
    const orderData = orderDoc.data() as Order;
    if (orderData.sendReceipt && orderData.email) {
      await sendOrderReceiptEmail(orderData);
    }

    return NextResponse.redirect(new URL(`/order-confirmation/${orderId}?source=${source}`, req.url), 303);
  } catch (err) {
    console.error('Failed to update payment status:', err);
    return NextResponse.redirect(new URL(`/order-confirmation/${orderId}?error=payment_update_failed&source=${source}`, req.url), 303);
  }
}
