import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, orderId, paymentType, host, source } = await req.json();

    const apiKey = process.env.NAGORIKPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NAGORIKPAY_API_KEY not found in env' }, { status: 500 });
    }

    const sourceParam = source ? `&source=${source}` : '';
    const successUrl = `${host}/api/nagorikpay/callback/success?order_id=${orderId}&type=${paymentType}${sourceParam}`;
    const cancelUrl = `${host}/api/nagorikpay/callback/cancel?order_id=${orderId}${sourceParam}`;
    
    let hostName = '';
    try {
      hostName = new URL(host).hostname;
    } catch(e) {}

    const payload = {
      success_url: successUrl,
      cancel_url: cancelUrl,
      amount: amount.toString(),
      cus_name: 'Customer',
      cus_email: 'customer@wearix.com',
      cus_phone: '01700000000',
      desc: 'Order ' + orderId,
      metadata: { order_id: orderId }
    };

    const response = await fetch('https://secure-pay.nagorikpay.com/api/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': apiKey,
        'API_KEY': apiKey,
        ...(hostName ? { 'X-CLIENT': hostName } : {})
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.payment_url) {
      return NextResponse.json({ url: data.payment_url });
    } else if (data.url) {
      return NextResponse.json({ url: data.url });
    } else {
      return NextResponse.json({ error: 'Failed to generate payment url', details: data }, { status: 400 });
    }

  } catch (error: any) {
    console.error('NagorikPay checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
