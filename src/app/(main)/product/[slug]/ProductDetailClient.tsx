'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, ShieldCheck, Truck, RefreshCw, AlertCircle, Check, Loader2 } from 'lucide-react';
import { getProductBySlug, getProducts, getReviewsByProduct, submitReview, type ProductReview } from '@/lib/db';
import type { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice, discountPercent } from '@/lib/utils';
import ProductGrid from '@/components/product/ProductGrid';
import SizeSelector from '@/components/product/SizeSelector';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetailClient({ initialSlug }: { initialSlug: string }) {
  const router = useRouter();
  const slug = initialSlug;

  const { addItem } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'size-chart' | 'reviews'>('details');
  const [activeImage, setActiveImage] = useState<string>('');
  const [addedNotify, setAddedNotify] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });

  useEffect(() => {
    setPageLoading(true);
    getProductBySlug(slug).then(p => {
      if (p) {
        setProduct(p);
        setSelectedSize(p.sizes[0] || null);
        setSelectedColor(p.colors[0] || null);
        setActiveImage(p.images[0] || '');
        // related products
        getProducts({ category: p.category }).then(all => {
          const related = all.filter(r => r.id !== p.id).slice(0, 4);
          setRelatedProducts(related);
        });
        // reviews
        getReviewsByProduct(p.id).then(r => setReviews(r));
      }
      setPageLoading(false);
    });
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmittingReview(true);
    try {
      const newReview = await submitReview({
        productId: product.id,
        userId: user?.uid || 'guest',
        userName: user?.displayName || 'Anonymous User',
        userEmail: user?.email || 'guest@example.com',
        rating: reviewForm.rating,
        reviewText: reviewForm.text,
      });
      setReviews([newReview, ...reviews]);
      setReviewForm({ rating: 5, text: '' });
      toast.success('Successfully submitted your review');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (pageLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="text-5xl">⚠️</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Product Not Found</h1>
        <p className="text-gray-500 mt-2">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const inStock = !product.isOutOfStock;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor || undefined,
      price: product.price,
      discountPrice: product.discountPrice,
      quantity,
      slug: product.slug,
    });
    setAddedNotify(true);
    setTimeout(() => setAddedNotify(false), 3000);
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push('/login?redirect=/checkout?buyNow=true');
      return;
    }
    if (!selectedSize) return;
    useCartStore.getState().setBuyNowItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor || undefined,
      price: product.price,
      discountPrice: product.discountPrice,
      quantity,
      slug: product.slug,
    });
    router.push('/checkout?buyNow=true');
  };

  // related products already fetched in useEffect

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-400 mb-6 flex gap-2">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-blue-600">Shop</Link>
        <span>/</span>
        <Link href={`/shop/${product.category}`} className="hover:text-blue-600 capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main product view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm mb-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div 
            className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 border border-gray-100 [-webkit-touch-callout:none] select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            {activeImage && (
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-contain pointer-events-none select-none"
                draggable={false}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            {product.discountPrice && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                -{discountPercent(product.price, product.discountPrice)}% OFF
              </span>
            )}
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-blue-600 scale-95 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <Image 
                    src={img} 
                    alt="" 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                    className="object-contain pointer-events-none select-none" 
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details info */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">
                {product.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2.5 leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-current' : ''
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
              {product.soldCount > 0 && (
                <span className="text-sm font-medium text-gray-500 ml-2 pl-2 border-l border-gray-200">
                  {product.soldCount} Sold
                </span>
              )}
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 py-2 border-y border-gray-100">
              <span className="text-3xl font-extrabold text-blue-600">
                {formatPrice(product.discountPrice ?? product.price)}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    Save {formatPrice(product.price - product.discountPrice)}
                  </span>
                </>
              )}
            </div>

            {/* Colors Chips */}
            {product.colors.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700">Select Color</span>
                <div className="flex gap-2 mt-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        selectedColor === color
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector component */}
            {product.sizes.length > 0 && (
              <SizeSelector
                sizes={product.sizes}
                stock={{}} // Stock removed
                selected={selectedSize}
                onSelect={setSelectedSize}
              />
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            {/* Quantity Selector and Add buttons */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 h-12 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" /> {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
              >
                Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                aria-label="Wishlist"
                className={`w-12 h-12 border rounded-xl flex items-center justify-center transition-colors ${
                  wishlisted
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {addedNotify && (
              <div className="bg-green-50 text-green-700 text-xs px-3 py-2 rounded-xl border border-green-150 flex items-center gap-2 font-medium">
                <Check className="w-4 h-4" /> Added to cart successfully!
              </div>
            )}

            {/* Delivery/Warranty info badges */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500 py-2">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Fast Home Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-green-500 shrink-0" />
                <span>7-Day Return Policy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Genuine Cotton</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-12">
        <div className="flex border-b border-gray-100 mb-6">
          {[
            { id: 'details', label: 'Product Specifications' },
            { id: 'reviews', label: 'Customer Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-bold border-b-2 px-4 transition-all -mb-px ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p className="whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Summary */}
              <div className="flex items-center gap-4 shrink-0 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="text-center bg-white px-5 py-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-3xl font-extrabold text-blue-600">{product.rating.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 font-semibold mt-1">out of 5</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Review Summary</p>
                  <p className="text-xs text-gray-400 mt-1">{product.reviewCount} total reviews</p>
                </div>
              </div>

              {/* Add Review Form */}
              {user && reviews.some(r => r.userId === user.uid) ? (
                <div className="flex-1 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 w-full flex items-center justify-center text-center">
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" /> You submitted your review already
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="flex-1 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 w-full">
                <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          type="button" 
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          className="focus:outline-none"
                        >
                          <Star className={`w-6 h-6 ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors disabled:bg-blue-300"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
                </form>
              )}
            </div>

            {/* Review List */}
            <div className="divide-y divide-gray-100">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">No reviews yet. Be the first to review this product!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="py-5 first:pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{rev.userName}</p>
                        <div className="flex text-yellow-400 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current text-yellow-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related Products strip */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
