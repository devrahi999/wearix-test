import { adminDb } from '@/lib/firebase-admin';
import { formatPrice } from '@/lib/utils';

export async function sendTelegramOrderAlert(orderId: string, type: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;
  
  if (!token || !chatId) {
    console.warn('Telegram credentials not configured');
    return;
  }
  
  try {
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) return;
    const order = orderDoc.data() as any;
    
    const paymentMethodStr = type === 'cod' ? 'Cash on Delivery (Delivery Charge Paid)' : 'Online Payment (Full Paid)';
    const totalAmount = formatPrice(order.total);
    
    let itemsStr = '';
    order.items.forEach((item: any, i: number) => {
      itemsStr += `${i + 1}. ${item.productName} (x${item.quantity}) - ${formatPrice(item.price * item.quantity)}\n`;
    });
    
    const message = `🛍️ <b>NEW ORDER RECEIVED!</b>\n\n` +
      `<b>Order ID:</b> <code>${orderId}</code>\n` +
      `<b>Customer:</b> ${order.shippingAddress?.fullName || order.customerName}\n` +
      `<b>Phone:</b> ${order.shippingAddress?.phone || order.phone}\n` +
      `<b>Total Amount:</b> ${totalAmount}\n` +
      `<b>Payment:</b> ${paymentMethodStr}\n\n` +
      `<b>Items:</b>\n${itemsStr}\n` +
      `Login to admin panel for full details.`;
      
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (!res.ok) {
      console.error('Telegram API Error:', await res.text());
    }
  } catch (error) {
    console.error('Telegram alert failed:', error);
  }
}
