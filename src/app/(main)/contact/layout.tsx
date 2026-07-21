import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | WearixBD',
  description: 'Contact WearixBD for any help with your orders, returns, or product queries. We are here to help you 7 days a week.',
  keywords: ['wearixbd contact', 'wearix bd customer support', 'wearixbd helpline', 'wearixbd email'],
  alternates: { canonical: 'https://wearixbd.store/contact' },
  openGraph: {
    title: 'Contact Us | WearixBD',
    description: 'Get in touch with WearixBD — we are here to help.',
    url: 'https://wearixbd.store/contact',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
