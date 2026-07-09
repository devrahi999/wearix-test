'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Heart, Search, Menu, X, ChevronDown, User, LogOut, Settings, Package
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { SITE_NAME } from '@/constants';
import { getCategories } from '@/lib/db';
import type { Category } from '@/types/product';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const pathname = usePathname();
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const [isMounted, setIsMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setIsMounted(true);
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setShopOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop', hasDropdown: true },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
    <header
      className={`sticky top-0 z-50 bg-white/90 backdrop-blur-md transition-all duration-200 ${
        scrolled ? 'shadow-md border-b border-gray-100' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 relative">
          
          {/* Left: Sidebar Menu Button */}
          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 -ml-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center group">
            <div className="relative w-36 h-12 md:w-48 md:h-16 transition-transform group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt={SITE_NAME}
                fill
                sizes="(max-width: 768px) 144px, 192px"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Right: Actions (Search, Wishlist) */}
          <div className="flex items-center gap-1 md:gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <Link
              href="/wishlist"
              className="relative p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 md:w-6 md:h-6" />
              {isMounted && wishlistCount > 0 && (
                <span className="absolute 0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-4 pt-1 animate-in fade-in slide-in-from-top-2">
            <form
              action="/search"
              className="relative max-w-2xl mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                }
              }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium collections..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
              />
            </form>
          </div>
        )}
      </div>
    </header>
    {/* Sidebar Mobile/Desktop Menu */}
    {mobileOpen && (
      <div className="fixed inset-0 z-[60] flex">
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div className="relative h-full w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Image src="/logo.png" alt={SITE_NAME} width={120} height={36} className="object-contain h-8 w-auto" />
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Menu</h3>
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">All Categories</h3>
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isActive = pathname === `/shop/${cat.slug}`;
                  return (
                    <Link
                      key={cat.id}
                      href={`/shop/${cat.slug}`}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'text-blue-600 bg-blue-50 shadow-sm'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border-2 ${
                        isActive ? 'border-blue-300' : 'border-gray-100 group-hover:border-blue-200'
                      }`}>
                        {cat.image && <Image src={cat.image} alt={cat.name} fill sizes="40px" className="object-cover" />}
                      </div>
                      <span className={isActive ? 'font-bold' : ''}>{cat.name}</span>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/categories"
                className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                View All Categories →
              </Link>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
