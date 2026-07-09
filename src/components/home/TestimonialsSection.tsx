import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Rahim Uddin',
    location: 'Dhaka',
    rating: 5,
    text: 'Ordered a panjabi for Eid — the quality was outstanding! Delivered on time and the embroidery was exactly as shown. Will order again!',
    avatar: 'RU',
  },
  {
    name: 'Nusrat Jahan',
    location: 'Chittagong',
    rating: 5,
    text: 'Bought 3 kurtis last month. All of them are great quality and the colors are vibrant. bKash payment was super easy. Highly recommend Wearix!',
    avatar: 'NJ',
  },
  {
    name: 'Tanvir Ahmed',
    location: 'Sylhet',
    rating: 4,
    text: 'Got the Bangladesh cricket jersey for my son. He absolutely loves it! Fast delivery to Sylhet and packaging was neat. Great service.',
    avatar: 'TA',
  },
  {
    name: 'Fatema Begum',
    location: 'Rajshahi',
    rating: 5,
    text: 'The hoodie is so comfortable for winter. Cash on delivery option made me feel safe to order. Very happy with my purchase from Wearix!',
    avatar: 'FB',
  },
];

export default function TestimonialsSection() {
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What Our Customers Say</h2>
        <p className="text-gray-500 text-sm mt-2">Trusted by thousands of happy shoppers across Bangladesh</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400">{t.location}</p>
              </div>
            </div>
            <div className="flex mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
          </div>
        ))}
      </div>
    </section>
  );
}
