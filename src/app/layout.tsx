import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
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
  alternates: { 
    canonical: '/',
    languages: { 'en-BD': 'https://wearixbd.store' } 
  },
  title: {
    default: `WearixBD - Premium Fashion Store in Bangladesh`,
    template: `%s | WearixBD`,
  },
  description: 'Shop premium polo shirts, t-shirts, trousers, shirts and more at WearixBD. Cash on Delivery, Nationwide Delivery across Bangladesh.',
  keywords: [
    'wearixbd', 'wearix', 'wearix bd', 'wearixbd.store', 'wearix bangladesh',
    'polo shirt bangladesh', 'buy polo shirt bd', 'online fashion store bd',
    'premium tshirt bangladesh', 'jersey bangladesh online', 'buy clothes online bd',
    'men fashion bangladesh', 'best clothing store bangladesh', 'cash on delivery clothes bd',
    'hoodie bangladesh', 'panjabi online bd', 'pants online bangladesh',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `WearixBD - Premium Fashion Store in Bangladesh`,
    description: 'Shop premium polo shirts, t-shirts, trousers, shirts and more at WearixBD. Cash on Delivery, Nationwide Delivery across Bangladesh.',
    images: [
      {
        url: '/logo.png', // Using logo.png as requested
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `WearixBD - Premium Fashion Store in Bangladesh`,
    description: 'Shop premium polo shirts, t-shirts, trousers, shirts and more at WearixBD. Cash on Delivery, Nationwide Delivery across Bangladesh.',
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
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: SITE_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}/logo.png`,
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: SITE_NAME,
                url: SITE_URL,
                potentialAction: {
                  '@type': 'SearchAction',
                  target: `${SITE_URL}/search?q={search_term_string}`,
                  'query-input': 'required name=search_term_string',
                },
              }
            ])
          }}
        />
        <MetaPixel />
      </head>
      <body className={`${inter.variable} font-sans bg-gray-50 text-gray-900 selection:bg-blue-100`}>
        <ConfirmProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ConfirmProvider>
        <Toaster position="top-center" />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
