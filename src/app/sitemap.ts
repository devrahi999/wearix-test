import { MetadataRoute } from 'next';
import { getProducts, getCategories } from '@/lib/db';
import { SITE_URL } from '@/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    const [products, categories] = await Promise.all([getProducts(), getCategories()]);

    const activeProducts = products.filter(p => p.isActive);

    activeProducts.forEach((product) => {
      sitemapEntries.push({
        url: `${SITE_URL}/product/${product.slug}`,
        lastModified: new Date(), // We don't have updatedAt in mock DB currently, so use current date or product creation date if available
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    categories.forEach((category) => {
      sitemapEntries.push({
        url: `${SITE_URL}/shop/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return sitemapEntries;
}
