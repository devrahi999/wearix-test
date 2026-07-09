'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingCart, Users, Package, ArrowRight, ExternalLink } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getAllOrders, getProducts } from '@/lib/db';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/types/order';
import type { Product } from '@/types/product';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllOrders(),
      getProducts(),
      getDocs(collection(db, 'users')),
    ]).then(([ordersData, productsData, usersSnap]) => {
      setOrders(ordersData);
      setProducts(productsData);
      setCustomerCount(usersSnap.size);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const recentOrders = orders.slice(0, 5);

  // Low stock: any size with stock <= 2
  const lowStockItems: { name: string; size: string; left: number }[] = [];
  for (const p of products) {
    for (const [size, qty] of Object.entries(p.stock)) {
      if (qty <= 2) {
        lowStockItems.push({ name: p.name, size, left: qty });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-xs text-gray-500 mt-0.5">Real-time statistics for Wearix.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: loading ? '...' : formatPrice(totalRevenue), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Total Orders', value: loading ? '...' : orders.length, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
          { label: 'Customers', value: loading ? '...' : customerCount, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Products', value: loading ? '...' : products.length, icon: Package, color: 'bg-orange-50 text-orange-600' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-semibold uppercase">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b pb-3 border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm">Recent Orders</h2>
            <Link href="/wxadmin/orders" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400 py-4 text-center">Loading...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 uppercase font-bold text-[10px]">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 font-bold text-gray-900">{order.id.slice(-8).toUpperCase()}</td>
                      <td className="py-3.5">{order.shippingAddress.fullName}</td>
                      <td className="py-3.5 uppercase">{order.paymentMethod}</td>
                      <td className="py-3.5 font-semibold text-blue-600">{formatPrice(order.total)}</td>
                      <td className="py-3.5">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700'
                          : order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link href={`/wxadmin/orders/${order.id}`} className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                          Details <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-sm border-b pb-3 border-gray-100">Low Stock Alerts</h2>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          ) : lowStockItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">All stock is healthy ✅</p>
          ) : (
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-2 bg-gray-50 rounded-xl px-3 border border-gray-100">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-gray-400 mt-0.5">Size: {item.size}</p>
                  </div>
                  <span className={`font-semibold shrink-0 px-2 py-0.5 rounded ${item.left === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {item.left === 0 ? 'Out' : `${item.left} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
