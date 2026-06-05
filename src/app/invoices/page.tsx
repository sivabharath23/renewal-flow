'use client';

import { useState, useEffect } from 'react';
import { getInvoices, getCompanySettings, generateUPIQRCode, createInvoiceAction, updateInvoiceAction, deleteInvoiceAction } from './actions';
import { getClients } from '@/app/clients/actions';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '@/components/ConfirmModal';
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
  Coins,
  MessageSquare
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
  companyLogo: string | null;
  showLogo: boolean;
}

export default function InvoicesPage() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [clients, setClients] = useState<ClientOptionType[]>([]);
  const [projects, setProjects] = useState<ProjectOptionType[]>([]);
  const [settings, setSettings] = useState<CompanySettingsType | null>(null);
  
  // Delete confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  
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

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeletePending(true);
    const result = await deleteInvoiceAction(deleteTargetId);
    setDeletePending(false);
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Invoice deleted successfully!', 'success');
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

  const getWhatsAppShareUrl = () => {
    if (!selectedInvoice) return '#';
    
    // Clean phone number (digits only)
    let phoneClean = selectedInvoice.client.phone.replace(/\D/g, '');
    if (phoneClean.length === 10) {
      phoneClean = '91' + phoneClean; // Default to India country code if 10 digits
    }

    const formattedDate = new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const formattedDueDate = new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const formattedAmount = selectedInvoice.amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
    });

    const companyName = settings?.companyName || 'RenewalFlow Agency';
    const clientName = selectedInvoice.client.name;
    const invoiceNo = selectedInvoice.invoiceNumber;
    const projectName = selectedInvoice.project.projectName;
    const upiId = settings?.upiId || '9003793639@ptsbi';
    const upiName = settings?.upiName || 'Sivabharath';

    const onlineUrl = `${window.location.origin}/invoices`;
    const text = `Hello *${clientName}*,\n\nHere is your invoice *${invoiceNo}* for the project *${projectName}*.\n\n*Invoice Summary:*\n- *Invoice Date:* ${formattedDate}\n- *Due Date:* ${formattedDueDate}\n- *Amount Due:* ₹${formattedAmount}\n- *Status:* ${selectedInvoice.status}\n\n*Payment Details:*\n- *UPI ID:* ${upiId}\n- *Payee Name:* ${upiName}\n- *Reference Code:* ${invoiceNo}\n\nYou can view your invoice online or upload proof here: ${onlineUrl}\n\nPlease make the payment using the details above.\n\nThank you,\n*${companyName}*`;

    return `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
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
      <div className="relative max-w-md no-print">
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden no-print">
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
                      onClick={() => handleDeleteClick(invoice.id)}
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
                            onClick={() => handleDeleteClick(invoice.id)}
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-center items-start z-50 p-0 sm:p-4 overflow-y-auto print:bg-transparent print:p-0 print:static print:h-auto print:overflow-visible">
          <div className="bg-white max-w-3xl w-full shadow-2xl p-6 sm:p-10 relative min-h-screen sm:min-h-0 sm:my-8 sm:rounded-2xl flex flex-col justify-between animate-in fade-in slide-in-from-bottom-8 duration-200 print:shadow-none print:border-none print:p-6 print:my-0 print:rounded-none print:min-h-0 print:h-auto print:block print:justify-start">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl print:hidden" />

            {/* Top Close / Print bar (HIDDEN IN PRINT MODE) */}
            <div className="absolute top-6 right-6 flex items-center gap-2 no-print">
              <button
                onClick={triggerPrint}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer border border-slate-200 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              <a
                href={getWhatsAppShareUrl()}
                onClick={() => showToast("Opening WhatsApp. Print the invoice, then drag & drop the PDF into the chat!", "info")}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-250 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer border border-slate-200 shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span>Send via WhatsApp</span>
              </a>
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
            <div className="flex-1 flex flex-col gap-8 print:gap-4 text-slate-800 text-xs font-medium mt-10 print:mt-0">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-8 print:pb-4 mt-6 print:mt-2">
                {/* Left Column: Brand & Logo */}
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
                        {settings?.companyName}
                      </p>
                    </>
                  ) : (
                    <h2 className="text-2xl font-black tracking-tight text-blue-600 print:text-xl leading-none">
                      {settings?.companyName || 'RenewalFlow Agency'}
                    </h2>
                  )}
                  <div className="text-slate-500 font-semibold space-y-1 print:space-y-0.5">
                    <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0 print:w-3 print:h-3" /> {settings?.companyEmail}</p>
                    <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 print:w-3 print:h-3" /> {settings?.companyPhone}</p>
                  </div>
                </div>

                {/* Right Column: Invoice Details */}
                <div className="text-right flex flex-col items-end gap-4 print:gap-2">
                  <div>
                    <h1 className="text-3xl font-light tracking-widest text-slate-900 uppercase print:text-xl print:tracking-wider">INVOICE</h1>
                    <div className="inline-block mt-2 px-3 py-1 bg-blue-50/50 text-blue-600 rounded-lg border border-blue-100/50 text-xs font-bold print:mt-1 print:py-0.5 print:px-2 print:text-[10px]">
                      Invoice No: {selectedInvoice.invoiceNumber}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-right mt-1 print:gap-y-1 print:mt-0">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Date of Issue</p>
                      <p className="text-slate-700 font-bold mt-0.5 print:mt-0">
                        {new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Due Date</p>
                      <p className="text-slate-700 font-bold mt-0.5 print:mt-0">
                        {new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="col-span-2 flex justify-end items-center gap-2 mt-1 print:mt-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Status:</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        selectedInvoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        selectedInvoice.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        selectedInvoice.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {selectedInvoice.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client & Project grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 print:gap-4 border-b border-slate-100 pb-8 print:pb-4">
                {/* Billed To client info */}
                <div>
                  <h3 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2.5 print:mb-1">Billed To</h3>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 print:text-xs">{selectedInvoice.client.companyName}</p>
                    {selectedInvoice.client.name !== selectedInvoice.client.companyName && (
                      <p className="text-xs font-semibold text-slate-700">{selectedInvoice.client.name}</p>
                    )}
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] whitespace-pre-line">{selectedInvoice.client.address}</p>
                    <div className="pt-2 print:pt-1 text-[10px] text-slate-400 space-y-0.5">
                      <p>Email: <span className="text-slate-600 font-medium">{selectedInvoice.client.email}</span></p>
                      <p>Phone: <span className="text-slate-600 font-medium">{selectedInvoice.client.phone}</span></p>
                      {selectedInvoice.client.gstNo && (
                        <p className="font-bold text-slate-700 uppercase pt-1 print:pt-0.5">GSTIN: {selectedInvoice.client.gstNo}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project details */}
                <div>
                  <h3 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2.5 print:mb-1">Project Details</h3>
                  <div className="space-y-1.5 print:space-y-1">
                    <p className="text-sm font-bold text-slate-900 print:text-xs">{selectedInvoice.project.projectName}</p>
                    <div className="p-3 print:p-2 bg-slate-50/50 rounded-xl border border-slate-100/50 print:bg-transparent print:border-none print:p-0">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedInvoice.description || 'Deliverables, development and maintenance services as per contract terms.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table of charges */}
              <div className="mt-2 print:mt-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                      <th className="py-3 print:py-1.5 pr-4 w-12 text-center">#</th>
                      <th className="py-3 print:py-1.5 px-4">Item & Description</th>
                      <th className="py-3 print:py-1.5 text-center w-20">Qty</th>
                      <th className="py-3 print:py-1.5 text-right w-32">Rate</th>
                      <th className="py-3 print:py-1.5 pl-4 text-right w-36">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 print:py-2 pr-4 font-semibold text-slate-400 text-center">1</td>
                      <td className="py-4 print:py-2 px-4">
                        <span className="font-bold text-slate-900 text-sm print:text-xs block">{selectedInvoice.project.projectName}</span>
                        <span className="text-xs text-slate-500 block mt-1 leading-relaxed print:mt-0.5">
                          {selectedInvoice.description || 'Assigned contract deliverables'}
                        </span>
                      </td>
                      <td className="py-4 print:py-2 px-4 text-center text-slate-600">1</td>
                      <td className="py-4 print:py-2 px-4 text-right text-slate-600">
                        ₹{selectedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 print:py-2 pl-4 text-right font-bold text-slate-900 text-sm print:text-xs">
                        ₹{selectedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    
                    {/* Summary rows */}
                    <tr>
                      <td colSpan={3} className="py-4 print:py-1"></td>
                      <td className="py-4 print:py-1.5 px-4 text-right text-slate-500 font-medium uppercase text-[9px] border-b border-slate-100">
                        Subtotal
                      </td>
                      <td className="py-4 print:py-1.5 pl-4 text-right text-slate-900 font-semibold text-sm print:text-xs border-b border-slate-100">
                        ₹{selectedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/30 print:bg-transparent">
                      <td colSpan={3} className="py-4 print:py-1"></td>
                      <td className="py-4 print:py-1.5 px-4 text-right text-slate-900 font-bold uppercase text-[9px]">
                        Total Due
                      </td>
                      <td className="py-4 print:py-1.5 pl-4 text-right text-blue-600 font-black text-lg print:text-base">
                        ₹{selectedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Box & UPI QR */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 print:gap-4 border border-slate-100 rounded-2xl p-5 print:p-3 bg-slate-50/30 mt-6 print:mt-2 print:bg-transparent print:border-slate-200/60 print:rounded-xl">
                <div className="md:col-span-3 space-y-4 print:space-y-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 print:text-[11px]">
                      <Coins className="w-4 h-4 text-blue-600 print:w-3.5 print:h-3.5" />
                      <span>Payment Instructions</span>
                    </h4>
                    <p className="text-slate-500 text-[10px] leading-relaxed mt-1 print:text-[9px] print:leading-snug">
                      Please scan the UPI QR code on the right with any UPI-enabled application (Google Pay, PhonePe, Paytm, BHIM) to make an instant, secure transfer. Alternatively, you can use the UPI handle details below.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 print:gap-1 text-[10px] text-slate-600 print:text-[9px]">
                    <div className="flex justify-between py-1.5 print:py-0.5 border-b border-slate-100 print:border-slate-250/20">
                      <span className="text-slate-400 font-semibold">UPI VPA ID</span>
                      <strong className="text-slate-800 font-bold">{settings?.upiId || '9003793639@ptsbi'}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 print:py-0.5 border-b border-slate-100 print:border-slate-250/20">
                      <span className="text-slate-400 font-semibold">Payee Name</span>
                      <strong className="text-slate-800 font-bold">{settings?.upiName || 'Sivabharath'}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 print:py-0.5 border-b border-slate-100 print:border-slate-250/20">
                      <span className="text-slate-400 font-semibold">Reference Code</span>
                      <strong className="text-slate-800 font-bold">{selectedInvoice.invoiceNumber}</strong>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col items-center justify-center border border-slate-150 rounded-xl p-4 bg-white shadow-xs print:shadow-none print:border-none print:p-0 print:bg-transparent">
                  {qrCodeUrl ? (
                    <div className="flex flex-col items-center">
                      <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg print:p-0.5 print:border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrCodeUrl}
                          alt="UPI Payment QR"
                          className="w-32 h-32 print:w-22 print:h-22 object-contain"
                        />
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
              </div>
            </div>
            
            {/* Footer declaration */}
            <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-8 print:pt-3 mt-12 print:mt-4 font-medium print:text-[9px]">
              <p className="text-slate-700 font-bold text-xs mb-1 print:text-[10px] print:mb-0">Thank you for your business!</p>
              <p>This is a computer-generated invoice and does not require a physical signature.</p>
              <p className="mt-1 print:mt-0.5">For support or queries regarding this bill, please contact <strong className="text-slate-600 font-semibold">{settings?.companyEmail || 'hello@renewalflow.com'}</strong>.</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? All associated payment logs will be removed."
        confirmText="Delete"
        isDanger={true}
        isLoading={deletePending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
