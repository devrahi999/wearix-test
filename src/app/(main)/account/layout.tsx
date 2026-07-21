import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account | WearixBD',
  description: 'Manage your WearixBD account, view your orders, referrals, rewards and account settings.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
