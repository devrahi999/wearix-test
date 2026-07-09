'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, User as UserIcon, ShieldCheck, X, Package, CheckCircle, ExternalLink } from 'lucide-react';
import { getAllUsers, updateUser, getUserOrders } from '@/lib/db';
import type { Order } from '@/types/order';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    getAllUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const handleOpenUserModal = async (user: any) => {
    setSelectedUser(user);
    setLoadingOrders(true);
    try {
      const orders = await getUserOrders(user.id);
      setUserOrders(orders);
    } catch (e) {
      console.error(e);
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin privileges?`)) return;
    
    await updateUser(userId, { isAdmin: !currentStatus });
    
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: !currentStatus } : u));
    
    if (selectedUser?.id === userId) {
      setSelectedUser((prev: any) => ({ ...prev, isAdmin: !currentStatus }));
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">Manage Users ({users.length})</h1>
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-0 sm:p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No users found matching your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 uppercase font-bold text-[10px]">
                  <th className="px-4 py-3 sm:px-0">User</th>
                  <th className="px-4 py-3 sm:px-0">Role</th>
                  <th className="px-4 py-3 sm:px-0">Joined</th>
                  <th className="px-4 py-3 sm:px-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {filteredUsers.map(user => (
                  <tr 
                    key={user.id} 
                    onClick={() => handleOpenUserModal(user)}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 sm:px-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.displayName || 'Unknown User'}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 sm:px-0">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-600 text-[10px] font-bold">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 sm:px-0 text-xs text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 sm:px-0 text-right">
                      <button 
                        onClick={(e) => handleToggleAdmin(user.id, !!user.isAdmin, e)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                          user.isAdmin 
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-600" />
                User Details
              </h2>
              <button onClick={() => setSelectedUser(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Profile Card */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm overflow-hidden">
                  {selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.displayName || 'Unknown User'}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-2">{selectedUser.email}</p>
                  
                  <div className="flex gap-2">
                    {selectedUser.isAdmin && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                        <ShieldCheck className="w-3.5 h-3.5" /> Admin Account
                      </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                      Joined: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleToggleAdmin(selectedUser.id, !!selectedUser.isAdmin)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
                    selectedUser.isAdmin 
                      ? 'bg-red-50 hover:bg-red-100 text-red-600'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                  }`}
                >
                  {selectedUser.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{loadingOrders ? '...' : userOrders.length}</p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">
                    {loadingOrders ? '...' : userOrders.filter(o => o.orderStatus === 'delivered').length}
                  </p>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Order History</h4>
                
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm font-medium text-gray-500">User has not placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                    {userOrders.map(order => (
                      <div key={order.id} className="p-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600 text-sm">{formatPrice(order.total)}</p>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full capitalize ${
                            order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700'
                            : order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700'
                            : 'bg-blue-50 text-blue-700'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
