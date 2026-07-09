'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: 'What are the delivery charges at Wearix?',
      a: 'We charge a flat fee of ৳60 for deliveries inside Dhaka and ৳120 for deliveries outside Dhaka. Enjoy FREE shipping inside Dhaka for orders above ৳1,500.',
    },
    {
      q: 'How long will it take to get my order?',
      a: 'Deliveries within Dhaka are completed within 24 to 48 hours. Deliveries outside Dhaka typically take 2 to 4 business days.',
    },
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes! Cash on Delivery is available all over Bangladesh. You pay the courier agent only after receiving your parcel.',
    },
    {
      q: 'What is your return policy?',
      a: 'We offer a 7-day hassle-free return and exchange policy. If the size does not fit or you find a product defect, contact us via WhatsApp or phone to log a exchange request.',
    },
    {
      q: 'How can I pay for my orders?',
      a: 'We accept payments via bKash, Nagad, Visa, Mastercard, and Cash on Delivery.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="text-center space-y-2 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-extrabold text-gray-900">Frequently Asked Questions</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Find answers to popular questions about order placements, payments, and returns.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm sm:text-base focus:outline-none"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-blue-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
