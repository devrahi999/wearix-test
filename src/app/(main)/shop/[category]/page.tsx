import { Metadata } from 'next';
import { getCategories } from '@/lib/db';
import CategoryClient from './CategoryClient';
import { SITE_NAME, SITE_URL } from '@/constants';

interface Props {
  params: { category: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const categoryInfo = categories.find(c => c.slug.toLowerCase() === category.toLowerCase());
  
  const titleName = categoryInfo ? categoryInfo.name : category.charAt(0).toUpperCase() + category.slice(1);
  const title = `${titleName} | Buy Online at ${SITE_NAME}`;
  const description = categoryInfo?.description || `Explore our latest collection of ${titleName.toLowerCase()} at ${SITE_NAME}. Best quality and fast delivery in Bangladesh.`;
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

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
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
      <CategoryClient categorySlug={category} />
    </>
  );
}
