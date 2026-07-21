import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | WearixBD',
  description: 'Join WearixBD today. Create an account to shop premium fashion with Cash on Delivery across Bangladesh.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
