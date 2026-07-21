import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search | WearixBD',
  description: 'Search for polo shirts, t-shirts, trousers and other premium fashion items at WearixBD.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
