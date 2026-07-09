'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Check, Loader2, MessageCircle } from 'lucide-react';
import { getStoreSettings, submitSupportMessage, type StoreSettings } from '@/lib/db';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    getStoreSettings().then(setSettings);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await submitSupportMessage({
      name: form.name,
      email: form.email,
      message: form.message
    });
    setLoading(false);
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center space-y-2 border-b border-gray-100 pb-6 mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Contact Us</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          We would love to hear from you. Get in touch with our customer success team.
        </p>
      </div>

      {settings && settings.whatsapp && (
        <div className="mb-8 flex justify-center">
          <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" 
             className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-sm shadow-green-500/20">
            <MessageCircle className="w-5 h-5" /> Chat with us on WhatsApp
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Info detail block */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="font-bold text-gray-900 text-lg border-b pb-3 border-gray-100">
              Get in Touch
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Phone Hotline</p>
                  <a href={`tel:${settings?.phone || '+8801700000000'}`} className="hover:text-blue-600 transition-colors">
                    {settings?.phone || '+880 1700-000000'}
                  </a>
                  <p className="text-xs text-gray-400 mt-0.5">Sat - Thu: 9 AM to 6 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Email Support</p>
                  <a href={`mailto:${settings?.email || 'hello@wearix.com.bd'}`} className="hover:text-blue-600 transition-colors">
                    {settings?.email || 'hello@wearix.com.bd'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Headquarters</p>
                  <p className="text-xs leading-relaxed">
                    Dhanmondi, Dhaka-1205, Bangladesh
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message form */}
        <div className="md:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 text-lg border-b pb-3 border-gray-100 mb-4">
            Send Message
          </h2>

          {submitted && (
            <div className="bg-green-50 text-green-700 text-xs px-3 py-2.5 rounded-xl border border-green-150 flex items-center gap-2 font-medium mb-4">
              <Check className="w-4 h-4" /> Message sent successfully! We will get back to you shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Rahim Uddin"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. you@example.com"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Your Message
              </label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help you?"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
