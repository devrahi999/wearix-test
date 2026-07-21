import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Settings | WearixBD',
  description: 'Update your WearixBD account settings, profile information and preferences.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
