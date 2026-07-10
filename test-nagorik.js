const fetch = require('node-fetch');

async function test() {
  const payload = {
    full_name: "Test User",
    email: "test@test.com",
    amount: "100",
    metadata: { order_id: "10" },
    redirect_url: "http://localhost/redirect_url.php",
    return_type: "GET",
    cancel_url: "http://localhost/cancel_url.php"
  };

  const response = await fetch('https://secure-pay.nagorikpay.com/api/payment/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'RT-UDDOKTAPAY-API-KEY': 'vZLrwKrhruRzMjq4slS2Nlsil4KjowAN218zEC9U7KH0jP548O'
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Body:', text);
}

test();
