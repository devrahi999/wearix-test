import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redeem Points | WearixBD',
  description: 'Redeem your WearixBD reward points for exclusive discount coupons. Convert your points to savings on your next order.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
