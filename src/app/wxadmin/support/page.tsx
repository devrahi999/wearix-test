'use client';

import { useState, useEffect } from 'react';
import { Loader2, Trash2, Mail, CheckCircle, X, Eye } from 'lucide-react';
import { getSupportMessages, markSupportMessageRead, deleteSupportMessage, type SupportMessage } from '@/lib/db';
import { useConfirm } from '@/components/ui/ConfirmDialog';

export default function AdminSupportPage() {
  const { confirm } = useConfirm();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getSupportMessages();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch support messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await markSupportMessageRead(id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
    if (selectedMessage?.id === id) {
      setSelectedMessage(prev => prev ? { ...prev, isRead: true } : null);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const ok = await confirm({ message: 'Are you sure you want to delete this message?' });
    if (!ok) return;
    await deleteSupportMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Support Messages</h1>
          <p className="text-xs text-gray-500 mt-1">View messages sent from the Contact Us page.</p>
        </div>
        <div className="text-sm font-semibold text-gray-600">
          Total: {messages.length} | Unread: {messages.filter(m => !m.isRead).length}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-10">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">No support messages yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 text-xs uppercase font-bold">
                <th className="pb-3">Sender</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {messages.map(msg => (
                <tr 
                  key={msg.id} 
                  onClick={() => setSelectedMessage(msg)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${!msg.isRead ? 'bg-blue-50/20 font-medium text-gray-900' : ''}`}
                >
                  <td className="py-3.5 font-bold text-gray-900">{msg.name}</td>
                  <td className="py-3.5 text-blue-600">{msg.email}</td>
                  <td className="py-3.5">{new Date(msg.createdAt).toLocaleDateString()}</td>
                  <td className="py-3.5">
                    {!msg.isRead ? (
                      <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Read</span>
                    )}
                  </td>
                  <td className="py-3.5 flex items-center justify-end gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedMessage(msg); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    {!msg.isRead && (
                      <button onClick={(e) => handleMarkRead(msg.id, e)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Mark as Read">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={(e) => handleDelete(msg.id, e)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Message Details
              </h2>
              <button onClick={() => setSelectedMessage(null)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">From</p>
                <p className="font-bold text-gray-900 text-lg">{selectedMessage.name}</p>
                <a href={`mailto:${selectedMessage.email}`} className="text-sm font-semibold text-blue-600 hover:underline">{selectedMessage.email}</a>
              </div>
              
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                <p className="text-sm text-gray-700 font-medium">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Message</p>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              {!selectedMessage.isRead && (
                <button onClick={() => handleMarkRead(selectedMessage.id)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors">
                  Mark as Read
                </button>
              )}
              <button onClick={() => handleDelete(selectedMessage.id)} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-bold rounded-xl transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
