import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Wishlist | WearixBD',
  description: 'Your saved fashion items at WearixBD. Add items to wishlist and shop later.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
