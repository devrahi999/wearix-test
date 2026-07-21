import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Categories | WearixBD',
  description: 'Browse all fashion categories at WearixBD - Polo shirts, T-shirts, Trousers, Shirts and more. Shop the latest trends in Bangladesh.',
  alternates: { canonical: 'https://wearixbd.store/categories' },
  openGraph: {
    title: 'All Categories | WearixBD',
    description: 'Browse all fashion categories at WearixBD.',
    url: 'https://wearixbd.store/categories',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
