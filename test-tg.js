const token = "8850835636:AAHxW3zYOOm9K6broWCIsqfDHm77sINUcYc";
const chatId = "-1003902191415";
const url = `https://api.telegram.org/bot${token}/sendMessage`;
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: chatId,
    text: "Test message from wearix",
  })
}).then(res => res.json()).then(console.log).catch(console.error);
