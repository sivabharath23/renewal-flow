'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSettingsAction } from './actions';
import {
  Building,
  CreditCard,
  Bell,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Coins,
  Save,
  Upload,
  Trash2,
  FileText
} from 'lucide-react';
import {
  DEFAULT_CUSTOM_CONFIG,
  parseCustomConfig,
  serializeCustomConfig,
  InvoiceTemplateCustomConfig,
} from '@/lib/invoice-templates';
import ImageCropper from '@/components/ImageCropper';
import InvoiceTemplatePicker from '@/components/InvoiceTemplatePicker';
import { InvoiceTemplateId } from '@/lib/invoice-templates';

interface SettingsType {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  upiId: string;
  upiName: string;
  reminderDays: string;
  notificationEmail: string;
  companyLogo: string | null;
  showLogo: boolean;
  invoiceTemplate: string;
  invoiceTemplateCustom: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'COMPANY' | 'PAYMENT' | 'REMINDER' | 'INVOICE'>('COMPANY');
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplateId>('classic');
  const [customTemplate, setCustomTemplate] = useState<InvoiceTemplateCustomConfig>(DEFAULT_CUSTOM_CONFIG);

  // Form states
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [actionPending, setActionPending] = useState(false);

  // Logo uploading states
  const [logo, setLogo] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getSettings();
    setSettings(data as SettingsType);
    if (data?.companyLogo) {
      setLogo(data.companyLogo);
    }
    if (data) {
      setSelectedTemplate((data.invoiceTemplate || 'classic') as InvoiceTemplateId);
      setCustomTemplate(parseCustomConfig(data.invoiceTemplateCustom));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    setActionPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateSettingsAction(formData);

    setActionPending(false);
    if (result.error) {
      setFormError(result.error);
    } else {
      setFormSuccess(true);
      loadSettings();
      setTimeout(() => setFormSuccess(false), 3000); // clear success msg after 3s
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">System Settings</h1>
          <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
            Control Console
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Configure invoicing templates, payee details, and auto-notification targets.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-24 text-center shadow-sm">
          <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <span className="text-xs font-semibold text-slate-400">Loading configurations...</span>
        </div>
      ) : settings ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Navigation Sidebar Controls */}
          <div className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm space-y-1.5 font-semibold text-xs text-slate-500">
            <button
              onClick={() => setActiveSection('COMPANY')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                activeSection === 'COMPANY'
                  ? 'bg-blue-50 text-blue-600 border-l-3 border-blue-600 pl-2'
                  : 'hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Company Profile</span>
            </button>
            <button
              onClick={() => setActiveSection('PAYMENT')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                activeSection === 'PAYMENT'
                  ? 'bg-blue-50 text-blue-600 border-l-3 border-blue-600 pl-2'
                  : 'hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>UPI Payments</span>
            </button>
            <button
              onClick={() => setActiveSection('REMINDER')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                activeSection === 'REMINDER'
                  ? 'bg-blue-50 text-blue-600 border-l-3 border-blue-600 pl-2'
                  : 'hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Email Reminders</span>
            </button>
            <button
              onClick={() => setActiveSection('INVOICE')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                activeSection === 'INVOICE'
                  ? 'bg-blue-50 text-blue-600 border-l-3 border-blue-600 pl-2'
                  : 'hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Invoice Templates</span>
            </button>
          </div>

          {/* Form Settings Content */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-600 flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span>Configuration updated successfully!</span>
                </div>
              )}

              {/* Conditional hiddens to pass values of non-active forms, preventing name collision */}
              {activeSection !== 'COMPANY' && (
                <>
                  <input type="hidden" name="companyName" value={settings.companyName} />
                  <input type="hidden" name="companyEmail" value={settings.companyEmail} />
                  <input type="hidden" name="companyPhone" value={settings.companyPhone} />
                  {settings.showLogo && <input type="hidden" name="showLogo" value="on" />}
                </>
              )}
              {activeSection !== 'PAYMENT' && (
                <>
                  <input type="hidden" name="upiId" value={settings.upiId} />
                  <input type="hidden" name="upiName" value={settings.upiName} />
                </>
              )}
              {activeSection !== 'REMINDER' && (
                <>
                  <input type="hidden" name="reminderDays" value={settings.reminderDays} />
                  <input type="hidden" name="notificationEmail" value={settings.notificationEmail} />
                </>
              )}
              {activeSection !== 'INVOICE' && (
                <>
                  <input type="hidden" name="invoiceTemplate" value={settings.invoiceTemplate || 'classic'} />
                  <input type="hidden" name="invoiceTemplateCustom" value={settings.invoiceTemplateCustom || serializeCustomConfig(DEFAULT_CUSTOM_CONFIG)} />
                </>
              )}
              
              {/* Always submit the companyLogo */}
              <input type="hidden" name="companyLogo" value={logo || ''} />

              {activeSection === 'COMPANY' && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-800">Company Profile</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Details display on PDF invoices and printable receipt headers.</p>
                  </div>

                  {/* Logo Upload Section */}
                  <div className="space-y-2 pb-2">
                    <label className="text-xs font-bold text-slate-600 block">Company Logo</label>
                    <div className="flex items-center gap-4 flex-wrap">
                      {logo ? (
                        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white p-2 w-48 h-18 flex items-center justify-center shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={logo} alt="Company logo preview" className="max-h-full max-w-full object-contain" />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById('logo-file-input');
                                input?.click();
                              }}
                              className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-md transition-colors cursor-pointer"
                              title="Change Logo"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setLogo(null)}
                              className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer"
                              title="Delete Logo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('logo-file-input');
                            input?.click();
                          }}
                          className="w-48 h-18 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition-all cursor-pointer bg-slate-50 hover:bg-blue-50/20"
                        >
                          <Upload className="w-5 h-5 mb-0.5" />
                          <span className="text-[10px] font-bold">Upload Logo</span>
                        </button>
                      )}
                      <input
                        id="logo-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSelectedImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                            e.target.value = '';
                          }
                        }}
                      />
                      <div className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed">
                        Supports PNG or JPG. Select an image to crop and adjust its alignment to display perfectly in invoice headers.
                      </div>
                    </div>
                  </div>

                  {/* Show Logo Toggle Switch */}
                  {logo && (
                    <div className="flex items-center justify-between pb-3 pt-1 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Show Logo on Invoices</span>
                        <span className="text-[10px] text-slate-400 block">Disable to temporarily hide company branding from invoice PDFs.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          name="showLogo"
                          defaultChecked={settings.showLogo}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Company name</label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      key={`companyName-${settings.companyName}`} // force input reset on settings refresh
                      defaultValue={settings.companyName}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Billing Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          name="companyEmail"
                          required
                          key={`companyEmail-${settings.companyEmail}`}
                          defaultValue={settings.companyEmail}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 block">Billing Phone</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          name="companyPhone"
                          required
                          key={`companyPhone-${settings.companyPhone}`}
                          defaultValue={settings.companyPhone}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'PAYMENT' && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-800">UPI Payments</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Define payee details for dynamic UPI link and QR code generation.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">UPI Payee ID (VPA)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Coins className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="upiId"
                        required
                        key={`upiId-${settings.upiId}`}
                        defaultValue={settings.upiId}
                        placeholder="sivabharath@upi"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Payee Legal Name</label>
                    <input
                      type="text"
                      name="upiName"
                      required
                      key={`upiName-${settings.upiName}`}
                      defaultValue={settings.upiName}
                      placeholder="Sivabharath"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'INVOICE' && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-800">Invoice Templates</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Pick a printable invoice layout or build your own with custom colors and sections.</p>
                  </div>

                  <input type="hidden" name="invoiceTemplate" value={selectedTemplate} />
                  <input type="hidden" name="invoiceTemplateCustom" value={serializeCustomConfig(customTemplate)} />

                  <InvoiceTemplatePicker
                    selectedTemplate={selectedTemplate}
                    onSelect={setSelectedTemplate}
                    customConfig={customTemplate}
                    settings={{
                      companyName: settings.companyName,
                      companyEmail: settings.companyEmail,
                      companyPhone: settings.companyPhone,
                      upiId: settings.upiId,
                      upiName: settings.upiName,
                      companyLogo: logo,
                      showLogo: settings.showLogo,
                    }}
                    mode="full"
                  />

                  {selectedTemplate === 'custom' && (
                    <div className="space-y-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 block">Primary Color</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={customTemplate.primaryColor}
                              onChange={(e) => setCustomTemplate({ ...customTemplate, primaryColor: e.target.value })}
                              className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={customTemplate.primaryColor}
                              onChange={(e) => setCustomTemplate({ ...customTemplate, primaryColor: e.target.value })}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 block">Header Title</label>
                          <input
                            type="text"
                            value={customTemplate.headerTitle}
                            onChange={(e) => setCustomTemplate({ ...customTemplate, headerTitle: e.target.value })}
                            placeholder="INVOICE"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 block">Thank You Message</label>
                        <input
                          type="text"
                          value={customTemplate.thankYouMessage}
                          onChange={(e) => setCustomTemplate({ ...customTemplate, thankYouMessage: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 block">Footer Note</label>
                        <textarea
                          rows={2}
                          value={customTemplate.footerNote}
                          onChange={(e) => setCustomTemplate({ ...customTemplate, footerNote: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 block">Layout Style</label>
                        <select
                          value={customTemplate.layout}
                          onChange={(e) => setCustomTemplate({ ...customTemplate, layout: e.target.value as InvoiceTemplateCustomConfig['layout'] })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                        >
                          <option value="standard">Standard</option>
                          <option value="compact">Compact</option>
                          <option value="sidebar">Sidebar Accent</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {([
                          ['showQrCode', 'Show UPI QR Code'],
                          ['showPaymentInstructions', 'Show Payment Instructions'],
                          ['showStatus', 'Show Status Badge'],
                          ['showProjectDetails', 'Show Project Details'],
                        ] as const).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customTemplate[key]}
                              onChange={(e) => setCustomTemplate({ ...customTemplate, [key]: e.target.checked })}
                              className="rounded border-slate-300 text-blue-600"
                            />
                            <span className="font-semibold text-slate-600">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {activeSection === 'REMINDER' && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-800">Email Reminders</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Determine warning schedules and notification alert addresses.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Reminder Intervals (comma-separated days)</label>
                    <input
                      type="text"
                      name="reminderDays"
                      required
                      key={`reminderDays-${settings.reminderDays}`}
                      defaultValue={settings.reminderDays}
                      placeholder="30,15,7,3,1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700 font-mono"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Reminders are generated this many days before contract expiry.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Notification alert email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        name="notificationEmail"
                        required
                        key={`notificationEmail-${settings.notificationEmail}`}
                        defaultValue={settings.notificationEmail}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit panel */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={actionPending}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{actionPending ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedImage && (
        <ImageCropper
          imageUrl={selectedImage}
          onCancel={() => setSelectedImage(null)}
          onCrop={(croppedBase64) => {
            setLogo(croppedBase64);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
}
