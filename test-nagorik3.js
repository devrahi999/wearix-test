const fetch = require('node-fetch');

async function test() {
  const payload = {
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
    amount: "100",
    cus_name: 'Customer',
    cus_email: 'customer@wearix.com',
    cus_phone: '01700000000',
    desc: 'Order 123',
    metadata: { order_id: "123" }
  };

  const response = await fetch('https://secure-pay.nagorikpay.com/api/payment/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-KEY': 'vZLrwKrhruRzMjq4slS2Nlsil4KjowAN218zEC9U7KH0jP548O',
      'API_KEY': 'vZLrwKrhruRzMjq4slS2Nlsil4KjowAN218zEC9U7KH0jP548O',
      'X-CLIENT': 'localhost'
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Body:', text);
}

test();
