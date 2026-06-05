import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RenewalFlow Client & Renewal Manager',
    short_name: 'RenewalFlow',
    description: 'Manage clients, projects, domains, servers, AMC contracts, invoices, and payments in one dashboard.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
