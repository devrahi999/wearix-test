import { getOrderById } from '@/lib/db';
import { formatPrice } from '@/lib/utils';

export async function sendTelegramOrderAlert(orderId: string, type: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;
  
  if (!token || !chatId) {
    console.warn('Telegram credentials not configured');
    return;
  }
  
  try {
    const order = await getOrderById(orderId);
    if (!order) return;
    
    const paymentMethodStr = type === 'cod' ? 'Cash on Delivery (Delivery Charge Paid)' : 'Online Payment (Full Paid)';
    const totalAmount = formatPrice(order.total);
    
    let itemsStr = '';
    order.items.forEach((item: any, i: number) => {
      itemsStr += `${i + 1}. ${item.productName} (x${item.quantity}) - ${formatPrice(item.price * item.quantity)}\n`;
    });
    
    const message = `🛍️ *NEW ORDER RECEIVED!*\n\n` +
      `*Order ID:* \`${orderId}\`\n` +
      `*Customer:* ${order.shippingAddress?.fullName || order.customerName}\n` +
      `*Phone:* ${order.shippingAddress?.phone || order.phone}\n` +
      `*Total Amount:* ${totalAmount}\n` +
      `*Payment:* ${paymentMethodStr}\n\n` +
      `*Items:*\n${itemsStr}\n` +
      `Login to admin panel for full details.`;
      
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error('Telegram alert failed:', error);
  }
}
