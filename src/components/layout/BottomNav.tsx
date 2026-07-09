'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, User, LogIn } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/shop', icon: ShoppingBag },
    { label: 'Cart', href: '/cart', icon: ShoppingCart, badge: totalItems },
    user 
      ? { label: 'Profile', href: '/account', icon: User }
      : { label: 'Login', href: '/login', icon: LogIn },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isMounted && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
