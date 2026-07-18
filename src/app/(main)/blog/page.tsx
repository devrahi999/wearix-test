import Link from 'next/link';
import { getBlogs } from '@/lib/db';
import { SITE_NAME } from '@/constants';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Blog | ${SITE_NAME}`,
  description: 'Style Guides, Sizing, and more.',
};

export default async function BlogListPage() {
  let posts: any[] = [];
  try {
    posts = await getBlogs();
  } catch (error) {
    console.warn('Failed to fetch blogs, likely due to missing permissions:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="border-b border-gray-100 pb-5 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Style Guides & Sizing</h1>
        <p className="text-sm text-gray-500 mt-1">Explore tips, tricks, and sizing tutorials to perfect your daily wardrobe choices.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.slug} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
              <img src={post.image} alt={post.title} className="object-cover w-full h-full" />
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="font-bold text-gray-900 text-base line-clamp-2 hover:text-blue-600">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{post.excerpt}</p>
              <div className="pt-2">
                <Link href={`/blog/${post.slug}`} className="text-xs font-bold text-blue-600 hover:underline">Read Article &rarr;</Link>
              </div>
            </div>
          </article>
        ))}
        {posts.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No blogs available yet.
          </div>
        )}
      </div>
    </div>
  );
}
