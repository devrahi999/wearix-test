'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, Settings, LogOut, User as UserIcon, ChevronRight, Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders } from '@/lib/db';
import type { Order } from '@/types/order';
import { useConfirm } from '@/components/ui/ConfirmDialog';

export default function AccountDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { confirm } = useConfirm();

  const [orders, setOrders] = useState<Order[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getUserOrders(user.uid).then(res => {
        setOrders(res);
        setStatsLoading(false);
      });
    }
  }, [user]);

  if (loading || !user) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading profile...</div>;
  }
  const menuItems = [
    { label: 'My Orders', href: '/account/orders', icon: ShoppingBag, desc: 'Check your order status' },
    { label: 'Saved Wishlist', href: '/wishlist', icon: Heart, desc: 'Items you loved' },
    { label: 'Referrals & Rewards', href: '/account/referrals', icon: Gift, desc: 'Earn points & coupons' },
    { label: 'Account Settings', href: '/account/settings', icon: Settings, desc: 'Profile and security' },
  ];

  return (
    <div className="max-w-md mx-auto space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 pt-4">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/30 border-4 border-white overflow-hidden relative">
          <UserIcon className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.displayName || 'WearixBD User'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-4 shadow-lg shadow-gray-200/40 text-center flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
          <p className="text-2xl font-black text-gray-900">{statsLoading ? '-' : orders.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-4 shadow-lg shadow-gray-200/40 text-center flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Completed</p>
          <p className="text-2xl font-black text-green-600">{statsLoading ? '-' : orders.filter(o => o.orderStatus === 'delivered').length}</p>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-3 shadow-xl shadow-gray-200/50 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{item.label}</h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
            </Link>
          );
        })}
      </div>

      {/* Sign Out Button */}
      <button
        onClick={async () => {
          const ok = await confirm({
            title: 'Sign Out',
            message: 'Are you sure you want to sign out of your account?',
            confirmText: 'Sign Out',
            cancelText: 'Cancel'
          });
          if (ok) {
            await logout();
            router.push('/login');
          }
        }}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-red-600 font-bold bg-white/80 backdrop-blur-xl border border-red-100 shadow-sm hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
}
