'use client';

import { useState, useEffect } from 'react';
import { listenToMarketingSettings, MarketingSettings } from '@/lib/db';
import Link from 'next/link';

export default function TopBanner() {
  const [settings, setSettings] = useState<MarketingSettings | null>(null);

  useEffect(() => {
    const unsub = listenToMarketingSettings(setSettings);
    return () => unsub();
  }, []);

  if (!settings || !settings.topBannerActive) return null;

  return (
    <div className="bg-blue-600 text-white text-xs font-semibold py-2 px-4 text-center relative z-[60] w-full">
      {settings.topBannerText}{' '}
      {settings.topBannerLink && (
        <Link href={settings.topBannerLink} className="underline hover:text-blue-200 ml-2 font-bold whitespace-nowrap">
          Click Here
        </Link>
      )}
    </div>
  );
}
