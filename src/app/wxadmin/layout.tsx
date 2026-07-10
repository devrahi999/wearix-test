'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, FolderTree, ClipboardList, Users, Ticket,
  Settings, LogOut, ChevronRight, Image as ImageIcon, Zap, Loader2, ShieldAlert, Menu, X, MessageSquare, Star
} from 'lucide-react';
import { SITE_NAME } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { ConfirmProvider } from '@/components/ui/ConfirmDialog';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=' + pathname);
    }
  }, [user, loading, router, pathname]);

  const menuItems = [
    { label: 'Overview', href: '/wxadmin', icon: LayoutDashboard },
    { label: 'Products', href: '/wxadmin/products', icon: ShoppingBag },
    { label: 'Categories', href: '/wxadmin/categories', icon: FolderTree },
    { label: 'Orders', href: '/wxadmin/orders', icon: ClipboardList },
    { label: 'Users', href: '/wxadmin/customers', icon: Users },
    { label: 'Support Messages', href: '/wxadmin/support', icon: MessageSquare },
    { label: 'Product Reviews', href: '/wxadmin/reviews', icon: Star },
    { label: 'Hero Banners', href: '/wxadmin/banners', icon: ImageIcon },
    { label: 'Promo Boxes', href: '/wxadmin/promo', icon: Zap },
    { label: 'Marketing', href: '/wxadmin/marketing', icon: Ticket },
    { label: 'Coupons', href: '/wxadmin/coupons', icon: Ticket },
    { label: 'Store Settings', href: '/wxadmin/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  // isAdmin check — block non-admins
  if (user.isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <ShieldAlert className="w-16 h-16 text-red-400" />
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-500 text-sm">You don&apos;t have admin privileges.</p>
        <Link href="/" className="text-blue-600 font-bold text-sm hover:underline">← Back to site</Link>
      </div>
    );
  }

  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-[#f8f9fc] flex relative">
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed md:sticky top-0 h-screen w-60 bg-gray-900 text-gray-300 flex flex-col justify-between shrink-0 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="space-y-5 pt-5">
            <div className="flex items-center justify-between px-5">
              <Link href="/wxadmin" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="text-white font-bold text-base">{SITE_NAME} Admin</span>
              </Link>
              <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="px-3 space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/wxadmin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-800 space-y-1">
            <p className="text-[10px] text-gray-500 px-3 truncate">{user.email}</p>
            <button
              onClick={async () => { await logout(); router.push('/login'); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-grow flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-14 bg-white border-b border-gray-100 px-4 md:px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 -ml-1.5 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="font-bold text-gray-800 text-sm hidden sm:block">Welcome, {user.displayName || 'Admin'} 👋</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/" className="text-blue-600 font-bold hover:underline">Live Site →</Link>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {(user.displayName || user.email || 'A')[0].toUpperCase()}
              </div>
            </div>
          </header>
          <main className="p-4 sm:p-6 flex-grow">{children}</main>
        </div>
      </div>
    </ConfirmProvider>
  );
}
