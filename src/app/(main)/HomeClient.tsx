'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryShortcuts from '@/components/home/CategoryShortcuts';

import ProductGrid from '@/components/product/ProductGrid';
import { ArrowRight, TrendingUp, Zap, Star } from 'lucide-react';
import { 
  listenToProducts, listenToHeroBanners, listenToPromoBanners, listenToFlashSaleConfig, 
  type HeroBanner, type PromoBanner, type FlashSaleConfig 
} from '@/lib/db';
import type { Product } from '@/types/product';
import PopupBanner from '@/components/layout/PopupBanner';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export default function HomeClient() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>([]);
  const [flashSale, setFlashSale] = useState<FlashSaleConfig | null>(null);

  useEffect(() => {
    const unsubProducts = listenToProducts(data => {
      const active = data.filter(p => p.isActive);
      setFeaturedProducts(active.filter(p => p.isFeatured).slice(0, 8));
      setNewArrivals(active.slice(0, 4));
      
      // Random 8 products
      const shuffled = [...active].sort(() => 0.5 - Math.random());
      setRandomProducts(shuffled.slice(0, 8));
    });
    
    const unsubHero = listenToHeroBanners(setHeroBanners);
    const unsubPromo = listenToPromoBanners(setPromoBanners);
    const unsubFlash = listenToFlashSaleConfig(setFlashSale);

    return () => {
      unsubProducts();
      unsubHero();
      unsubPromo();
      unsubFlash();
    };
  }, []);

  return (
    <div className="pb-8 overflow-x-hidden">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-0 md:px-6 pt-0 md:pt-4"
      >
        <HeroSlider banners={heroBanners} />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 mt-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
          <CategoryShortcuts />
        </motion.div>

        {/* Featured Products */}
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">Handpicked</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Collections</h2>
              <p className="text-gray-500 text-sm mt-1">Style choices curated for you</p>
            </div>
            <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={featuredProducts} />
          <div className="mt-4 sm:hidden text-center">
            <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.section>

        {/* Dynamic Promo Banners (Split Layout) */}
        {promoBanners.length > 0 && (
          <motion.section 
            variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            className={`grid gap-4 ${promoBanners.length === 1 ? 'grid-cols-1' : 'md:grid-cols-2'}`}
          >
            {promoBanners.slice(0, 2).map((promo, idx) => (
              <Link key={promo.id} href={promo.link} className="group relative overflow-hidden rounded-3xl aspect-[4/3] bg-gray-900">
                <Image
                  src={promo.imageUrl}
                  alt={promo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${idx === 0 ? 'text-blue-300' : 'text-pink-300'}`}>
                    New
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">{promo.title}</h3>
                  <p className="text-gray-300 text-sm mt-1 mb-4">{promo.subtitle}</p>
                  <span className={`inline-flex items-center gap-2 bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${idx === 0 ? 'group-hover:bg-blue-50' : 'group-hover:bg-pink-50'}`}>
                    {promo.buttonText || 'Shop Now'} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </motion.section>
        )}

        {/* Dynamic Flash Sale Banner */}
        {flashSale && flashSale.isActive && (
          <motion.section 
            variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white p-8 md:p-12"
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 60%), radial-gradient(circle at 80% 50%, #8b5cf6 0%, transparent 60%)' }}
            />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-bold text-sm uppercase tracking-wider">{flashSale.label}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold leading-tight">
                  Limited Time<br />
                  <span className="text-blue-400">Special Offer</span>
                </h3>
                {flashSale.endsAt && (
                  <p className="text-gray-300 text-sm max-w-sm">
                    Ends on: <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg">{new Date(flashSale.endsAt).toLocaleString()}</span>
                  </p>
                )}
              </div>
              <div className="shrink-0">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 text-sm md:text-base"
                >
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.section>
        )}

        {/* New Arrivals */}
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Just Dropped</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-500 text-sm mt-1">Be the first to wear the freshest drops</p>
            </div>
            <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </motion.section>

        {/* Other Collections (Random Products) */}
        {randomProducts.length > 0 && (
          <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Other Collections</h2>
                <p className="text-gray-500 text-sm mt-1">Discover more items you might like</p>
              </div>
              <Link href="/shop" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                Explore Shop <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <ProductGrid products={randomProducts} />
          </motion.section>
        )}
      </div>
      
      <PopupBanner />
    </div>
  );
}
