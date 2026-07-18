import { getProducts } from '@/lib/db';
import Link from 'next/link';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default async function SEODashboard() {
  const products = await getProducts();
  const seoHealth = products.map(p => {
    const issues = [];
    if (!p.description || p.description.length < 50) issues.push('Short description');
    if (!p.images || p.images.length === 0) issues.push('Missing images');
    if (!p.reviewCount || p.reviewCount < 1) issues.push('No reviews');
    return { ...p, issues };
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">SEO Health Dashboard</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Issues</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {seoHealth.map(p => (
              <tr key={p.id} className="border-b">
                <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4">
                  {p.issues.length === 0 ? (
                    <span className="flex items-center text-green-600 gap-1"><CheckCircle className="w-4 h-4"/> Good</span>
                  ) : (
                    <span className="flex items-center text-orange-500 gap-1"><AlertTriangle className="w-4 h-4"/> Needs Work</span>
                  )}
                </td>
                <td className="px-6 py-4">{p.issues.join(', ') || 'None'}</td>
                <td className="px-6 py-4">
                  <Link href={`/wxadmin/products/${p.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
