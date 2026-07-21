import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders | WearixBD',
  description: 'Track and manage your WearixBD orders.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
