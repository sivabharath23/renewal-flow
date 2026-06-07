'use client';

import { Mail, Phone, Coins, QrCode } from 'lucide-react';
import {
  InvoiceTemplateId,
  InvoiceTemplateCustomConfig,
  DEFAULT_CUSTOM_CONFIG,
} from '@/lib/invoice-templates';

interface InvoiceClient {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  gstNo: string | null;
}

interface InvoiceProject {
  projectName: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string | Date;
  dueDate: string | Date;
  amount: number;
  description: string | null;
  status: string;
  client: InvoiceClient;
  project: InvoiceProject;
}

interface CompanySettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  upiId: string;
  upiName: string;
  companyLogo: string | null;
  showLogo: boolean;
}

interface InvoiceTemplateRendererProps {
  invoice: InvoiceData;
  settings: CompanySettings | null;
  qrCodeUrl: string | null;
  templateId: InvoiceTemplateId;
  customConfig?: InvoiceTemplateCustomConfig;
}

function formatDate(dateVal: string | Date) {
  return new Date(dateVal).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatAmount(amount: number) {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'PAID'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      : status === 'PENDING'
        ? 'bg-amber-50 text-amber-700 border border-amber-100'
        : status === 'CANCELLED'
          ? 'bg-rose-50 text-rose-700 border border-rose-100'
          : 'bg-slate-100 text-slate-700 border border-slate-200';
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}

function CompanyBlock({
  settings,
  accentColor,
  titleClass,
}: {
  settings: CompanySettings | null;
  accentColor?: string;
  titleClass?: string;
}) {
  return (
    <div className="flex flex-col gap-3 print:gap-1.5">
      {settings?.showLogo && settings?.companyLogo ? (
        <>
          <div className="max-h-16 flex items-center mb-1 print:mb-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.companyLogo}
              alt="Company Logo"
              className="max-h-16 max-w-[220px] object-contain print:max-h-12"
            />
          </div>
          <p className="font-bold text-slate-800 text-sm leading-none mb-1 print:mb-0 print:text-xs">
            {settings.companyName}
          </p>
        </>
      ) : (
        <h2
          className={`text-2xl font-black tracking-tight print:text-xl leading-none ${titleClass || 'text-blue-600'}`}
          style={accentColor ? { color: accentColor } : undefined}
        >
          {settings?.companyName || 'RenewalFlow Agency'}
        </h2>
      )}
      <div className="text-slate-500 font-semibold space-y-1 print:space-y-0.5">
        <p className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0 print:w-3 print:h-3" />
          {settings?.companyEmail}
        </p>
        <p className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 print:w-3 print:h-3" />
          {settings?.companyPhone}
        </p>
      </div>
    </div>
  );
}

function LineItemsTable({
  invoice,
  headerBg,
  totalColor,
  bordered,
}: {
  invoice: InvoiceData;
  headerBg?: string;
  totalColor?: string;
  bordered?: boolean;
}) {
  const thClass = bordered
    ? 'py-3 print:py-1.5 px-4 text-white text-[9px] font-bold uppercase tracking-wider'
    : 'py-3 print:py-1.5 text-slate-500 text-[9px] font-bold uppercase tracking-wider border-b border-slate-200';

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr style={headerBg ? { backgroundColor: headerBg } : undefined} className={bordered ? '' : ''}>
          <th className={`${thClass} pr-4 w-12 text-center`}>#</th>
          <th className={`${thClass} px-4`}>Item & Description</th>
          <th className={`${thClass} text-center w-20`}>Qty</th>
          <th className={`${thClass} text-right w-32`}>Rate</th>
          <th className={`${thClass} pl-4 text-right w-36`}>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-slate-100">
          <td className="py-4 print:py-2 pr-4 font-semibold text-slate-400 text-center">1</td>
          <td className="py-4 print:py-2 px-4">
            <span className="font-bold text-slate-900 text-sm print:text-xs block">
              {invoice.project.projectName}
            </span>
            <span className="text-xs text-slate-500 block mt-1 leading-relaxed print:mt-0.5">
              {invoice.description || 'Assigned contract deliverables'}
            </span>
          </td>
          <td className="py-4 print:py-2 px-4 text-center text-slate-600">1</td>
          <td className="py-4 print:py-2 px-4 text-right text-slate-600">₹{formatAmount(invoice.amount)}</td>
          <td className="py-4 print:py-2 pl-4 text-right font-bold text-slate-900 text-sm print:text-xs">
            ₹{formatAmount(invoice.amount)}
          </td>
        </tr>
        <tr>
          <td colSpan={3} className="py-4 print:py-1" />
          <td className="py-4 print:py-1.5 px-4 text-right text-slate-500 font-medium uppercase text-[9px] border-b border-slate-100">
            Subtotal
          </td>
          <td className="py-4 print:py-1.5 pl-4 text-right text-slate-900 font-semibold text-sm print:text-xs border-b border-slate-100">
            ₹{formatAmount(invoice.amount)}
          </td>
        </tr>
        <tr>
          <td colSpan={3} className="py-4 print:py-1" />
          <td className="py-4 print:py-1.5 px-4 text-right text-slate-900 font-bold uppercase text-[9px]">
            Total Due
          </td>
          <td
            className="py-4 print:py-1.5 pl-4 text-right font-black text-lg print:text-base"
            style={{ color: totalColor || '#2563eb' }}
          >
            ₹{formatAmount(invoice.amount)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function PaymentSection({
  settings,
  invoice,
  qrCodeUrl,
  accentColor,
  showInstructions,
  showQr,
}: {
  settings: CompanySettings | null;
  invoice: InvoiceData;
  qrCodeUrl: string | null;
  accentColor?: string;
  showInstructions?: boolean;
  showQr?: boolean;
}) {
  if (!showInstructions && !showQr) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 print:gap-4 border border-slate-100 rounded-2xl p-5 print:p-3 bg-slate-50/30 mt-6 print:mt-2 print:bg-transparent print:border-slate-200/60 print:rounded-xl">
      {showInstructions && (
        <div className={`space-y-4 print:space-y-2 ${showQr ? 'md:col-span-3' : 'md:col-span-5'}`}>
          <div>
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 print:text-[11px]">
              <Coins className="w-4 h-4 print:w-3.5 print:h-3.5" style={{ color: accentColor || '#2563eb' }} />
              <span>Payment Instructions</span>
            </h4>
            <p className="text-slate-500 text-[10px] leading-relaxed mt-1 print:text-[9px] print:leading-snug">
              Please scan the UPI QR code or use the UPI handle details below to make payment.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 print:gap-1 text-[10px] text-slate-600 print:text-[9px]">
            <div className="flex justify-between py-1.5 print:py-0.5 border-b border-slate-100">
              <span className="text-slate-400 font-semibold">UPI VPA ID</span>
              <strong className="text-slate-800 font-bold">{settings?.upiId || '9003793639@ptsbi'}</strong>
            </div>
            <div className="flex justify-between py-1.5 print:py-0.5 border-b border-slate-100">
              <span className="text-slate-400 font-semibold">Payee Name</span>
              <strong className="text-slate-800 font-bold">{settings?.upiName || 'Sivabharath'}</strong>
            </div>
            <div className="flex justify-between py-1.5 print:py-0.5 border-b border-slate-100">
              <span className="text-slate-400 font-semibold">Reference Code</span>
              <strong className="text-slate-800 font-bold">{invoice.invoiceNumber}</strong>
            </div>
          </div>
        </div>
      )}
      {showQr && (
        <div className="md:col-span-2 flex flex-col items-center justify-center border border-slate-150 rounded-xl p-4 bg-white shadow-xs print:shadow-none print:border-none print:p-0 print:bg-transparent">
          {qrCodeUrl ? (
            <div className="flex flex-col items-center">
              <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg print:p-0.5 print:border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="UPI Payment QR" className="w-32 h-32 print:w-22 print:h-22 object-contain" />
              </div>
              <span className="text-[9px] font-bold text-slate-500 mt-2 flex items-center gap-1 uppercase tracking-wider print:mt-1 print:text-[8px]">
                <QrCode className="w-3 h-3 text-slate-400 print:w-2.5 print:h-2.5" />
                <span>Scan to Pay (UPI)</span>
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 print:py-2">
              <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-2" />
              <span className="text-[10px] text-slate-400 font-bold">Generating QR Code...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InvoiceFooter({
  settings,
  thankYou,
  footerNote,
}: {
  settings: CompanySettings | null;
  thankYou: string;
  footerNote: string;
}) {
  return (
    <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-8 print:pt-3 mt-12 print:mt-4 font-medium print:text-[9px]">
      <p className="text-slate-700 font-bold text-xs mb-1 print:text-[10px] print:mb-0">{thankYou}</p>
      <p>{footerNote}</p>
      <p className="mt-1 print:mt-0.5">
        For support or queries, contact{' '}
        <strong className="text-slate-600 font-semibold">
          {settings?.companyEmail || 'hello@renewalflow.com'}
        </strong>
        .
      </p>
    </div>
  );
}

export default function InvoiceTemplateRenderer({
  invoice,
  settings,
  qrCodeUrl,
  templateId,
  customConfig = DEFAULT_CUSTOM_CONFIG,
}: InvoiceTemplateRendererProps) {
  const cfg = customConfig;
  const accent =
    templateId === 'custom'
      ? cfg.primaryColor
      : templateId === 'professional'
        ? '#1e293b'
        : templateId === 'minimal'
          ? '#64748b'
          : '#2563eb';

  const headerTitle =
    templateId === 'custom' ? cfg.headerTitle : 'INVOICE';

  const showStatus = templateId === 'custom' ? cfg.showStatus : true;
  const showProject = templateId === 'custom' ? cfg.showProjectDetails : true;
  const showQr = templateId === 'custom' ? cfg.showQrCode : true;
  const showPay = templateId === 'custom' ? cfg.showPaymentInstructions : true;
  const thankYou =
    templateId === 'custom' ? cfg.thankYouMessage : 'Thank you for your business!';
  const footerNote =
    templateId === 'custom'
      ? cfg.footerNote
      : 'This is a computer-generated invoice and does not require a physical signature.';

  if (templateId === 'modern') {
    return (
      <div className="flex-1 flex flex-col gap-6 print:gap-4 text-slate-800 text-xs font-medium">
        <div className="-mx-6 sm:-mx-10 -mt-6 sm:-mt-10 print:-mx-6 print:-mt-0 px-6 sm:px-10 py-6 print:py-4 text-white print:text-slate-900" style={{ backgroundColor: accent }}>
          <div className="flex justify-between items-start gap-4">
            <CompanyBlock settings={settings} titleClass="text-white print:text-slate-900" />
            <div className="text-right">
              <h1 className="text-3xl font-black uppercase tracking-widest print:text-xl">INVOICE</h1>
              <p className="mt-2 text-sm font-bold opacity-90 print:opacity-100 print:text-slate-700">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:gap-2 border-b border-slate-100 pb-6 print:pb-3">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">Issue Date</p>
            <p className="font-bold text-slate-800">{formatDate(invoice.invoiceDate)}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">Due Date</p>
            <p className="font-bold text-slate-800">{formatDate(invoice.dueDate)}</p>
          </div>
          {showStatus && (
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Status</p>
              <div className="mt-0.5"><StatusBadge status={invoice.status} /></div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 print:gap-4 border-b border-slate-100 pb-6 print:pb-3">
          <div>
            <h3 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">Billed To</h3>
            <p className="text-sm font-bold text-slate-900">{invoice.client.companyName}</p>
            <p className="text-xs text-slate-500 whitespace-pre-line mt-1">{invoice.client.address}</p>
          </div>
          {showProject && (
            <div>
              <h3 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">Project</h3>
              <p className="text-sm font-bold text-slate-900">{invoice.project.projectName}</p>
              <p className="text-xs text-slate-500 mt-1">{invoice.description || 'Contract deliverables'}</p>
            </div>
          )}
        </div>
        <LineItemsTable invoice={invoice} headerBg={accent} totalColor={accent} bordered />
        <PaymentSection settings={settings} invoice={invoice} qrCodeUrl={qrCodeUrl} accentColor={accent} showInstructions={showPay} showQr={showQr} />
        <InvoiceFooter settings={settings} thankYou={thankYou} footerNote={footerNote} />
      </div>
    );
  }

  if (templateId === 'minimal') {
    return (
      <div className="flex-1 flex flex-col gap-8 print:gap-4 text-slate-800 text-xs font-medium">
        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 print:pb-2">
          <CompanyBlock settings={settings} titleClass="text-slate-800" />
          <div className="text-right">
            <h1 className="text-4xl font-light text-slate-300 uppercase tracking-[0.3em] print:text-2xl">Invoice</h1>
            <p className="text-sm font-mono text-slate-600 mt-1">{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex justify-between gap-8 print:gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-2">Bill To</p>
            <p className="font-bold">{invoice.client.companyName}</p>
            <p className="text-slate-500 text-xs mt-1 whitespace-pre-line">{invoice.client.address}</p>
          </div>
          <div className="text-right text-xs space-y-1">
            <p><span className="text-slate-400">Issued:</span> {formatDate(invoice.invoiceDate)}</p>
            <p><span className="text-slate-400">Due:</span> {formatDate(invoice.dueDate)}</p>
            {showStatus && <div className="flex justify-end mt-1"><StatusBadge status={invoice.status} /></div>}
          </div>
        </div>
        {showProject && (
          <p className="text-xs text-slate-500 border-l-2 border-slate-200 pl-3">
            <strong className="text-slate-700">{invoice.project.projectName}</strong>
            {' — '}
            {invoice.description || 'Contract deliverables'}
          </p>
        )}
        <LineItemsTable invoice={invoice} totalColor="#334155" />
        <PaymentSection settings={settings} invoice={invoice} qrCodeUrl={qrCodeUrl} accentColor="#64748b" showInstructions={showPay} showQr={showQr} />
        <InvoiceFooter settings={settings} thankYou={thankYou} footerNote={footerNote} />
      </div>
    );
  }

  if (templateId === 'professional') {
    return (
      <div className="flex-1 flex flex-col gap-0 print:gap-0 text-slate-800 text-xs font-medium">
        <div className="bg-slate-900 text-white px-6 py-5 print:py-3 -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 print:-mx-6 print:-mt-0 print:bg-slate-900">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Tax Document</p>
              <h1 className="text-2xl font-bold mt-1 print:text-xl">INVOICE</h1>
            </div>
            <div className="text-right text-sm">
              <p className="font-mono font-bold">{invoice.invoiceNumber}</p>
              <p className="text-slate-400 text-[10px] mt-1">{formatDate(invoice.invoiceDate)}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 py-6 print:py-3 border-b border-slate-200">
          <div>
            <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">From</p>
            <p className="font-bold">{settings?.companyName}</p>
            <p className="text-slate-500 text-[10px]">{settings?.companyEmail}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Bill To</p>
            <p className="font-bold">{invoice.client.companyName}</p>
            <p className="text-slate-500 text-[10px]">{invoice.client.email}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Due Date</p>
            <p className="font-bold">{formatDate(invoice.dueDate)}</p>
            {showStatus && <div className="flex justify-end mt-2"><StatusBadge status={invoice.status} /></div>}
          </div>
        </div>
        {showProject && (
          <div className="py-3 border-b border-slate-100">
            <p className="text-[9px] font-bold uppercase text-slate-400">Project</p>
            <p className="font-bold text-sm">{invoice.project.projectName}</p>
          </div>
        )}
        <div className="py-4 print:py-2">
          <LineItemsTable invoice={invoice} headerBg="#1e293b" totalColor="#1e293b" bordered />
        </div>
        <PaymentSection settings={settings} invoice={invoice} qrCodeUrl={qrCodeUrl} accentColor="#1e293b" showInstructions={showPay} showQr={showQr} />
        <InvoiceFooter settings={settings} thankYou={thankYou} footerNote={footerNote} />
      </div>
    );
  }

  // classic (default) and custom
  const isCustom = templateId === 'custom';
  const topBarStyle = isCustom ? { background: `linear-gradient(to right, ${accent}, ${accent}dd)` } : undefined;

  return (
    <div className="flex-1 flex flex-col gap-8 print:gap-4 text-slate-800 text-xs font-medium mt-10 print:mt-0">
      {!isCustom && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl print:hidden" />
      )}
      {isCustom && cfg.layout === 'sidebar' && (
        <div className="absolute top-0 left-0 bottom-0 w-2 print:hidden" style={{ backgroundColor: accent }} />
      )}

      <div className="flex justify-between items-start border-b border-slate-100 pb-8 print:pb-4 mt-6 print:mt-2">
        <CompanyBlock settings={settings} accentColor={isCustom ? accent : undefined} />
        <div className="text-right flex flex-col items-end gap-4 print:gap-2">
          <div>
            <h1
              className="text-3xl font-light tracking-widest text-slate-900 uppercase print:text-xl print:tracking-wider"
              style={isCustom ? { color: accent } : undefined}
            >
              {headerTitle}
            </h1>
            <div
              className={`inline-block mt-2 px-3 py-1 rounded-lg border text-xs font-bold print:mt-1 print:py-0.5 print:px-2 print:text-[10px] ${
                !isCustom ? 'bg-blue-50/50 text-blue-600 border-blue-100/50' : ''
              }`}
              style={
                isCustom
                  ? { backgroundColor: `${accent}15`, color: accent, borderColor: `${accent}30` }
                  : undefined
              }
            >
              Invoice No: {invoice.invoiceNumber}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-right mt-1 print:gap-y-1 print:mt-0">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Date of Issue</p>
              <p className="text-slate-700 font-bold mt-0.5 print:mt-0">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Due Date</p>
              <p className="text-slate-700 font-bold mt-0.5 print:mt-0">{formatDate(invoice.dueDate)}</p>
            </div>
            {showStatus && (
              <div className="col-span-2 flex justify-end items-center gap-2 mt-1 print:mt-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Status:</span>
                <StatusBadge status={invoice.status} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 print:gap-4 border-b border-slate-100 pb-8 print:pb-4">
        <div>
          <h3 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2.5 print:mb-1">Billed To</h3>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900 print:text-xs">{invoice.client.companyName}</p>
            {invoice.client.name !== invoice.client.companyName && (
              <p className="text-xs font-semibold text-slate-700">{invoice.client.name}</p>
            )}
            <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] whitespace-pre-line">{invoice.client.address}</p>
            <div className="pt-2 print:pt-1 text-[10px] text-slate-400 space-y-0.5">
              <p>Email: <span className="text-slate-600 font-medium">{invoice.client.email}</span></p>
              <p>Phone: <span className="text-slate-600 font-medium">{invoice.client.phone}</span></p>
              {invoice.client.gstNo && (
                <p className="font-bold text-slate-700 uppercase pt-1 print:pt-0.5">GSTIN: {invoice.client.gstNo}</p>
              )}
            </div>
          </div>
        </div>
        {showProject && (
          <div>
            <h3 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2.5 print:mb-1">Project Details</h3>
            <div className="space-y-1.5 print:space-y-1">
              <p className="text-sm font-bold text-slate-900 print:text-xs">{invoice.project.projectName}</p>
              <div className="p-3 print:p-2 bg-slate-50/50 rounded-xl border border-slate-100/50 print:bg-transparent print:border-none print:p-0">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {invoice.description || 'Deliverables, development and maintenance services as per contract terms.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 print:mt-0">
        <LineItemsTable invoice={invoice} totalColor={accent} />
      </div>

      <PaymentSection
        settings={settings}
        invoice={invoice}
        qrCodeUrl={qrCodeUrl}
        accentColor={accent}
        showInstructions={showPay}
        showQr={showQr}
      />

      <InvoiceFooter settings={settings} thankYou={thankYou} footerNote={footerNote} />

      {isCustom && topBarStyle && (
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl print:hidden" style={topBarStyle} />
      )}
    </div>
  );
}
