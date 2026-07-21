import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed! | WearixBD',
  description: 'Your WearixBD order has been placed successfully. Thank you for shopping with us!',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
