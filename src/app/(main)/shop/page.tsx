import { Metadata } from 'next';
import ShopClient from './ShopClient';
import { SITE_NAME, SITE_URL } from '@/constants';

const title = `Shop All Products | ${SITE_NAME}`;
const description = `Explore our complete collection of fashion products at ${SITE_NAME}. Shop the best quality clothes in Bangladesh.`;
const url = `${SITE_URL}/shop`;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function ShopPage() {
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Products',
    url,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: url,
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([collectionJsonLd, breadcrumbJsonLd]) }}
      />
      <ShopClient />
    </>
  );
}
