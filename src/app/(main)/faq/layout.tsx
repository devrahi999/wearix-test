import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | WearixBD',
  description: 'Frequently asked questions about WearixBD — delivery charges, return policy, payment methods, order tracking and more.',
  keywords: ['wearixbd faq', 'wearix bd help', 'wearixbd delivery', 'wearixbd returns', 'wearixbd payment'],
  alternates: { canonical: 'https://wearixbd.store/faq' },
  openGraph: {
    title: 'FAQ | WearixBD',
    description: 'Find answers to common questions about shopping at WearixBD.',
    url: 'https://wearixbd.store/faq',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
