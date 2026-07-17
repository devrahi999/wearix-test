import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, orderId, paymentType, host, source } = await req.json();

    const apiKey = process.env.ZINIPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ZINIPAY_API_KEY not found in env' }, { status: 500 });
    }

    const sourceParam = source ? `&source=${source}` : '';
    // We add order_id and type to redirect_url so we know which order to complete.
    // ZiniPay also appends invoice_id to the webhook or redirect depending on their implementation.
    const successUrl = `${host}/api/zinipay/callback/success?order_id=${orderId}&type=${paymentType}${sourceParam}`;
    const cancelUrl = `${host}/api/zinipay/callback/cancel?order_id=${orderId}${sourceParam}`;
    const webhookUrl = `${host}/api/zinipay/webhook?order_id=${orderId}&type=${paymentType}`;
    
    const payload = {
      cus_name: 'Customer',
      cus_email: 'customer@wearixbd.com',
      amount: Number(amount),
      metadata: {
        order_id: orderId,
        payment_type: paymentType
      },
      redirect_url: successUrl,
      cancel_url: cancelUrl,
      webhook_url: webhookUrl
    };

    const response = await fetch('https://api.zinipay.com/v1/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'zini-api-key': apiKey,
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.status === true && data.payment_url) {
      return NextResponse.json({ url: data.payment_url });
    } else {
      return NextResponse.json({ error: 'Failed to generate payment url', details: data }, { status: 400 });
    }

  } catch (error: any) {
    console.error('ZiniPay checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
