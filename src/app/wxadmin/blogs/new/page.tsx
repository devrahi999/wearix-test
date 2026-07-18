'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBlog } from '@/lib/db';

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', content: '', image: '', readTime: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createBlog({
      ...formData,
      createdAt: Date.now()
    });
    router.push('/wxadmin/blogs');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: data });
    const { url } = await res.json();
    if (url) setFormData({ ...formData, image: url });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">New Blog Post</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">Title</label>
          <input required type="text" className="w-full border rounded-lg p-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Slug</label>
          <input required type="text" className="w-full border rounded-lg p-2" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Excerpt</label>
          <textarea required className="w-full border rounded-lg p-2" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Content (Use # for headers/hashtags, newlines will be rendered)</label>
          <textarea required rows={10} className="w-full border rounded-lg p-2" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Image Upload</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2" />
          {formData.image && <img src={formData.image} alt="Preview" className="h-32 object-cover rounded" />}
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Read Time (e.g. 5 min read)</label>
          <input required type="text" className="w-full border rounded-lg p-2" value={formData.readTime} onChange={e => setFormData({...formData, readTime: e.target.value})} />
        </div>
        <button disabled={loading} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
          {loading ? 'Saving...' : 'Save Blog'}
        </button>
      </form>
    </div>
  );
}
