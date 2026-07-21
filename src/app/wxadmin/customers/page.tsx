'use client';

import { useState, useEffect } from 'react';
import { Loader2, Search, User as UserIcon, ShieldCheck } from 'lucide-react';
import { getAllUsers, updateUser, getUserOrders } from '@/lib/db';
import type { Order } from '@/types/order';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const router = useRouter();
  const { confirm } = useConfirm();
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
                    onClick={() => router.push(`/wxadmin/customers/${user.id}`)}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 sm:px-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0 border border-blue-100">
                          <UserIcon className="w-4 h-4 text-blue-600" />
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
                      <Link href={`/wxadmin/customers/${user.id}`} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold text-[10px]">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
