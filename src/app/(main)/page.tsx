import { Metadata } from 'next';
import HomeClient from './HomeClient';
import { SITE_NAME, SITE_URL } from '@/constants';
import { getStoreSettings } from '@/lib/db';

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
};

import { getProducts, getHeroBanners, getPromoBanners, getFlashSaleConfig } from '@/lib/db';

export default async function HomePage() {
  const [storeSettings, products, heroBanners, promoBanners, flashSale] = await Promise.all([
    getStoreSettings(),
    getProducts(),
    getHeroBanners(),
    getPromoBanners(),
    getFlashSaleConfig(),
  ]);

  const activeProducts = products.filter(p => p.isActive);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    ...(storeSettings.phone && { contactPoint: { '@type': 'ContactPoint', telephone: storeSettings.phone, contactType: 'customer service' } }),
    sameAs: [
      storeSettings.facebook || '',
      storeSettings.instagram || '',
    ].filter(Boolean)
  };

  const webSiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, webSiteJsonLd]) }}
      />
      <HomeClient 
        initialProducts={activeProducts} 
        initialHeroBanners={heroBanners}
        initialPromoBanners={promoBanners}
        initialFlashSale={flashSale}
      />
    </>
  );
}
