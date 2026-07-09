import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import BottomNav from '@/components/layout/BottomNav';
import TopBanner from '@/components/layout/TopBanner';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopBanner />
      <Navbar />
      <main className="flex-grow pb-20">{children}</main>
      <Footer />
      <WhatsAppButton />
      <BottomNav />
    </div>
  );
}
