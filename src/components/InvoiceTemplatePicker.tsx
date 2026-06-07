'use client';

import InvoiceTemplateRenderer from '@/components/InvoiceTemplateRenderer';
import {
  INVOICE_TEMPLATE_PRESETS,
  InvoiceTemplateId,
  InvoiceTemplateCustomConfig,
} from '@/lib/invoice-templates';
import { SAMPLE_INVOICE, SAMPLE_QR_PLACEHOLDER, buildPreviewSettings } from '@/lib/invoice-sample-data';
import { Check } from 'lucide-react';

interface PreviewSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  upiId: string;
  upiName: string;
  companyLogo: string | null;
  showLogo: boolean;
}

interface InvoiceTemplatePickerProps {
  selectedTemplate: InvoiceTemplateId;
  onSelect: (id: InvoiceTemplateId) => void;
  customConfig: InvoiceTemplateCustomConfig;
  settings?: PreviewSettings | null;
  /** compact = thumbnail strip only; full = thumbnails + live preview panel */
  mode?: 'compact' | 'full';
}

function TemplateThumbnail({ templateId, accentColor }: { templateId: InvoiceTemplateId; accentColor?: string }) {
  const accent = accentColor || '#2563eb';

  if (templateId === 'modern') {
    return (
      <div className="w-full h-full bg-white rounded overflow-hidden flex flex-col">
        <div className="h-[28%] w-full" style={{ backgroundColor: accent }} />
        <div className="flex-1 p-2 space-y-1.5">
          <div className="flex justify-between gap-1">
            <div className="h-1.5 w-8 bg-slate-200 rounded" />
            <div className="h-1.5 w-6 bg-slate-200 rounded" />
          </div>
          <div className="h-1 w-full bg-slate-100 rounded" />
          <div className="h-1 w-4/5 bg-slate-100 rounded" />
          <div className="h-4 w-full rounded mt-1" style={{ backgroundColor: `${accent}20` }} />
        </div>
      </div>
    );
  }

  if (templateId === 'minimal') {
    return (
      <div className="w-full h-full bg-white rounded p-2 flex flex-col">
        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-1.5 mb-2">
          <div className="h-1.5 w-8 bg-slate-300 rounded" />
          <div className="h-1 w-6 bg-slate-200 rounded" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="h-1 w-full bg-slate-100 rounded" />
          <div className="h-1 w-3/4 bg-slate-100 rounded" />
          <div className="h-1 w-full bg-slate-100 rounded mt-2" />
        </div>
      </div>
    );
  }

  if (templateId === 'professional') {
    return (
      <div className="w-full h-full bg-white rounded overflow-hidden flex flex-col">
        <div className="h-[32%] bg-slate-900 px-2 py-1.5 flex justify-between items-center">
          <div className="h-1.5 w-7 bg-slate-600 rounded" />
          <div className="h-1 w-5 bg-slate-600 rounded" />
        </div>
        <div className="flex-1 p-2 grid grid-cols-3 gap-1">
          <div className="h-1 w-full bg-slate-100 rounded" />
          <div className="h-1 w-full bg-slate-100 rounded" />
          <div className="h-1 w-full bg-slate-100 rounded" />
          <div className="col-span-3 h-3 bg-slate-800 rounded-sm mt-1" />
        </div>
      </div>
    );
  }

  if (templateId === 'custom') {
    return (
      <div
        className="w-full h-full bg-white rounded border-2 border-dashed p-2 flex flex-col"
        style={{ borderColor: `${accent}60` }}
      >
        <div className="h-1 w-3 rounded-full mb-2" style={{ backgroundColor: accent }} />
        <div className="flex gap-1 mb-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: accent }} />
          <div className="flex-1 space-y-1">
            <div className="h-1 w-full bg-slate-100 rounded" />
            <div className="h-1 w-2/3 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="flex-1 border rounded" style={{ borderColor: `${accent}30` }} />
      </div>
    );
  }

  // classic
  return (
    <div className="w-full h-full bg-white rounded overflow-hidden flex flex-col relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
      <div className="flex-1 p-2 pt-2.5 space-y-1.5">
        <div className="flex justify-between">
          <div className="h-1.5 w-7 rounded" style={{ backgroundColor: accent }} />
          <div className="h-1 w-6 bg-slate-200 rounded" />
        </div>
        <div className="h-1 w-full bg-slate-100 rounded" />
        <div className="h-1 w-4/5 bg-slate-100 rounded" />
        <div className="h-3 w-full bg-blue-50 rounded border border-blue-100 mt-1" />
      </div>
    </div>
  );
}

export default function InvoiceTemplatePicker({
  selectedTemplate,
  onSelect,
  customConfig,
  settings,
  mode = 'full',
}: InvoiceTemplatePickerProps) {
  const previewSettings = buildPreviewSettings(settings);
  const previewCustom = selectedTemplate === 'custom' ? customConfig : undefined;

  return (
    <div className="space-y-4">
      <div className={`grid gap-3 ${mode === 'compact' ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
        {INVOICE_TEMPLATE_PRESETS.map((preset) => {
          const selected = selectedTemplate === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              className={`relative text-left rounded-xl border-2 p-2.5 transition-all cursor-pointer group ${
                selected
                  ? 'border-blue-600 bg-blue-50/40 shadow-md shadow-blue-100'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              {selected && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center z-10">
                  <Check className="w-3 h-3" />
                </span>
              )}
              <div className="h-20 mb-2 rounded-lg border border-slate-100 overflow-hidden">
                <TemplateThumbnail
                  templateId={preset.id}
                  accentColor={preset.id === 'custom' ? customConfig.primaryColor : undefined}
                />
              </div>
              <p className="text-xs font-bold text-slate-800">{preset.label}</p>
              {mode === 'full' && (
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{preset.description}</p>
              )}
            </button>
          );
        })}
      </div>

      {mode === 'full' && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
          <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700">Live Preview</p>
            <span className="text-[10px] text-slate-400 font-medium">Sample invoice data</span>
          </div>
          <div className="relative overflow-auto max-h-[520px] bg-slate-100/50 p-4">
            <div className="mx-auto max-w-3xl bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="origin-top scale-[0.72] sm:scale-[0.82] w-[138%] sm:w-[122%] -mb-[18%] sm:-mb-[12%]">
                <div className="p-8 pointer-events-none select-none">
                  <InvoiceTemplateRenderer
                    invoice={SAMPLE_INVOICE}
                    settings={previewSettings}
                    qrCodeUrl={SAMPLE_QR_PLACEHOLDER}
                    templateId={selectedTemplate}
                    customConfig={previewCustom}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
