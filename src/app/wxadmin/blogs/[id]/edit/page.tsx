'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBlogs, updateBlog } from '@/lib/db';
import type { Blog } from '@/types/blog';

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', content: '', image: '', readTime: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const decodedId = decodeURIComponent(params.id);
        const blogs = await getBlogs();
        const blog = blogs.find(b => b.id === decodedId);
        if (blog) {
          setFormData({
            title: blog.title || '',
            slug: blog.slug || '',
            excerpt: blog.excerpt || '',
            content: blog.content || '',
            image: blog.image || '',
            readTime: blog.readTime || ''
          });
        }
      } catch (err) {
        console.error(err);
      }
      setFetching(false);
    }
    loadData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const decodedId = decodeURIComponent(params.id);
      await updateBlog(decodedId, formData);
      router.push('/wxadmin/blogs');
    } catch (err) {
      console.error(err);
      alert('Failed to save blog');
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingImage(true);
    try {
      const file = e.target.files[0];
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const { url } = await res.json();
      if (url) setFormData({ ...formData, image: url });
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  if (fetching) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Blog Post</h1>
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
          {uploadingImage && <p className="text-sm text-blue-600 mt-1">Uploading image, please wait...</p>}
          {formData.image && <img src={formData.image} alt="Preview" className="h-32 object-cover rounded mt-2" />}
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Read Time (e.g. 5 min read)</label>
          <input required type="text" className="w-full border rounded-lg p-2" value={formData.readTime} onChange={e => setFormData({...formData, readTime: e.target.value})} />
        </div>
        <button disabled={loading || uploadingImage} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold disabled:bg-gray-400">
          {loading ? 'Saving...' : uploadingImage ? 'Waiting for upload...' : 'Save Blog'}
        </button>
      </form>
    </div>
  );
}
