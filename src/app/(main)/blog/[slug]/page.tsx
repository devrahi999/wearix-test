'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { useMemo } from 'react';

export default function BlogPostPage() {
  const params = useParams();
  const slug = (params.slug as string) || '';

  const posts = [
    {
      title: 'How to Choose the Right Size for Traditional Panjabis',
      slug: 'choose-right-panjabi-size',
      date: 'July 4, 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e4?w=1200&h=600&fit=crop',
      content: (
        <>
          <p>
            Traditional wear like panjabis and kurtas are designed with distinct drapes and fits. Sizing is often different compared to western wear shirts.
          </p>
          <h3 className="font-bold text-gray-900 text-lg mt-6">1. Chest Measurements are Key</h3>
          <p>
            When buying a slim-fit or regular panjabi, your actual chest measurement is the most critical metric. Take a measuring tape and measure around the fullest part of your chest, keeping the tape parallel to the floor. Add 2 to 4 inches to that number to find the correct panjabi chest size.
          </p>
          <h3 className="font-bold text-gray-900 text-lg mt-6">2. Sleeve Length and Armholes</h3>
          <p>
            Unlike casual shirts, panjabi sleeves should end exactly at the wrist bone. Make sure the shoulder seam rests exactly on the outer edge of your shoulder bone to ensure the garment does not sag.
          </p>
        </>
      ),
    },
    {
      title: 'Jerseys Styling Guide: Streetwear Outfits',
      slug: 'styling-jerseys-streetwear',
      date: 'June 28, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=1200&h=600&fit=crop',
      content: (
        <>
          <p>
            Sports jerseys are no longer confined to stadium terraces. They have become core components of modern streetwear.
          </p>
          <h3 className="font-bold text-gray-900 text-lg mt-6">1. The Oversized Aesthetic</h3>
          <p>
            Pair your favorite Bangladesh cricket or football jersey with wide-leg utility cargo pants or relaxed chinos. Buy one size up for that boxy streetwear look.
          </p>
          <h3 className="font-bold text-gray-900 text-lg mt-6">2. Layering with Hoodies</h3>
          <p>
            In cooler weather, lay a graphic sports jersey over a plain black or white long-sleeve pullover hoodie. Pull the hood out for a layered look.
          </p>
        </>
      ),
    },
    {
      title: 'Dhaka Winter Essentials: Layers That Breathe',
      slug: 'dhaka-winter-layering-essentials',
      date: 'May 15, 2026',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=1200&h=600&fit=crop',
      content: (
        <>
          <p>
            Dhaka winter temperature drops to mild levels. Heavy wool coats are too warm, while single t-shirts are too thin.
          </p>
          <h3 className="font-bold text-gray-900 text-lg mt-6">1. 320 GSM Fleece Hoodies</h3>
          <p>
            Our fleece hoodies provide the perfect thickness. The soft brushed inner lining holds body warmth, while the combed cotton outer layer allows sweat to evaporate during sunny afternoons.
          </p>
        </>
      ),
    },
  ];

  const post = useMemo(() => {
    return posts.find((p) => p.slug === slug) || posts[0];
  }, [slug]);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      {/* Back Link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Blog List
      </Link>

      {/* Header Info */}
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-snug">
          {post.title}
        </h1>
        <div className="flex items-center justify-between border-y py-3 border-gray-100 text-xs text-gray-400 font-semibold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {post.readTime}
            </span>
          </div>
          <button className="flex items-center gap-1 hover:text-blue-600">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative aspect-[16/9] bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
        <img src={post.image} alt="" className="object-cover w-full h-full" />
      </div>

      {/* Rich Body Content */}
      <div className="text-sm text-gray-600 leading-relaxed text-justify space-y-4 pt-4">
        {post.content}
      </div>
    </article>
  );
}
