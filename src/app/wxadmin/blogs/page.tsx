'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getBlogs, deleteBlog } from '@/lib/db';
import type { Blog } from '@/types/blog';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    const data = await getBlogs();
    setBlogs(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      await deleteBlog(id);
      fetchBlogs();
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blogs</h1>
        <Link href="/wxadmin/blogs/new" className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold">
          <Plus className="w-4 h-4" /> Add Blog
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold text-gray-700">Title</th>
              <th className="p-4 font-bold text-gray-700">Slug</th>
              <th className="p-4 font-bold text-gray-700">Date</th>
              <th className="p-4 font-bold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((b) => (
              <tr key={b.id} className="border-b border-gray-50">
                <td className="p-4 font-medium">{b.title}</td>
                <td className="p-4 text-gray-500">{b.slug}</td>
                <td className="p-4 text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <Link href={`/wxadmin/blogs/${b.id}/edit`} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button onClick={() => b.id && handleDelete(b.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {blogs.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No blogs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
