'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getProducts, getAllOrders, resetProductRealSoldCount } from '@/lib/db';
import type { Product } from '@/types/product';
import type { Order } from '@/types/order';
import { formatPrice } from '@/lib/utils';
import { TrendingUp, ArrowUpDown, Loader2, PackageOpen, ChevronDown, ChevronUp, RefreshCw, Filter } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function ProductProfitsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortField, setSortField] = useState<'profit' | 'realSoldCount'>('profit');
  const [sortDesc, setSortDesc] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProducts(), getAllOrders()]).then(([prods, ords]) => {
      setProducts(prods);
      setOrders(ords);
      setLoading(false);
    });
  }, []);

  const productsWithCalculatedData = useMemo(() => {
    const now = new Date();
    
    // Filter orders based on time
    const filteredOrders = orders.filter(o => {
      if (o.orderStatus === 'cancelled' || o.orderStatus === 'failed') return false;
      if (timeFilter === 'all') return true;
      
      const orderDate = new Date(o.createdAt);
      if (timeFilter === 'today') {
        return orderDate.toDateString() === now.toDateString();
      } else if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      } else if (timeFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate >= monthAgo;
      }
      return true;
    });

    // Aggregate quantities from filtered orders
    const quantities: Record<string, number> = {};
    if (timeFilter !== 'all') {
      filteredOrders.forEach(o => {
        o.items.forEach(item => {
          quantities[item.productId] = (quantities[item.productId] || 0) + item.quantity;
        });
      });
    }

    return products.map(p => {
      const sold = timeFilter === 'all' ? (p.realSoldCount || 0) : (quantities[p.id] || 0);
      return { ...p, calculatedSold: sold };
    });
  }, [products, orders, timeFilter]);

  const sortedProducts = useMemo(() => {
    return [...productsWithCalculatedData].sort((a, b) => {
      const aSalePrice = a.discountPrice ?? a.price;
      const bSalePrice = b.discountPrice ?? b.price;
      const aProfitPerUnit = a.basePrice ? (aSalePrice - a.basePrice) : 0;
      const bProfitPerUnit = b.basePrice ? (bSalePrice - b.basePrice) : 0;
      const aTotalProfit = aProfitPerUnit * a.calculatedSold;
      const bTotalProfit = bProfitPerUnit * b.calculatedSold;
      
      let valA, valB;
      if (sortField === 'profit') {
        valA = aTotalProfit;
        valB = bTotalProfit;
      } else {
        valA = a.calculatedSold;
        valB = b.calculatedSold;
      }

      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [productsWithCalculatedData, sortField, sortDesc]);

  const toggleSort = (field: 'profit' | 'realSoldCount') => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  const totalGlobalProfit = sortedProducts.reduce((sum, p) => {
    const sale = p.discountPrice ?? p.price;
    const base = p.basePrice || 0;
    return sum + ((sale - base) * p.calculatedSold);
  }, 0);

  const handleReset = async (productId?: string) => {
    const confirmMsg = productId 
      ? 'Are you sure you want to reset the real sold count for this product? This will set it to 0.' 
      : 'Are you sure you want to reset the real sold count for ALL products? This action cannot be undone.';
      
    if (!window.confirm(confirmMsg)) return;

    setResettingId(productId || 'all');
    try {
      await resetProductRealSoldCount(productId);
      
      // Update local state to reflect change immediately
      setProducts(prev => prev.map(p => {
        if (!productId || p.id === productId) {
          return { ...p, realSoldCount: 0 };
        }
        return p;
      }));
      
      toast.success('Real sold count reset successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to reset.');
    }
    setResettingId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" /> Product Profits
          </h1>
          <p className="text-sm text-gray-500 mt-1">Detailed analysis of profit generated by each product based on real sales.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            <Filter className="w-4 h-4 text-gray-400 ml-2" />
            <select 
              value={timeFilter} 
              onChange={e => setTimeFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer outline-none pr-2"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5">Overall Profit</p>
            <p className="text-xl font-extrabold">{formatPrice(totalGlobalProfit)}</p>
          </div>

          <button 
            onClick={() => handleReset()}
            disabled={resettingId === 'all' || timeFilter !== 'all'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition text-sm ${
              timeFilter === 'all' 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50 border border-gray-200'
            }`}
            title={timeFilter !== 'all' ? "You can only reset all-time stats." : "Reset all product sold counts"}
          >
            {resettingId === 'all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Reset All
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 border-b border-gray-100 uppercase text-[10px] font-bold tracking-wider">
                <th className="p-4 rounded-tl-2xl">Product</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Sale Price</th>
                <th className="p-4 cursor-pointer hover:text-gray-900 transition" onClick={() => toggleSort('realSoldCount')}>
                  <div className="flex items-center gap-1">
                    Real Sold
                    {sortField === 'realSoldCount' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="p-4 cursor-pointer hover:text-gray-900 transition" onClick={() => toggleSort('profit')}>
                  <div className="flex items-center gap-1">
                    Total Profit
                    {sortField === 'profit' && <ArrowUpDown className="w-3 h-3" />}
                  </div>
                </th>
                <th className="p-4 text-right rounded-tr-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {sortedProducts.map(p => {
                const salePrice = p.discountPrice ?? p.price;
                const basePrice = p.basePrice || 0;
                const profitPerUnit = salePrice - basePrice;
                const realSold = p.calculatedSold;
                const totalProfit = profitPerUnit * realSold;
                const isExpanded = expandedId === p.id;

                return (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-gray-50/50 transition group cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : p.id)}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-gray-100 shrink-0">
                            {p.images?.[0] ? (
                              <Image src={p.images[0]} alt={p.name} fill sizes="40px" className="object-cover" />
                            ) : (
                              <PackageOpen className="w-5 h-5 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1 max-w-[200px]">{p.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-gray-600">{formatPrice(basePrice)}</td>
                      <td className="p-4 font-medium text-gray-900">{formatPrice(salePrice)}</td>
                      <td className="p-4 font-bold text-blue-600">{realSold}</td>
                      <td className="p-4 font-extrabold text-emerald-600">{formatPrice(totalProfit)}</td>
                      <td className="p-4 text-right">
                        <button className="text-gray-400 hover:text-gray-900 p-1 rounded transition">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50/30">
                        <td colSpan={6} className="p-0 border-t-0">
                          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm relative">
                            {timeFilter === 'all' && (
                              <button 
                                onClick={() => handleReset(p.id)}
                                disabled={resettingId === p.id}
                                className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition border border-red-100"
                              >
                                {resettingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                Reset Stats
                              </button>
                            )}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <p className="text-xs text-gray-500 font-bold uppercase mb-2">Price Breakdown</p>
                              <div className="flex justify-between py-1 border-b border-gray-50 text-gray-600"><span>Regular Price:</span> <span className="font-medium">{formatPrice(p.price)}</span></div>
                              <div className="flex justify-between py-1 border-b border-gray-50 text-gray-600"><span>Sale Price:</span> <span className="font-medium text-gray-900">{formatPrice(salePrice)}</span></div>
                              <div className="flex justify-between py-1 border-b border-gray-50 text-gray-600"><span>Base (Buying) Price:</span> <span className="font-medium text-gray-900">{formatPrice(basePrice)}</span></div>
                              <div className="flex justify-between py-1 text-emerald-600 mt-1"><span>Profit per unit:</span> <span className="font-bold">{formatPrice(profitPerUnit)}</span></div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <p className="text-xs text-gray-500 font-bold uppercase mb-2">Sales Metrics</p>
                              <div className="flex justify-between py-1 border-b border-gray-50 text-gray-600"><span>Actual Ordered (Real):</span> <span className="font-bold text-blue-600">{realSold}</span></div>
                              <div className="flex justify-between py-1 border-b border-gray-50 text-gray-600"><span>Marketing Sold Count:</span> <span className="font-medium">{p.soldCount}</span></div>
                              <div className="flex justify-between py-1 text-emerald-600 mt-1"><span>Total Accumulated Profit:</span> <span className="font-bold">{formatPrice(totalProfit)}</span></div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <p className="text-xs text-gray-500 font-bold uppercase mb-2">Inventory Info</p>
                              <div className="space-y-1">
                                {Object.entries(p.stock || {}).map(([size, qty]) => (
                                  <div key={size} className="flex justify-between text-xs">
                                    <span className="font-medium text-gray-600">{size}:</span>
                                    <span className={`font-bold ${qty > 0 ? 'text-gray-900' : 'text-red-500'}`}>{qty} left</span>
                                  </div>
                                ))}
                                {(!p.stock || Object.keys(p.stock).length === 0) && (
                                  <span className="text-gray-400 italic">No stock tracking data</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {sortedProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 text-sm">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
