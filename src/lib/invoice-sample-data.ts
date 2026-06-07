export interface PreviewCompanySettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  upiId: string;
  upiName: string;
  companyLogo: string | null;
  showLogo: boolean;
}

export const SAMPLE_INVOICE = {
  invoiceNumber: 'INV-2026-001',
  invoiceDate: new Date('2026-06-07'),
  dueDate: new Date('2026-06-21'),
  amount: 15000,
  description: 'Website development and monthly maintenance services.',
  status: 'PENDING',
  client: {
    name: 'Rajesh Kumar',
    companyName: 'Acme Technologies Pvt Ltd',
    email: 'rajesh@acmetech.com',
    phone: '+91 98765 43210',
    address: '42 MG Road, Bengaluru, Karnataka 560001',
    gstNo: '29ABCDE1234F1Z5',
  },
  project: {
    projectName: 'Corporate Website Revamp',
  },
};

export function buildPreviewSettings(settings?: Partial<PreviewCompanySettings> | null): PreviewCompanySettings {
  return {
    companyName: settings?.companyName || 'RenewalFlow Agency',
    companyEmail: settings?.companyEmail || 'hello@renewalflow.com',
    companyPhone: settings?.companyPhone || '+91 98765 43210',
    upiId: settings?.upiId || 'agency@upi',
    upiName: settings?.upiName || 'RenewalFlow',
    companyLogo: settings?.companyLogo ?? null,
    showLogo: settings?.showLogo ?? true,
  };
}

/** Placeholder QR for previews — no server call needed */
export const SAMPLE_QR_PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" fill="#f8fafc"/>
      <rect x="8" y="8" width="28" height="28" fill="#334155"/>
      <rect x="84" y="8" width="28" height="28" fill="#334155"/>
      <rect x="8" y="84" width="28" height="28" fill="#334155"/>
      <rect x="44" y="44" width="10" height="10" fill="#334155"/>
      <rect x="60" y="44" width="10" height="10" fill="#334155"/>
      <rect x="44" y="60" width="10" height="10" fill="#334155"/>
      <rect x="66" y="66" width="14" height="14" fill="#334155"/>
      <rect x="84" y="84" width="10" height="10" fill="#334155"/>
    </svg>`
  );
