import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Categories',
  
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
