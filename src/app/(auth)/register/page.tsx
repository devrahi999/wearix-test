'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/account';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="relative w-32 h-12 mx-auto">
            <Image src="/logo.png" alt="Wearix" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Create Account</h1>
          <p className="text-sm text-gray-500">Create a Wearix account to track your orders in real-time.</p>
        </div>

        {/* Google OAuth Register */}
        <button
          onClick={() => {
            window.location.href = '/account';
          }}
          className="w-full h-11 border border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.97 1 12 1 7.21 1 3.15 3.73 1.22 7.74l3.86 3C6.01 7.54 8.78 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.74-2.38 3.58l3.69 2.87c2.16-2 3.74-4.94 3.74-8.55z"
            />
            <path
              fill="#FBBC05"
              d="M5.08 10.74c-.25-.74-.39-1.53-.39-2.35s.14-1.61.39-2.35l-3.86-3C.44 4.54 0 6.32 0 8.39s.44 3.85 1.22 5.35l3.86-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.69-2.87c-1.11.75-2.52 1.19-4.27 1.19-3.22 0-5.99-2.5-6.97-5.71l-3.86 3C3.15 19.85 7.21 23 12 23z"
            />
          </svg>
          Sign Up with Google
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-150"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Or Email
          </span>
          <div className="flex-grow border-t border-gray-150"></div>
        </div>

        {/* Register Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 01712345678"
                className="w-full border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center transition-colors text-sm shadow-sm"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:underline">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
}
