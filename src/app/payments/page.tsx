'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPayments, submitPaymentProofAction, approvePaymentAction, rejectPaymentAction } from './actions';
import { getInvoices } from '@/app/invoices/actions';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '@/components/ConfirmModal';
import InvoicePreloader from '@/components/InvoicePreloader';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Clock,
  Briefcase,
  AlertCircle,
  Calendar,
  IndianRupee,
  FileText,
  UploadCloud,
  FileImage,
  ArrowRightLeft
} from 'lucide-react';

interface PaymentType {
  id: string;
  invoiceId: string;
  amount: number;
  paidDate: string | Date;
  transactionRef: string;
  proofImage: string | null;
  status: string; // PENDING, VERIFIED, REJECTED
  remarks: string | null;
  createdAt: Date;
  invoice: {
    invoiceNumber: string;
    amount: number;
    client: {
      name: string;
      companyName: string;
    };
    project: {
      projectName: string;
    };
  };
}

interface InvoiceOptionType {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  client: {
    companyName: string;
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<InvoiceOptionType[]>([]);
  const [activeTab, setActiveTab] = useState<'VERIFY' | 'SUBMIT'>('VERIFY');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Lightbox / Modals
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectPaymentId, setRejectPaymentId] = useState<string | null>(null);
  
  // Form states
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [actionPending, setActionPending] = useState(false);

  const { showToast } = useToast();
  // Approve confirm state
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [approveTargetId, setApproveTargetId] = useState<string | null>(null);
  const [approvePending, setApprovePending] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [payData, invData] = await Promise.all([
      getPayments(statusFilter),
      getInvoices()
    ]);
    
    setPayments(payData as unknown as PaymentType[]);
    
    // Filter only PENDING or DRAFT invoices for client to submit proof
    const filteredInvs = (invData as unknown as InvoiceOptionType[]).filter(
      (inv) => inv.status === 'PENDING' || inv.status === 'DRAFT'
    );
    setPendingInvoices(filteredInvs);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData, activeTab]);

  const handleProofSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    setActionPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitPaymentProofAction(formData);

    setActionPending(false);
    if (result.error) {
      setFormError(result.error);
    } else {
      setFormSuccess(true);
      e.currentTarget.reset();
      // Reload invoices
      const invData = await getInvoices();
      const filteredInvs = (invData as unknown as InvoiceOptionType[]).filter(
        (inv) => inv.status === 'PENDING' || inv.status === 'DRAFT'
      );
      setPendingInvoices(filteredInvs);
    }
  };

  const handleApproveClick = (id: string) => {
    setApproveTargetId(id);
    setApproveConfirmOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!approveTargetId) return;
    setApprovePending(true);
    const result = await approvePaymentAction(approveTargetId);
    setApprovePending(false);
    setApproveConfirmOpen(false);
    setApproveTargetId(null);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Payment verified and approved successfully!', 'success');
      loadData();
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rejectPaymentId) return;
    
    const formData = new FormData(e.currentTarget);
    const remarks = formData.get('rejectRemarks') as string;

    const result = await rejectPaymentAction(rejectPaymentId, remarks);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Payment proof rejected.', 'warning');
      setIsRejectOpen(false);
      setRejectPaymentId(null);
      loadData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100 font-bold';
      case 'REJECTED':
        return 'text-rose-700 bg-rose-50 border-rose-100 font-bold';
      case 'PENDING':
      default:
        return 'text-amber-700 bg-amber-50 border-amber-100 font-bold';
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Payments Verification</h1>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {payments.length} Transaction logs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Review bank screenshots, verify reference codes, and settle invoices.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('VERIFY')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'VERIFY' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Verify Proofs
          </button>
          <button
            onClick={() => setActiveTab('SUBMIT')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SUBMIT' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Upload Proof
          </button>
        </div>
      </div>

      {activeTab === 'VERIFY' ? (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-2 border-b border-slate-100 pb-3">
            {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* List of Payments */}
          <div className="grid grid-cols-1 gap-5">
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                <InvoicePreloader text="Fetching logs..." />
              </div>
            ) : payments.length > 0 ? (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:shadow-md transition-all"
                >
                  {/* Left Block: Client / Invoice detail */}
                  <div className="space-y-3.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Submitted {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <ArrowRightLeft className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-black text-slate-800 block truncate leading-tight">
                          ₹{payment.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 block mt-1 truncate">
                          Client: {payment.invoice.client.companyName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                          Invoice: {payment.invoice.invoiceNumber} | Project: {payment.invoice.project.projectName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Block: Transaction details */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-semibold text-slate-500 space-y-1.5 min-w-[220px]">
                    <p>Reference: <strong className="text-slate-800">{payment.transactionRef}</strong></p>
                    <p>Paid Date: <strong className="text-slate-800">{new Date(payment.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></p>
                    {payment.remarks && (
                      <p className="text-[10px] italic text-slate-400 border-t border-slate-200/60 pt-1.5 mt-1.5">
                        Note: "{payment.remarks}"
                      </p>
                    )}
                  </div>

                  {/* Right Block: Image Preview & Actions */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                    {payment.proofImage ? (
                      <button
                        onClick={() => {
                          setLightboxImage(payment.proofImage);
                          setIsLightboxOpen(true);
                        }}
                        className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
                      >
                        <img
                          src={payment.proofImage}
                          alt="Screenshot Proof"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Eye className="w-4 h-4" />
                        </div>
                      </button>
                    ) : (
                      <div className="w-14 h-14 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                        <FileImage className="w-5 h-5" />
                        <span className="text-[8px] font-bold">NO IMG</span>
                      </div>
                    )}

                    {payment.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveClick(payment.id)}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectPaymentId(payment.id);
                            setIsRejectOpen(true);
                          }}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 py-24 text-center max-w-sm mx-auto flex flex-col items-center justify-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-3">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-700">No logs found</span>
                <p className="text-xs text-slate-400 mt-1">There are no payment proofs submitted fitting the current filters.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Upload Proof Form */
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 max-w-lg mx-auto shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <span>Submit Payment Proof</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select your outstanding invoice, fill transaction details, and upload your payment screenshot.
            </p>
          </div>

          <form onSubmit={handleProofSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-600 flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>Payment proof uploaded successfully! Our admin will verify it shortly.</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Select Invoice</label>
              {pendingInvoices.length > 0 ? (
                <select
                  name="invoiceId"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                >
                  <option value="" disabled selected>Select outstanding invoice...</option>
                  {pendingInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - ₹{inv.amount.toLocaleString('en-IN')} ({inv.client.companyName})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-600">
                  No pending invoices found.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Paid Amount (₹)</label>
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
                <label className="text-xs font-bold text-slate-600 block">Paid Date</label>
                <input
                  type="date"
                  name="paidDate"
                  required
                  defaultValue={formatDateStringForInput(new Date())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Transaction Reference / UTR Number</label>
              <input
                type="text"
                name="transactionRef"
                required
                placeholder="TXN9876543210 / 12-digit UTR"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block">Upload Screenshot / Receipt</label>
              <input
                type="file"
                name="proofImageFile"
                accept="image/*"
                className="w-full text-xs font-medium text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Remarks / Notes (Optional)</label>
              <input
                type="text"
                name="remarks"
                placeholder="Transferred via IMPS / GPay"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={actionPending || pendingInvoices.length === 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {actionPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading Proof...</span>
                </>
              ) : (
                <span>Submit Verification Proof</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Screenshot Lightbox Modal */}
      {isLightboxOpen && lightboxImage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => {
                setIsLightboxOpen(false);
                setLightboxImage(null);
              }}
              className="absolute top-[-35px] right-0 p-1 text-white hover:text-slate-300 cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <X className="w-5 h-5" />
              <span>Close</span>
            </button>
            <img
              src={lightboxImage}
              alt="Screenshot Proof Fullscreen"
              className="max-w-full max-h-[80vh] object-contain rounded-xl border border-white/10 bg-slate-900 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Reject Payment Remarks Dialog */}
      {isRejectOpen && rejectPaymentId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-sm w-full shadow-2xl p-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsRejectOpen(false);
                setRejectPaymentId(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-800 mb-1">Reject Payment Proof</h3>
            <p className="text-xs text-slate-400 mb-4">Please specify why the payment is being rejected. This note will help the client correct details.</p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Remarks / Reason</label>
                <textarea
                  name="rejectRemarks"
                  required
                  rows={3}
                  placeholder="UTR reference not reflecting in bank statement / Screenshot is blurry."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none font-medium text-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsRejectOpen(false);
                    setRejectPaymentId(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-xs cursor-pointer"
                >
                  Reject Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={approveConfirmOpen}
        title="Approve Payment"
        message="Are you sure you want to verify and approve this payment proof? This will settle the parent invoice status as PAID."
        confirmText="Approve"
        isDanger={false}
        isLoading={approvePending}
        onConfirm={handleConfirmApprove}
        onCancel={() => {
          setApproveConfirmOpen(false);
          setApproveTargetId(null);
        }}
      />
    </div>
  );
}
