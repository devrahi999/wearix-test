import nodemailer from 'nodemailer';
import type { Order } from '@/types/order';

export async function sendOrderReceiptEmail(order: Order) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP credentials are not fully configured. Skipping email receipt.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: SMTP_PORT === '465',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const logoUrl = 'https://res.cloudinary.com/iny5qswt/image/upload/v1784305577/20260717_222439_uxmyty.png';
  const orderDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `https://wearixbd.store${url}`;
    return `https://wearixbd.store/${url}`;
  };

  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${item.productImage ? `<img src="${getImageUrl(item.productImage)}" alt="${item.productName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;" />` : ''}
          <div>
            <p style="margin: 0; font-weight: bold; color: #111827;">${item.productName}</p>
            ${item.size ? `<p style="margin: 2px 0 0; font-size: 12px; color: #6b7280;">Size: ${item.size}</p>` : ''}
            ${item.color ? `<p style="margin: 2px 0 0; font-size: 12px; color: #6b7280;">Color: ${item.color}</p>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: center; color: #374151;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; color: #111827; font-weight: bold;">৳${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #111827; padding: 24px; text-align: center; }
        .header img { height: 75px; max-width: 100%; object-fit: contain; }
        .content { padding: 32px; }
        h1 { color: #111827; font-size: 24px; margin-top: 0; margin-bottom: 8px; }
        p { color: #4b5563; font-size: 15px; line-height: 1.5; margin-top: 0; }
        .meta-info { margin-bottom: 24px; font-size: 14px; color: #6b7280; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .table th { background-color: #f3f4f6; color: #374151; font-weight: 600; text-align: left; padding: 12px; font-size: 14px; text-transform: uppercase; }
        .table th:last-child { text-align: right; }
        .table th:nth-child(2) { text-align: center; }
        .summary { width: 100%; max-width: 300px; margin-left: auto; border-top: 2px solid #e5e7eb; padding-top: 16px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; color: #374151; }
        .summary-row.total { font-size: 18px; font-weight: bold; color: #111827; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
        .footer { background-color: #f3f4f6; padding: 24px; text-align: center; font-size: 13px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="WearixBD Logo" />
        </div>
        <div class="content">
          <h1>Order Receipt</h1>
          <p>Hi ${order.customerName}, thank you for your purchase!</p>
          <div class="meta-info">
            <strong>Order ID:</strong> ${order.id} <br />
            <strong>Date:</strong> ${orderDate} <br />
            <strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Subtotal:</span>
              <span>৳${order.subtotal.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Shipping Fee:</span>
              <span>৳${order.shippingFee.toLocaleString()}</span>
            </div>
            ${order.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ef4444;">
              <span>Discount:</span>
              <span>-৳${order.discount.toLocaleString()}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 18px; font-weight: bold; color: #111827;">
              <span>Total:</span>
              <span>৳${order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div class="footer">
          If you have any questions about your order, reply to this email or contact our support team.<br />
          &copy; ${new Date().getFullYear()} WearixBD. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"WearixBD" <${SMTP_USER}>`,
      to: order.email,
      subject: `Order Receipt - ${order.id}`,
      html,
    });
    console.log(`Order receipt email sent to ${order.email}`);
  } catch (error) {
    console.error('Failed to send order receipt email:', error);
  }
}
