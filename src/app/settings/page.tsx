'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSettingsAction } from './actions';
import {
  Settings,
  Building,
  CreditCard,
  Bell,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Coins,
  ShieldCheck,
  Save
} from 'lucide-react';

interface SettingsType {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  upiId: string;
  upiName: string;
  reminderDays: string;
  notificationEmail: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'COMPANY' | 'PAYMENT' | 'REMINDER'>('COMPANY');

  // Form states
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [actionPending, setActionPending] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getSettings();
    setSettings(data as SettingsType);
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

              {/* Hiddens to pass values of non-active forms */}
              <input type="hidden" name="companyName" defaultValue={settings.companyName} />
              <input type="hidden" name="companyEmail" defaultValue={settings.companyEmail} />
              <input type="hidden" name="companyPhone" defaultValue={settings.companyPhone} />
              <input type="hidden" name="upiId" defaultValue={settings.upiId} />
              <input type="hidden" name="upiName" defaultValue={settings.upiName} />
              <input type="hidden" name="reminderDays" defaultValue={settings.reminderDays} />
              <input type="hidden" name="notificationEmail" defaultValue={settings.notificationEmail} />

              {activeSection === 'COMPANY' && (
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-800">Company Profile</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Details display on PDF invoices and printable receipt headers.</p>
                  </div>

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
    </div>
  );
}
