import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { getBlogBySlug } from '@/lib/db';
import { SITE_NAME } from '@/constants';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogBySlug(params.slug);
  if (!post) return { title: 'Not Found' };
  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogBySlug(params.slug);
  if (!post) notFound();

  const contentLines = post.content.split('\n').filter(Boolean);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Blog List
      </Link>
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-snug">{post.title}</h1>
        <div className="flex items-center justify-between border-y py-3 border-gray-100 text-xs text-gray-400 font-semibold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(post.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
          </div>
        </div>
      </div>
      <div className="relative aspect-[16/9] bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
        <img src={post.image} alt={post.title} className="object-cover w-full h-full" />
      </div>
      <div className="text-sm text-gray-600 leading-relaxed text-justify space-y-4 pt-4">
        {contentLines.map((line, i) => {
          if (line.startsWith('#')) return <h3 key={i} className="font-bold text-gray-900 text-lg mt-6">{line.replace(/^#+\s*/, '')}</h3>;
          return (
            <p key={i}>
              {line.split(/(#\w+)/g).map((word, j) => 
                word.startsWith('#') ? <span key={j} className="text-blue-600 font-medium">{word}</span> : word
              )}
            </p>
          );
        })}
      </div>
    </article>
  );
}
