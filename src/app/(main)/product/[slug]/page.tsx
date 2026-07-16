import { Metadata } from 'next';
import { getProductBySlug, getProducts, getReviewsByProduct } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';
import { SITE_NAME, SITE_URL } from '@/constants';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const title = `${product.name} - Buy Online in Bangladesh | ${SITE_NAME}`;
  const description = product.description.substring(0, 160) + (product.description.length > 160 ? '...' : '');
  const image = product.images[0] || '/logo.png';
  const url = `${SITE_URL}/product/${product.slug}`;

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

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Schema.org Structured Data
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: 'BDT',
      price: product.discountPrice || product.price,
      availability: product.isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.rating > 0 && product.reviewCount > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      }
    } : {})
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
        name: product.categories?.[0] || product.category,
        item: `${SITE_URL}/shop/${product.categories?.[0] || product.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `${SITE_URL}/product/${product.slug}`,
      }
    ]
  };

  const allProducts = await getProducts();
  const related = allProducts.filter(r => 
    r.id !== product.id && r.isActive && 
    (r.category === product.category || (product.categories && r.categories?.some(c => product.categories!.includes(c))))
  ).slice(0, 4);
  const reviews = await getReviewsByProduct(product.id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([productJsonLd, breadcrumbJsonLd]) }}
      />
      <ProductDetailClient 
        initialSlug={slug} 
        initialProduct={product}
        initialRelatedProducts={related}
        initialReviews={reviews}
      />
    </>
  );
}
