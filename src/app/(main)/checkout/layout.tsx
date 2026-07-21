import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | WearixBD',
  description: 'Securely complete your purchase at WearixBD. Cash on Delivery and online payment options available.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
