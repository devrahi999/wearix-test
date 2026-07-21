import { Metadata } from 'next';
import HomeClient from './HomeClient';
import { SITE_NAME, SITE_URL } from '@/constants';
import { getStoreSettings } from '@/lib/db';

export const metadata: Metadata = {
  title: 'WearixBD — Premium Fashion Store | পোলো শার্ট, টি-শার্ট | Bangladesh',
  description: 'WearixBD (Wearix BD) — Shop premium polo shirts, t-shirts, trousers, hoodies & jerseys online in Bangladesh. Free delivery inside Dhaka above ৳1500. Cash on Delivery available nationwide.',
  keywords: [
    'wearixbd', 'wearix', 'wearix bd', 'wearixbd.store',
    'polo shirt bangladesh', 'buy polo shirt bd', 'online fashion bangladesh',
    'premium tshirt bangladesh', 'jersey bangladesh online', 'buy clothes online bd',
    'men fashion bangladesh', 'clothing store bangladesh', 'cash on delivery clothes bd',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'WearixBD — Premium Fashion | Polo, T-Shirts, Jersey | Bangladesh',
    description: 'Shop premium polo shirts, t-shirts, trousers & more at WearixBD. Cash on Delivery. Nationwide delivery across Bangladesh.',
    url: SITE_URL,
    type: 'website',
    images: [{ url: `${SITE_URL}/logo.png`, width: 1200, height: 630, alt: 'WearixBD' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WearixBD — Premium Fashion in Bangladesh',
    description: 'Shop polo shirts, t-shirts, hoodies & more at WearixBD. Cash on Delivery.',
    images: [`${SITE_URL}/logo.png`],
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
