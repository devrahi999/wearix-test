'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingCart, Users, Package, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getAllOrders, getProducts } from '@/lib/db';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order } from '@/types/order';
import type { Product } from '@/types/product';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'all'>('all');

  useEffect(() => {
    Promise.all([
      getAllOrders(),
      getProducts(),
      getDocs(collection(db, 'users')),
    ]).then(([ordersData, productsData, usersSnap]) => {
      // Sort orders by date descending
      const sortedOrders = ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sortedOrders);
      setProducts(productsData);
      setCustomerCount(usersSnap.size);
      setLoading(false);
    });
  }, []);

  const productBasePrices = useMemo(() => {
    return Object.fromEntries(products.map(p => [p.id, p.basePrice || 0]));
  }, [products]);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      const date = new Date(o.createdAt);
      if (timeFilter === 'day') return now.getTime() - date.getTime() <= 24 * 60 * 60 * 1000;
      if (timeFilter === 'week') return now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000;
      if (timeFilter === 'month') return now.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000;
      return true;
    });
  }, [orders, timeFilter]);

  const calculateProfit = (order: Order) => {
    const itemsProfit = order.items.reduce((sum, item) => {
      const baseP = productBasePrices[item.productId] || 0;
      const saleP = item.discountPrice ?? item.price;
      return sum + ((saleP - baseP) * item.quantity);
    }, 0);
    return itemsProfit - (order.discount || 0);
  };

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalProfit = filteredOrders.reduce((sum, o) => sum + calculateProfit(o), 0);
  const recentOrders = filteredOrders.slice(0, 5);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    if (orders.length === 0) return [];
    
    // Group by date string (e.g. "MMM DD")
    const map = new Map<string, { date: string; revenue: number; profit: number }>();
    
    // To keep it simple, we group by date.
    // We reverse filteredOrders to have chronological order for chart.
    const chronological = [...filteredOrders].reverse();
    
    chronological.forEach(o => {
      const d = new Date(o.createdAt);
      let key = '';
      if (timeFilter === 'day') {
        key = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      const profit = calculateProfit(o);
      
      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.revenue += o.total;
        existing.profit += profit;
      } else {
        map.set(key, { date: key, revenue: o.total, profit });
      }
    });

    return Array.from(map.values());
  }, [filteredOrders, timeFilter, productBasePrices]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">Comprehensive overview of Wearix performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          {[
            { id: 'day', label: '24h' },
            { id: 'week', label: '7d' },
            { id: 'month', label: '30d' },
            { id: 'all', label: 'All Time' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeFilter === f.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Revenue</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{loading ? '...' : formatPrice(totalRevenue)}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Net Profit</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{loading ? '...' : formatPrice(totalProfit)}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Orders</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-purple-50 text-purple-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{loading ? '...' : filteredOrders.length}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Customers</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-orange-50 text-orange-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{loading ? '...' : customerCount}</p>
        </div>
      </div>

      {/* Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Revenue & Profit Overview</h2>
              <p className="text-xs text-gray-500 mt-1">Comparing total sales with net profit.</p>
            </div>
          </div>
          <div className="flex-1 w-full h-[300px] min-h-[300px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Loading chart...</div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No data available for this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `৳${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any, name: any) => [`৳${value}`, name]}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b pb-4 mb-4 border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm">Recent Orders</h2>
            <Link href="/wxadmin/orders" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <p className="text-xs text-gray-400 py-4 text-center">Loading...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <span className="font-bold text-sm">{o.customerInfo.firstName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{o.customerInfo.firstName} {o.customerInfo.lastName}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">#{o.id.slice(0,6).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600">{formatPrice(o.total)}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-wide mt-1 px-1.5 py-0.5 rounded ${
                        o.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                        o.orderStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
                        o.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {o.orderStatus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
