import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { PaymentStatus, Order } from '@/types/order';
import { sendTelegramOrderAlert } from '@/lib/telegram';
import { sendOrderReceiptEmail } from '@/lib/email';

export async function POST(req: Request) {
  return handleWebhook(req);
}

export async function GET(req: Request) {
  return handleWebhook(req);
}

async function handleWebhook(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get('order_id');
  const type = url.searchParams.get('type');
  
  let invoiceId = url.searchParams.get('invoice_id');
  let statusStr = url.searchParams.get('status');

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      if (body.invoice_id) invoiceId = body.invoice_id;
      if (body.status !== undefined) statusStr = String(body.status);
    } catch (e) {
      console.error('Webhook JSON parse error:', e);
    }
  }

  if (!invoiceId) {
    return NextResponse.json({ error: 'Missing invoice_id' }, { status: 400 });
  }

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
  }

  try {
    // 5. Verify invoice
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
      console.error('ZiniPay webhook verification not completed:', verifyData);
      return NextResponse.json({ status: 'pending_or_failed' }, { status: 200 });
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (orderDoc.data()?.telegramAlertSent) {
      return NextResponse.json({ status: 'already_processed' }, { status: 200 });
    }

    const paymentStatus: PaymentStatus = type === 'cod' ? 'delivery_charge_paid' : 'paid';
    
    // 6. If completed, mark paid and processing
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

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (err) {
    console.error('Webhook processing failed:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
