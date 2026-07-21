import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | WearixBD',
  description: 'Login to your WearixBD account to track orders, manage wishlist and access exclusive deals.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
