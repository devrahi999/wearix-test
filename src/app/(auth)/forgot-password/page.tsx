'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-150 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Back Link */}
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>

        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Check Your Inbox</h1>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                We have emailed a password reset link to <span className="font-semibold text-gray-700">{email}</span>. Click on the link to verify.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block mt-4 text-sm font-semibold text-blue-600 hover:underline"
            >
              Return to login page
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                <span className="text-white font-black text-xl">W</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-3">Reset Password</h1>
              <p className="text-sm text-gray-500">
                Enter your email address and we will send you a password reset link.
              </p>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center transition-colors text-sm shadow-sm"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
