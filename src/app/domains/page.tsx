'use client';

import { useState, useEffect } from 'react';
import { getDomains, createDomainAction, updateDomainAction, deleteDomainAction } from './actions';
import { getProjects } from '@/app/projects/actions';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '@/components/ConfirmModal';
import {
  Globe,
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
  Sparkles,
  Zap,
  ZapOff,
  ChevronDown
} from 'lucide-react';

interface DomainType {
  id: string;
  domainName: string;
  projectId: string;
  registrar: string;
  purchaseDate: string | Date;
  expiryDate: string | Date;
  renewalAmount: number;
  autoRenew: boolean;
  status: string; // ACTIVE, EXPIRED, RENEWED
  notes: string | null;
  project: {
    projectName: string;
    client: {
      companyName: string;
    };
  };
}

interface ProjectOptionType {
  id: string;
  projectName: string;
  client: {
    companyName: string;
  };
}

export default function DomainsPage() {
  const { showToast } = useToast();
  const [domains, setDomains] = useState<DomainType[]>([]);
  const [projects, setProjects] = useState<ProjectOptionType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Delete confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainType | null>(null);

  // Form helpers
  const [formError, setFormError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);

  const loadData = async (query = '') => {
    setLoading(true);
    const [domainData, projectData] = await Promise.all([
      getDomains(query),
      getProjects()
    ]);
    setDomains(domainData as unknown as DomainType[]);
    setProjects(projectData as unknown as ProjectOptionType[]);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setActionPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await createDomainAction(formData);

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
    if (!selectedDomain) return;
    setFormError(null);
    setActionPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateDomainAction(selectedDomain.id, formData);

    setActionPending(false);
    if (result.error) {
      setFormError(result.error);
    } else {
      setIsEditOpen(false);
      setSelectedDomain(null);
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
    const result = await deleteDomainAction(deleteTargetId);
    setDeletePending(false);
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Domain tracker deleted successfully!', 'success');
      loadData(searchQuery);
    }
  };

  const getExpiryDetails = (expiryDateVal: string | Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateVal);
    expiry.setHours(0, 0, 0, 0);

    const msDiff = expiry.getTime() - today.getTime();
    const daysLeft = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        daysLeft,
        text: 'Expired',
        badgeClass: 'bg-red-100 text-red-900 border-red-200',
        rowHighlight: 'bg-red-50/15',
      };
    } else if (daysLeft < 7) {
      return {
        daysLeft,
        text: `${daysLeft} days left`,
        badgeClass: 'bg-red-50 text-red-700 border-red-100 font-bold',
        rowHighlight: 'bg-red-50/10',
      };
    } else if (daysLeft < 30) {
      return {
        daysLeft,
        text: `${daysLeft} days left`,
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
        rowHighlight: '',
      };
    } else {
      return {
        daysLeft,
        text: `${daysLeft} days left`,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        rowHighlight: '',
      };
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
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Domains Tracking</h1>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {domains.length} Tracked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Track registrar, auto-renewal configurations, and expirations.</p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add Domain</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search by domain, registrar, or project..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full appearance-none pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
        />
      </div>

      {/* Expiry Warning Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-slate-600">Active (&gt;30 days)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold text-slate-600">Expires soon (&lt;30 days)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
          <span className="text-xs font-semibold text-slate-600">Urgent (&lt;7 days)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-red-950" />
          <span className="text-xs font-semibold text-slate-600">Expired</span>
        </div>
      </div>

      {/* Domains List Table */}
      <div className="bg-transparent lg:bg-white lg:rounded-2xl lg:border lg:border-slate-100 lg:shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <span className="text-xs font-semibold text-slate-400">Loading domains...</span>
          </div>
        ) : domains.length > 0 ? (
          <>
            {/* Mobile/Tablet View Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {domains.map((domain) => {
                const expiry = getExpiryDetails(domain.expiryDate);
                return (
                  <div key={domain.id} className={`bg-white rounded-xl border border-slate-200/60 p-4 shadow-xs space-y-4 hover:bg-slate-50/20 hover:shadow-md transition-all ${expiry.rowHighlight}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 text-sm block truncate flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {domain.domainName}
                        </span>
                        <span className="text-xs text-slate-400 font-medium block truncate max-w-[200px] mt-0.5">
                          Registrar: {domain.registrar}
                        </span>
                      </div>
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${expiry.badgeClass}`}>
                        {expiry.text}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="block font-semibold text-slate-700 leading-tight truncate">{domain.project.projectName}</span>
                          <span className="text-[10px] text-slate-400 font-medium truncate">{domain.project.client.companyName}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Expiry: {new Date(domain.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <span className="font-bold text-slate-800">
                          ₹{domain.renewalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2.5 border-t border-slate-150 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Auto-Renewal</span>
                        {domain.autoRenew ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                            <Zap className="w-2.5 h-2.5" />
                            <span>AUTO ON</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                            <ZapOff className="w-2.5 h-2.5" />
                            <span>AUTO OFF</span>
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1.5 w-full">
                        <button
                          onClick={() => {
                            setSelectedDomain(domain);
                            setIsViewOpen(true);
                          }}
                          className="w-full px-1 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDomain(domain);
                            setFormError(null);
                            setIsEditOpen(true);
                          }}
                          className="w-full px-1 py-1.5 text-xs font-bold text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(domain.id)}
                          className="w-full px-1 py-1.5 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Domain Name</th>
                    <th className="px-6 py-4">Project / Client</th>
                    <th className="px-6 py-4">Registrar</th>
                    <th className="px-6 py-4">Expiry Date</th>
                    <th className="px-6 py-4">Days Left</th>
                    <th className="px-6 py-4">Renewal Cost</th>
                    <th className="px-6 py-4 text-center">Auto-Renew</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                  {domains.map((domain) => {
                    const expiry = getExpiryDetails(domain.expiryDate);
                    return (
                      <tr key={domain.id} className={`hover:bg-slate-50/50 transition-colors group ${expiry.rowHighlight}`}>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            {domain.domainName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-slate-600 font-medium">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <div>
                              <span className="block font-semibold text-slate-700 leading-tight">{domain.project.projectName}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{domain.project.client.companyName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-500 font-medium text-xs">{domain.registrar}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-500 font-medium text-xs">
                            {new Date(domain.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${expiry.badgeClass}`}>
                            {expiry.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          ₹{domain.renewalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {domain.autoRenew ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                              <Zap className="w-3 h-3" />
                              <span>ON</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                              <ZapOff className="w-3 h-3" />
                              <span>OFF</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedDomain(domain);
                                setIsViewOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                              title="View Domain Info"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDomain(domain);
                                setFormError(null);
                                setIsEditOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                              title="Edit Domain"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(domain.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                              title="Delete Domain"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-24 text-center max-w-sm mx-auto flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-3">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700">No domains found</span>
            <p className="text-xs text-slate-400 mt-1">Try tracking a new domain linked to a project workspace.</p>
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Add Domain Tracker</h3>
            <p className="text-xs text-slate-400 mb-5">Configure purchase details and expiration alerts.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Domain Name</label>
                <input
                  type="text"
                  name="domainName"
                  required
                  placeholder="example.com"
                  className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Project Link</label>
                  {projects.length > 0 ? (
                    <div className="relative w-full">
                      <select
                        name="projectId"
                        required
                        className="w-full appearance-none pr-10 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                      >
                        <option value="" disabled selected>Select project...</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.projectName} ({p.client.companyName})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-50 text-[10px] text-amber-600 font-semibold border border-amber-100">
                      Add a project first.
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Registrar</label>
                  <input
                    type="text"
                    name="registrar"
                    required
                    placeholder="GoDaddy / Namecheap"
                    className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    required
                    className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    required
                    className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Renewal Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="renewalAmount"
                    required
                    placeholder="1200"
                    className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Status</label>
                  <div className="relative w-full">
                    <select
                      name="status"
                      required
                      defaultValue="ACTIVE"
                      className="w-full appearance-none pr-10 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="EXPIRED">EXPIRED</option>
                      <option value="RENEWED">RENEWED</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                <input
                  type="checkbox"
                  id="autoRenew"
                  name="autoRenew"
                  value="true"
                  className="w-4.5 h-4.5 rounded border-slate-200 text-blue-600 focus:ring-blue-500/20"
                />
                <label htmlFor="autoRenew" className="text-xs font-bold text-slate-600 cursor-pointer">
                  Auto-Renewal Enabled (Auto Charge configured)
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Additional Notes (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Purchased on promo discount"
                  className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={actionPending || projects.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-75 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{actionPending ? 'Saving...' : 'Save Tracker'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Domain Modal */}
      {isEditOpen && selectedDomain && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsEditOpen(false);
                setSelectedDomain(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Edit Domain Tracker</h3>
            <p className="text-xs text-slate-400 mb-5">Update renewal dates and registrar details.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Domain Name</label>
                <input
                  type="text"
                  name="domainName"
                  required
                  defaultValue={selectedDomain.domainName}
                  className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Project Link</label>
                  <div className="relative w-full">
                    <select
                      name="projectId"
                      required
                      defaultValue={selectedDomain.projectId}
                      className="w-full appearance-none pr-10 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.projectName} ({p.client.companyName})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Registrar</label>
                  <input
                    type="text"
                    name="registrar"
                    required
                    defaultValue={selectedDomain.registrar}
                    className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    required
                    defaultValue={formatDateStringForInput(selectedDomain.purchaseDate)}
                    className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    required
                    defaultValue={formatDateStringForInput(selectedDomain.expiryDate)}
                    className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Renewal Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="renewalAmount"
                    required
                    defaultValue={selectedDomain.renewalAmount}
                    className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Status</label>
                  <div className="relative w-full">
                    <select
                      name="status"
                      required
                      defaultValue={selectedDomain.status}
                      className="w-full appearance-none pr-10 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="EXPIRED">EXPIRED</option>
                      <option value="RENEWED">RENEWED</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                <input
                  type="checkbox"
                  id="autoRenew"
                  name="autoRenew"
                  value="true"
                  defaultChecked={selectedDomain.autoRenew}
                  className="w-4.5 h-4.5 rounded border-slate-200 text-blue-600 focus:ring-blue-500/20"
                />
                <label htmlFor="autoRenew" className="text-xs font-bold text-slate-600 cursor-pointer">
                  Auto-Renewal Enabled (Auto Charge configured)
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Additional Notes (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  defaultValue={selectedDomain.notes || ''}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedDomain(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={actionPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-75 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{actionPending ? 'Saving...' : 'Update Tracker'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Domain Details Modal */}
      {isViewOpen && selectedDomain && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsViewOpen(false);
                setSelectedDomain(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">{selectedDomain.domainName}</h3>
                <span className="text-xs text-slate-400 font-semibold">Project: {selectedDomain.project.projectName}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-600">
              <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Registrar</span>
                  <span className="text-slate-800 text-sm font-semibold">{selectedDomain.registrar}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Status</span>
                  <span className="text-slate-800 text-sm font-semibold block">{selectedDomain.status}</span>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Purchase Date</span>
                  <span className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(selectedDomain.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Expiry Date</span>
                  <span className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {new Date(selectedDomain.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Renewal Amount</span>
                  <span className="text-slate-800 text-base font-black">
                    ₹{selectedDomain.renewalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Auto-Renewal Settings</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg border mt-1 ${
                    selectedDomain.autoRenew ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    {selectedDomain.autoRenew ? <Zap className="w-3 h-3" /> : <ZapOff className="w-3 h-3" />}
                    <span>{selectedDomain.autoRenew ? 'Auto-Charge Enabled' : 'Manual Renewal'}</span>
                  </span>
                </div>
              </div>

              {selectedDomain.notes && (
                <div className="border-t border-slate-50 pt-3">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Internal Notes</span>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-600 text-xs italic font-medium leading-relaxed">
                    "{selectedDomain.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  setSelectedDomain(null);
                }}
                className="px-4 py-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close Details</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Domain Tracker"
        message="Are you sure you want to delete this domain tracker? All associated alert reminders for this domain will also be deleted."
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
