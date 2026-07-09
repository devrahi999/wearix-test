'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { HeroBanner } from '@/lib/db';
import { Loader2 } from 'lucide-react';

export default function HeroSlider({ banners }: { banners: HeroBanner[] }) {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-none md:rounded-3xl aspect-[16/8] md:aspect-[16/6] bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrent((c) => (c + 1) % banners.length);
      else setCurrent((c) => (c - 1 + banners.length) % banners.length);
    }
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrent((c) => (c + 1) % banners.length);
      else setCurrent((c) => (c - 1 + banners.length) % banners.length);
    }
    setIsDragging(false);
  };

  return (
    <div
      className="relative overflow-hidden rounded-none md:rounded-3xl aspect-[16/8] md:aspect-[16/6] bg-gray-900 select-none cursor-grab active:cursor-grabbing touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {banners.map((slide, i) => (
        <Link
          key={slide.id}
          href={slide.link}
          className={`absolute inset-0 transition-opacity duration-700 block ${
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.title || `Hero Banner ${i + 1}`}
            fill
            priority={i === 0}
            className={`object-cover object-center transition-transform duration-[8000ms] ${i === current ? 'scale-100' : 'scale-105'}`}
            sizes="(max-width: 768px) 100vw, 100vw"
          />
        </Link>
      ))}

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
