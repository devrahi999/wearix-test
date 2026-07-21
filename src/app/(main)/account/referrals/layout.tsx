import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referrals & Rewards | WearixBD',
  description: 'Earn reward points by referring friends to WearixBD. Share your referral code and get rewarded when they make their first purchase.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
