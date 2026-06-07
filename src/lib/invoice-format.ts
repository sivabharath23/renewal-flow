export const INVOICE_FORMAT_PRESETS = [
  { id: 'inv-year-seq', label: 'INV-2026-001', template: 'INV-{YEAR}-{SEQ}' },
  { id: 'inv-slash', label: 'INV/2026/001', template: 'INV/{YEAR}/{SEQ}' },
  { id: 'year-seq', label: '2026-001', template: '{YEAR}-{SEQ}' },
  { id: 'rf-seq', label: 'RF-001', template: 'RF-{SEQ}' },
  { id: 'inv-yearmonth-seq', label: 'INV-202606-001', template: 'INV-{YYYYMM}-{SEQ}' },
  { id: 'custom', label: 'Custom Format', template: '' },
] as const;

export type InvoiceFormatPresetId = (typeof INVOICE_FORMAT_PRESETS)[number]['id'];

export function getTemplateForFormat(
  formatId: string,
  customTemplate?: string | null
): string {
  if (formatId === 'custom') {
    return (customTemplate || 'INV-{YEAR}-{SEQ}').trim();
  }
  const preset = INVOICE_FORMAT_PRESETS.find((p) => p.id === formatId);
  return preset?.template || 'INV-{YEAR}-{SEQ}';
}

export function renderInvoiceFormat(
  template: string,
  options: { date?: Date; sequence?: number } = {}
): string {
  const date = options.date ?? new Date();
  const sequence = options.sequence ?? 1;

  return template
    .replace(/\{YEAR\}/g, String(date.getFullYear()))
    .replace(/\{YY\}/g, String(date.getFullYear()).slice(-2))
    .replace(/\{MONTH\}/g, String(date.getMonth() + 1).padStart(2, '0'))
    .replace(/\{MM\}/g, String(date.getMonth() + 1).padStart(2, '0'))
    .replace(/\{YYYYMM\}/g, `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`)
    .replace(/\{SEQ:(\d+)\}/g, (_, pad: string) =>
      String(sequence).padStart(parseInt(pad, 10), '0')
    )
    .replace(/\{SEQ\}/g, String(sequence).padStart(3, '0'));
}

function templateToRegex(template: string, date: Date): RegExp {
  let pattern = template.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  pattern = pattern.replace(/\\{YEAR\\}/g, String(date.getFullYear()));
  pattern = pattern.replace(/\\{YY\\}/g, String(date.getFullYear()).slice(-2));
  pattern = pattern.replace(/\\{MONTH\\}/g, String(date.getMonth() + 1).padStart(2, '0'));
  pattern = pattern.replace(/\\{MM\\}/g, String(date.getMonth() + 1).padStart(2, '0'));
  pattern = pattern.replace(
    /\\{YYYYMM\\}/g,
    `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  );
  pattern = pattern.replace(/\\{SEQ:\\d+\\}/g, '(\\d+)');
  pattern = pattern.replace(/\\{SEQ\\}/g, '(\\d+)');
  return new RegExp(`^${pattern}$`);
}

export function extractSequenceFromInvoiceNumber(
  template: string,
  invoiceNumber: string,
  date: Date
): number | null {
  try {
    const regex = templateToRegex(template, date);
    const match = invoiceNumber.match(regex);
    if (!match) return null;
    const seqGroup = match[match.length - 1];
    const parsed = parseInt(seqGroup, 10);
    return Number.isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

export function getNextSequence(
  invoiceNumbers: string[],
  template: string,
  date: Date
): number {
  let maxSeq = 0;
  for (const num of invoiceNumbers) {
    const seq = extractSequenceFromInvoiceNumber(template, num, date);
    if (seq !== null && seq > maxSeq) {
      maxSeq = seq;
    }
  }
  return maxSeq + 1;
}

export const INVOICE_FORMAT_TOKEN_HELP = [
  '{YEAR} — 4-digit year (2026)',
  '{YY} — 2-digit year (26)',
  '{MONTH} or {MM} — month (06)',
  '{YYYYMM} — year + month (202606)',
  '{SEQ} — sequence padded to 3 digits (001)',
  '{SEQ:4} — sequence padded to 4 digits (0001)',
];
