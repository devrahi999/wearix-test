'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, registerWithEmail, forgotPassword } from '@/lib/authHelpers';

type Mode = 'login' | 'register' | 'forgot';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        router.push(redirectTo);
      } else if (mode === 'register') {
        if (!name.trim()) { setError('Please enter your full name.'); setLoading(false); return; }
        await registerWithEmail(name.trim(), email, password);
        router.push(redirectTo);
      } else if (mode === 'forgot') {
        await forgotPassword(email);
        setSuccess('Password reset email sent! Check your inbox.');
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError((err as Error).message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    clearMessages();
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="relative w-10 h-10">
              <Image src="/logo.png" alt="Wearix" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">Wearix</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-gray-100 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login' && 'Sign in to your Wearix account'}
              {mode === 'register' && 'Join Wearix and start shopping'}
              {mode === 'forgot' && "We'll send you a reset link"}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl p-3 mb-4">
              ✅ {success}
            </div>
          )}

          {mode !== 'forgot' && (
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl py-3 text-sm font-semibold text-gray-700 transition-all mb-4 disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          )}

          {mode !== 'forgot' && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); clearMessages(); }}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' && (loading ? 'Signing in...' : 'Sign In')}
              {mode === 'register' && (loading ? 'Creating account...' : 'Create Account')}
              {mode === 'forgot' && (loading ? 'Sending...' : 'Send Reset Link')}
            </button>
          </form>

          <div className="text-center mt-5 text-sm text-gray-500">
            {mode === 'login' && (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => { setMode('register'); clearMessages(); }} className="text-blue-600 font-semibold hover:underline">
                  Sign Up
                </button>
              </>
            )}
            {mode === 'register' && (
              <>
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); clearMessages(); }} className="text-blue-600 font-semibold hover:underline">
                  Sign In
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <button onClick={() => { setMode('login'); clearMessages(); }} className="text-blue-600 font-semibold hover:underline">
                ← Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
