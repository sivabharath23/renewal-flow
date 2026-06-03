import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { getSessionUser } from '@/lib/auth-helpers';
import { ToastProvider } from '@/context/ToastContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'RenewalFlow - Client & Renewal Manager',
    template: '%s | RenewalFlow',
  },
  description: 'Manage clients, projects, domains, servers, AMC contracts, invoices, and payments in one dashboard.',
  keywords: ['client manager', 'renewal tracking', 'domain renewal alert', 'hosting server tracker', 'amc contracts', 'upi invoices', 'payment proofs'],
  authors: [{ name: 'Sivabharath' }],
  creator: 'Sivabharath',
  metadataBase: new URL('https://renewal-flow-saas.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://renewal-flow-saas.vercel.app',
    title: 'RenewalFlow - Client & Renewal Manager',
    description: 'Manage clients, projects, domains, servers, AMC contracts, invoices, and payments in one dashboard.',
    siteName: 'RenewalFlow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RenewalFlow - Client & Renewal Manager',
    description: 'Manage clients, projects, domains, servers, AMC contracts, invoices, and payments in one dashboard.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <ToastProvider>
          {user ? (
            <div className="flex min-h-screen">
              {/* Sidebar Navigation */}
              <Sidebar user={user} />
              
              {/* Page content wrapper */}
              <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 p-6 pt-22 md:p-8 bg-slate-50/50 overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            /* Render directly for unauthenticated pages (like /login) */
            children
          )}
        </ToastProvider>
      </body>
    </html>
  );
}
