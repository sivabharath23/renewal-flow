import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { getSessionUser } from '@/lib/auth-helpers';
import { ToastProvider } from '@/context/ToastContext';
import TenantSwitcher from '@/components/TenantSwitcher';
import PWARegister from '@/components/PWARegister';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Renewal Flow",
  },
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
          <PWARegister />
          {user ? (
            <div className="flex min-h-screen">
              {/* Sidebar Navigation */}
              <Sidebar user={user} />

              {/* Page content wrapper */}
              <div className="flex-1 flex flex-col min-w-0">
                {user.role === 'ADMIN' && (
                  <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200/50 no-print shrink-0 h-16">
                    <div>
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administrative Session</h2>
                    </div>
                    <TenantSwitcher />
                  </header>
                )}
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
