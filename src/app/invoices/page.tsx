'use client';

import { useState, useEffect } from 'react';
import { getInvoices, getCompanySettings, generateUPIQRCode, createInvoiceAction, updateInvoiceAction, deleteInvoiceAction } from './actions';
import { getClients } from '@/app/clients/actions';
import { getProjects } from '@/app/projects/actions';
import {
  Receipt,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Briefcase,
  Calendar,
  AlertCircle,
  Clock,
  Printer,
  QrCode,
  Building,
  Mail,
  Phone,
  Coins
} from 'lucide-react';

interface InvoiceType {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId: string;
  invoiceDate: string | Date;
  dueDate: string | Date;
  amount: number;
  description: string | null;
  status: string; // DRAFT, PENDING, PAID, CANCELLED
  pdfUrl: string | null;
  createdAt: Date;
  client: {
    name: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
    gstNo: string | null;
  };
  project: {
    projectName: string;
  };
}

interface ClientOptionType {
  id: string;
  name: string;
  companyName: string;
}

interface ProjectOptionType {
  id: string;
  projectName: string;
  clientId: string;
}

interface CompanySettingsType {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  upiId: string;
  upiName: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [clients, setClients] = useState<ClientOptionType[]>([]);
  const [projects, setProjects] = useState<ProjectOptionType[]>([]);
  const [settings, setSettings] = useState<CompanySettingsType | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceType | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Form helpers
  const [formError, setFormError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);

  const statusOptions = ['DRAFT', 'PENDING', 'PAID', 'CANCELLED'];

  const loadData = async (query = '') => {
    setLoading(true);
    const invData = await getInvoices(query);
    const clientData = await getClients();
    const projData = await getProjects();
    const settingsData = await getCompanySettings();
    
    setInvoices(invData as unknown as InvoiceType[]);
    setClients(clientData as ClientOptionType[]);
    setProjects(projData as unknown as ProjectOptionType[]);
    setSettings(settingsData as CompanySettingsType);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load QR code when viewing an invoice
  useEffect(() => {
    if (isViewOpen && selectedInvoice) {
      const loadQR = async () => {
        const res = await generateUPIQRCode(selectedInvoice.amount, selectedInvoice.invoiceNumber);
        if (res) {
          setQrCodeUrl(res.qrDataUrl);
        }
      };
      loadQR();
    } else {
      setQrCodeUrl(null);
    }
  }, [isViewOpen, selectedInvoice]);

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setActionPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await createInvoiceAction(formData);

    setActionPending(false);
    if (result.error) {
      setFormError(result.error);
    } else {
      setIsAddOpen(false);
      loadData(searchQuery);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setFormError(null);
    setActionPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateInvoiceAction(selectedInvoice.id, formData);

    setActionPending(false);
    if (result.error) {
      setFormError(result.error);
    } else {
      setIsEditOpen(false);
      setSelectedInvoice(null);
      loadData(searchQuery);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    const result = await deleteInvoiceAction(id);
    if (result.error) {
      alert(result.error);
    } else {
      loadData(searchQuery);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-50 text-green-700 border-green-150 font-bold';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-150 font-bold';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-150 font-bold';
      case 'DRAFT':
      default:
        return 'bg-slate-50 text-slate-500 border-slate-150 font-bold';
    }
  };

  const formatDateStringForInput = (dateVal: string | Date) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto no-print">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Billing & Invoices</h1>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {invoices.length} Invoiced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Generate invoices, download PDF copies, and review UPI payments.</p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search by invoice #, client, or project..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
        />
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <span className="text-xs font-semibold text-slate-400">Loading invoices...</span>
          </div>
        ) : invoices.length > 0 ? (
          <>
            {/* Mobile View Card List */}
            <div className="block md:hidden divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 text-sm block truncate flex items-center gap-1">
                        <Receipt className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {invoice.invoiceNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 truncate max-w-[200px]">
                        Project: {invoice.project.projectName}
                      </span>
                    </div>
                    <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadgeClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="block font-bold text-slate-800 leading-tight truncate">{invoice.client.companyName}</span>
                        <span className="text-[10px] text-slate-400 font-semibold truncate">{invoice.client.name}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <span className="font-bold text-slate-800">
                        ₹{invoice.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setIsViewOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setFormError(null);
                        setIsEditOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Client Company</th>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 block flex items-center gap-1">
                          <Receipt className="w-3.5 h-3.5 text-slate-400" />
                          {invoice.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <span className="block font-bold text-slate-800 leading-tight">{invoice.client.companyName}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{invoice.client.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {invoice.project.projectName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        ₹{invoice.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadgeClass(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsViewOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                            title="View Invoice Sheet"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setFormError(null);
                              setIsEditOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                            title="Edit Invoice"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-24 text-center max-w-sm mx-auto flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700">No invoices found</span>
            <p className="text-xs text-slate-400 mt-1">Try creating a billing invoice for ongoing project workspaces.</p>
          </div>
        )}
      </div>

      {/* Add Invoice Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Create Invoice</h3>
            <p className="text-xs text-slate-400 mb-5">Set billing dates, client info, and payment parameters.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  required
                  placeholder="INV-2026-001"
                  defaultValue={`INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Select Client</label>
                  {clients.length > 0 ? (
                    <select
                      name="clientId"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                    >
                      <option value="" disabled selected>Select client...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 bg-amber-50 text-[10px] text-amber-600 border border-amber-100 rounded-lg">
                      Add a client first.
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Select Project</label>
                  {projects.length > 0 ? (
                    <select
                      name="projectId"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                    >
                      <option value="" disabled selected>Select project...</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.projectName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 bg-amber-50 text-[10px] text-amber-600 border border-amber-100 rounded-lg">
                      Add a project first.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Invoice Date</label>
                  <input
                    type="date"
                    name="invoiceDate"
                    required
                    defaultValue={formatDateStringForInput(new Date())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    placeholder="1500"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue="PENDING"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Billing for domain mapping & support contracts..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionPending || clients.length === 0 || projects.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-75 cursor-pointer"
                >
                  {actionPending ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {isEditOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsEditOpen(false);
                setSelectedInvoice(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Edit Invoice</h3>
            <p className="text-xs text-slate-400 mb-5">Update billing records and collection status.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  required
                  defaultValue={selectedInvoice.invoiceNumber}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Select Client</label>
                  <select
                    name="clientId"
                    required
                    defaultValue={selectedInvoice.clientId}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Select Project</label>
                  <select
                    name="projectId"
                    required
                    defaultValue={selectedInvoice.projectId}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.projectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Invoice Date</label>
                  <input
                    type="date"
                    name="invoiceDate"
                    required
                    defaultValue={formatDateStringForInput(selectedInvoice.invoiceDate)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    defaultValue={formatDateStringForInput(selectedInvoice.dueDate)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    defaultValue={selectedInvoice.amount}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue={selectedInvoice.status}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={selectedInvoice.description || ''}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedInvoice(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-75 cursor-pointer"
                >
                  {actionPending ? 'Saving...' : 'Update Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Printable Invoice Modal (Full Sheet / UPI QR) */}
      {isViewOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white max-w-3xl w-full shadow-2xl p-6 sm:p-10 relative min-h-screen sm:min-h-0 sm:rounded-2xl flex flex-col justify-between animate-in fade-in slide-in-from-bottom-8 duration-200">
            {/* Top Close / Print bar (HIDDEN IN PRINT MODE) */}
            <div className="absolute top-4 right-4 flex items-center gap-2 no-print">
              <button
                onClick={triggerPrint}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer border border-slate-200 shadow-xs"
              >
                <Printer className="w-4.5 h-4.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  setSelectedInvoice(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Area starts */}
            <div className="flex-1 flex flex-col gap-8 text-slate-800 text-xs font-medium">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-6 mt-6 sm:mt-0">
                <div>
                  <h2 className="text-xl font-black text-blue-600 leading-tight">
                    {settings?.companyName || 'RenewalFlow Agency'}
                  </h2>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                    Tax Invoice / Bill
                  </span>
                  <div className="text-slate-500 font-semibold mt-2.5 space-y-0.5">
                    <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-300" /> {settings?.companyEmail}</p>
                    <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-300" /> {settings?.companyPhone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 text-sm font-black mb-2">
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="text-slate-500 font-semibold space-y-0.5 mt-1">
                    <p>Date: <strong className="text-slate-700">{new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></p>
                    <p>Due: <strong className="text-slate-700">{new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></p>
                  </div>
                </div>
              </div>

              {/* Client details / Project details info block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">
                    Billed To
                  </span>
                  <div className="space-y-1 text-slate-600 font-medium">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{selectedInvoice.client.companyName}</p>
                    <p className="text-xs font-semibold text-slate-700">{selectedInvoice.client.name}</p>
                    <p className="text-xs leading-relaxed max-w-[250px]">{selectedInvoice.client.address}</p>
                    <p className="text-[10px] font-semibold text-slate-400">{selectedInvoice.client.email} | {selectedInvoice.client.phone}</p>
                    {selectedInvoice.client.gstNo && (
                      <p className="text-[10px] font-bold text-slate-700 uppercase pt-1">GST: {selectedInvoice.client.gstNo}</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-2">
                    Project Work
                  </span>
                  <div className="space-y-1 font-semibold">
                    <p className="text-sm font-bold text-slate-800">{selectedInvoice.project.projectName}</p>
                    <p className="text-slate-500 font-medium mt-1 leading-relaxed">
                      {selectedInvoice.description || 'Deliverables, development and maintenance services as per contract terms.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table of charges */}
              <div className="border border-slate-100 rounded-xl overflow-hidden mt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-800 block">{selectedInvoice.project.projectName}</span>
                        <span className="text-xs text-slate-500 block mt-0.5">{selectedInvoice.description || 'Assigned contract deliverables'}</span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-slate-800 text-sm">
                        ₹{selectedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    {/* Totals row */}
                    <tr className="bg-slate-50/50">
                      <td className="px-5 py-3 text-right text-slate-500 font-bold uppercase text-[10px]">
                        Total Amount Due
                      </td>
                      <td className="px-5 py-3 text-right text-blue-600 font-black text-base">
                        ₹{selectedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* QR Code and Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 pt-6 mt-2">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                      <Coins className="w-4.5 h-4.5 text-blue-600" />
                      <span>Payment Instructions</span>
                    </h4>
                    <p className="text-slate-400 text-[10px] font-medium leading-relaxed mt-1">
                      Please scan the UPI QR code on the right with any UPI app (GPay, PhonePe, Paytm, BHIM) to pay instantly. Alternatively, pay using the details below.
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] space-y-1 font-semibold">
                    <p className="text-slate-500">UPI ID: <strong className="text-slate-800 font-bold">{settings?.upiId || 'sivabharath@upi'}</strong></p>
                    <p className="text-slate-500">Payee Name: <strong className="text-slate-800 font-bold">{settings?.upiName || 'Sivabharath'}</strong></p>
                    <p className="text-slate-500">Reference code: <strong className="text-slate-800 font-bold">{selectedInvoice.invoiceNumber}</strong></p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                  {qrCodeUrl ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={qrCodeUrl}
                        alt="UPI Payment QR"
                        className="w-40 h-40 border border-slate-200 rounded-lg p-1 bg-white"
                      />
                      <span className="text-[10px] font-bold text-slate-500 mt-2 flex items-center gap-1 uppercase tracking-wider">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>UPI QR Code</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-2" />
                      <span className="text-[10px] text-slate-400 font-bold">Creating QR...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer declaration */}
            <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-6 mt-8 font-semibold">
              Thank you for your business! If you have any questions, please contact hello@renewalflow.com.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
