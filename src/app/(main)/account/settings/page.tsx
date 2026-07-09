'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile, changePassword } from '@/lib/authHelpers';
import { Loader2, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/account/settings');
    }
    if (user) {
      setDisplayName(user.displayName || '');
      setPhone(user.phone || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, loading, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await updateUserProfile(user.uid, { displayName, phone, photoURL });
      await refreshUser();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg({ type: '', text: '' });
    try {
      await changePassword(currentPassword, newPassword);
      setPassMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.message || 'Failed to change password. Ensure current password is correct.' });
    } finally {
      setPassLoading(false);
    }
  };

  if (loading || !user) return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/account" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
      </div>

      {/* Edit Profile */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
        
        {profileMsg.text && (
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm ${profileMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
            {profileMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={profileLoading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl flex items-center justify-center transition-colors text-sm"
          >
            {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Change Password</h2>
        
        {passMsg.text && (
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm ${passMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
            {passMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
            {passMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={passLoading}
            className="w-full h-11 border-2 border-gray-900 hover:bg-gray-900 text-gray-900 hover:text-white disabled:opacity-50 font-bold rounded-xl flex items-center justify-center transition-colors text-sm"
          >
            {passLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
