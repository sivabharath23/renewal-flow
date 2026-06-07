export const INVOICE_TEMPLATE_PRESETS = [
  { id: 'classic', label: 'Classic', description: 'Blue accent bar with standard layout' },
  { id: 'modern', label: 'Modern', description: 'Bold header band with clean typography' },
  { id: 'minimal', label: 'Minimal', description: 'Light borders and spacious layout' },
  { id: 'professional', label: 'Professional', description: 'Corporate dark header style' },
  { id: 'custom', label: 'Custom', description: 'Your own colors, text, and section toggles' },
] as const;

export type InvoiceTemplateId = (typeof INVOICE_TEMPLATE_PRESETS)[number]['id'];

export interface InvoiceTemplateCustomConfig {
  primaryColor: string;
  headerTitle: string;
  thankYouMessage: string;
  footerNote: string;
  showQrCode: boolean;
  showPaymentInstructions: boolean;
  showStatus: boolean;
  showProjectDetails: boolean;
  layout: 'standard' | 'compact' | 'sidebar';
}

export const DEFAULT_CUSTOM_CONFIG: InvoiceTemplateCustomConfig = {
  primaryColor: '#2563eb',
  headerTitle: 'INVOICE',
  thankYouMessage: 'Thank you for your business!',
  footerNote:
    'This is a computer-generated invoice and does not require a physical signature.',
  showQrCode: true,
  showPaymentInstructions: true,
  showStatus: true,
  showProjectDetails: true,
  layout: 'standard',
};

export function parseCustomConfig(raw: string | null | undefined): InvoiceTemplateCustomConfig {
  if (!raw) return { ...DEFAULT_CUSTOM_CONFIG };
  try {
    const parsed = JSON.parse(raw) as Partial<InvoiceTemplateCustomConfig>;
    return { ...DEFAULT_CUSTOM_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CUSTOM_CONFIG };
  }
}

export function serializeCustomConfig(config: InvoiceTemplateCustomConfig): string {
  return JSON.stringify(config);
}
