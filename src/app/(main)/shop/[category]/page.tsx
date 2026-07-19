import { Metadata } from 'next';
import { getCategories } from '@/lib/db';
import CategoryClient from './CategoryClient';
import { SITE_NAME, SITE_URL } from '@/constants';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const categoryInfo = categories.find(c => c.slug.toLowerCase() === category.toLowerCase());
  
  const titleName = categoryInfo ? categoryInfo.name : category.charAt(0).toUpperCase() + category.slice(1);
  const title = `${titleName} | WearixBD`;
  const description = `Premium ${titleName} in Bangladesh. Stylish, comfortable and affordable ${titleName} with Cash on Delivery.`;
  const url = `${SITE_URL}/shop/${category}`;
  const image = categoryInfo?.image || '/logo.png';

  return {
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
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

import { getProducts } from '@/lib/db';

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const categoryInfo = categories.find(c => c.slug.toLowerCase() === category.toLowerCase()) || null;
  const activeProds = products.filter(p => p.isActive);
  
  const categoryProducts = categoryInfo 
    ? activeProds.filter(p => {
        const matchPrimary = p.category === categoryInfo.slug || p.category === categoryInfo.name || p.category.toLowerCase() === category.toLowerCase();
        const matchSecondary = p.categories?.some(c => c === categoryInfo.slug || c === categoryInfo.name || c.toLowerCase() === category.toLowerCase());
        return matchPrimary || matchSecondary;
      })
    : activeProds.filter(p => p.category.toLowerCase() === category.toLowerCase() || p.categories?.some(c => c.toLowerCase() === category.toLowerCase()));

  // Schema.org CollectionPage
  const titleName = category.charAt(0).toUpperCase() + category.slice(1);
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${titleName} Collection`,
    url: `${SITE_URL}/shop/${category}`,
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
        item: `${SITE_URL}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: titleName,
        item: `${SITE_URL}/shop/${category}`,
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([collectionJsonLd, breadcrumbJsonLd]) }}
      />
      <CategoryClient 
        categorySlug={category} 
        initialProducts={categoryProducts}
        initialCategoryInfo={categoryInfo}
      />
    </>
  );
}
