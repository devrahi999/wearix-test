import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import MetaPixel from '@/components/MetaPixel';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/constants';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Shop shirts, t-shirts, jerseys, pants, panjabi, hoodies, polos, women\'s fashion, kids\' wear, and accessories in Bangladesh.',
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: 'Shop shirts, t-shirts, jerseys, pants, panjabi, hoodies, polos, women\'s fashion, kids\' wear, and accessories in Bangladesh.',
    images: [
      {
        url: '/logo.png', // Ideally this should be a proper OG banner
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: 'Shop shirts, t-shirts, jerseys, pants, panjabi, hoodies, polos, women\'s fashion, kids\' wear, and accessories in Bangladesh.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased h-full`}>
      <body className={`${inter.variable} font-sans bg-gray-50 text-gray-900 selection:bg-blue-100`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-center" />
        <MetaPixel />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
