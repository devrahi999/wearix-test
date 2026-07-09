'use client';

import { useState, useEffect } from 'react';
import { listenToMarketingSettings, MarketingSettings } from '@/lib/db';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function PopupBanner() {
  const [settings, setSettings] = useState<MarketingSettings | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const unsub = listenToMarketingSettings(setSettings);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (settings?.popupActive && settings.popupImage) {
      // Check session storage if already seen
      const seen = sessionStorage.getItem('popupBannerSeen');
      if (!seen) {
        // Show after a slight delay
        const timer = setTimeout(() => setShow(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [settings]);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('popupBannerSeen', 'true');
  };

  if (!show || !settings || !settings.popupActive || !settings.popupImage) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>
        
        {settings.popupLink ? (
          <Link href={settings.popupLink} onClick={handleClose}>
            <img src={settings.popupImage} alt="Special Offer" className="w-full h-auto block" />
          </Link>
        ) : (
          <img src={settings.popupImage} alt="Special Offer" className="w-full h-auto block" />
        )}
      </div>
    </div>
  );
}
