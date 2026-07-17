import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendTelegramOrderAlert } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (orderDoc.data()?.telegramAlertSent) {
      return NextResponse.json({ success: true });
    }

    // Update paymentStatus to indicate COD is confirmed without advance and mark alert as sent
    await orderRef.update({ 
      paymentStatus: 'delivery_charge_paid',
      telegramAlertSent: true
    });
    
    // Send Telegram alert
    await sendTelegramOrderAlert(orderId, 'cod');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to process direct COD order:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
