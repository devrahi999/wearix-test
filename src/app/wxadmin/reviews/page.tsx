'use client';

import { useState, useEffect } from 'react';
import { Loader2, Trash2, Star, MessageSquare } from 'lucide-react';
import { getAllReviews, deleteReview, type ProductReview } from '@/lib/db';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    await deleteReview(id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  // Group reviews by product
  const groupedReviews = reviews.reduce((acc, review) => {
    if (!acc[review.productId]) {
      acc[review.productId] = [];
    }
    acc[review.productId].push(review);
    return acc;
  }, {} as Record<string, ProductReview[]>);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" /> Product Reviews
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage all customer reviews grouped by product.</p>
        </div>
        <div className="text-sm font-semibold text-gray-600">
          Total Reviews: {reviews.length}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Star className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedReviews).map(([productId, productReviews]) => {
            const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
            
            return (
              <div key={productId} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Product ID: {productId}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{productReviews.length} reviews | Avg: {avgRating.toFixed(1)}/5</p>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {productReviews.map(review => (
                    <div key={review.id} className="p-4 bg-white flex justify-between gap-4 hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900 text-sm">{review.userName}</p>
                          <span className="text-[10px] text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex text-yellow-400 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{review.reviewText}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="p-2 h-fit text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
