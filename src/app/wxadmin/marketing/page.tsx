'use client';

import { useState, useEffect, useRef } from 'react';
import { getMarketingSettings, updateMarketingSettings, MarketingSettings } from '@/lib/db';
import { Loader2, CheckCircle2, Upload, X } from 'lucide-react';

export default function MarketingPage() {
  const [settings, setSettings] = useState<MarketingSettings>({
    topBannerActive: false,
    topBannerText: '',
    topBannerLink: '',
    popupActive: false,
    popupImage: '',
    popupLink: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMarketingSettings().then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateMarketingSettings(settings);
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update settings');
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setSettings(prev => ({ ...prev, popupImage: data.url }));
        // Auto-save when image is uploaded
        await updateMarketingSettings({ ...settings, popupImage: data.url });
        setMessage('Image uploaded and saved!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        alert(data.error || 'Failed to upload image. Please try again.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image. Network error.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Marketing & Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage top header text and home page popup banner</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold border border-green-100 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Top Header Banner */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Top Header Banner</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-semibold text-gray-700">Active</span>
              <input 
                type="checkbox" 
                checked={settings.topBannerActive}
                onChange={e => setSettings({...settings, topBannerActive: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Banner Text</label>
              <input 
                type="text" 
                value={settings.topBannerText}
                onChange={e => setSettings({...settings, topBannerText: e.target.value})}
                placeholder="e.g. Get 20% off on all winter collections!"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Link (URL or Path)</label>
              <input 
                type="text" 
                value={settings.topBannerLink}
                onChange={e => setSettings({...settings, topBannerLink: e.target.value})}
                placeholder="e.g. /shop"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">This text will appear in a blue bar at the very top of the website. A "Click Here" link will be appended to it.</p>
        </div>

        {/* Home Page Popup Banner */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Home Page Popup Banner</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-semibold text-gray-700">Active</span>
              <input 
                type="checkbox" 
                checked={settings.popupActive}
                onChange={e => setSettings({...settings, popupActive: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Popup Image</label>
              {settings.popupImage ? (
                <div className="relative aspect-video rounded-xl border bg-gray-50 overflow-hidden group">
                  <img src={settings.popupImage} alt="Popup" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setSettings({...settings, popupImage: ''})}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow-sm">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />}
                  <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500 text-center px-2">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </span>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Popup Link (When clicked)</label>
              <input 
                type="text" 
                value={settings.popupLink}
                onChange={e => setSettings({...settings, popupLink: e.target.value})}
                placeholder="e.g. /shop"
                className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <p className="text-xs text-gray-500 mt-2">This popup will only show once per browser session when users visit the home page.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
