import Link from 'next/link';

export default function BlogListPage() {
  const posts = [
    {
      title: 'How to Choose the Right Size for Traditional Panjabis',
      slug: 'choose-right-panjabi-size',
      excerpt:
        'Sizing can be tricky when switching between brands. Learn how to accurately measure your chest and sleeve to find the perfect fit.',
      date: 'July 4, 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e4?w=800',
    },
    {
      title: 'Jerseys Styling Guide: Streetwear Outfits',
      slug: 'styling-jerseys-streetwear',
      excerpt:
        'Ditch the pitch and sport your favorite sports jersey in style. Here are 5 ways to pair jerseys with jeans and cargos for modern streetwear.',
      date: 'June 28, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=800',
    },
    {
      title: 'Dhaka Winter Essentials: Layers That Breathe',
      slug: 'dhaka-winter-layering-essentials',
      excerpt:
        'Winter in Dhaka is mild yet cool. Learn about layering light fleece hoodies and polos that keep you snug without causing sweat.',
      date: 'May 15, 2026',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-5 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Style Guides & Sizing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Explore tips, tricks, and sizing tutorials to perfect your daily wardrobe choices.
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
              <img src={post.image} alt={post.title} className="object-cover w-full h-full" />
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="font-bold text-gray-900 text-base line-clamp-2 hover:text-blue-600 transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{post.excerpt}</p>
              <div className="pt-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Read Article &rarr;
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
