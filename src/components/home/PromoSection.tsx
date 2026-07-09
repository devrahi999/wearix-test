import Link from 'next/link';

const promos = [
  {
    title: 'bKash Payment',
    desc: 'Pay instantly with bKash — fast and secure.',
    icon: '📱',
    color: 'bg-pink-50 border-pink-100',
    textColor: 'text-pink-700',
  },
  {
    title: 'Free Delivery',
    desc: 'Inside Dhaka on orders over ৳1,500.',
    icon: '🚚',
    color: 'bg-blue-50 border-blue-100',
    textColor: 'text-blue-700',
  },
  {
    title: 'Easy Returns',
    desc: '7-day hassle-free return policy.',
    icon: '🔄',
    color: 'bg-green-50 border-green-100',
    textColor: 'text-green-700',
  },
  {
    title: 'Cash on Delivery',
    desc: 'Pay when you receive — no risk.',
    icon: '💵',
    color: 'bg-yellow-50 border-yellow-100',
    textColor: 'text-yellow-700',
  },
];

export default function PromoSection() {
  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {promos.map((p) => (
          <div
            key={p.title}
            className={`flex items-start gap-3 p-4 rounded-xl border ${p.color}`}
          >
            <span className="text-2xl shrink-0">{p.icon}</span>
            <div>
              <p className={`text-sm font-semibold ${p.textColor}`}>{p.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
