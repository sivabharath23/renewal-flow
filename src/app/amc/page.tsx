'use client';

import { useState, useEffect } from 'react';
import { getAMCs, createAMCAction, updateAMCAction, deleteAMCAction } from './actions';
import { getProjects } from '@/app/projects/actions';
import {
  FileText,
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
  RefreshCw,
  Building
} from 'lucide-react';

interface AMCType {
  id: string;
  projectId: string;
  startDate: string | Date;
  endDate: string | Date;
  amount: number;
  renewalCycle: string; // MONTHLY, QUARTERLY, YEARLY
  status: string; // ACTIVE, INACTIVE
  notes: string | null;
  project: {
    projectName: string;
    client: {
      name: string;
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

export default function AMCPage() {
  const [amcs, setAMCs] = useState<AMCType[]>([]);
  const [projects, setProjects] = useState<ProjectOptionType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAMC, setSelectedAMC] = useState<AMCType | null>(null);

  // Form helpers
  const [formError, setFormError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);

  const cycleOptions = ['MONTHLY', 'QUARTERLY', 'YEARLY'];

  const loadData = async (query = '') => {
    setLoading(true);
    const amcData = await getAMCs(query);
    const projectData = await getProjects();
    setAMCs(amcData as unknown as AMCType[]);
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
    const result = await createAMCAction(formData);

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
    if (!selectedAMC) return;
    setFormError(null);
    setActionPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateAMCAction(selectedAMC.id, formData);

    setActionPending(false);
    if (result.error) {
      setFormError(result.error);
    } else {
      setIsEditOpen(false);
      setSelectedAMC(null);
      loadData(searchQuery);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AMC contract tracker?')) return;
    const result = await deleteAMCAction(id);
    if (result.error) {
      alert(result.error);
    } else {
      loadData(searchQuery);
    }
  };

  const getExpiryDetails = (endDateVal: string | Date, status: string) => {
    if (status === 'INACTIVE') {
      return {
        daysLeft: 0,
        text: 'Suspended',
        badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
        rowHighlight: 'opacity-70',
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(endDateVal);
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

  const getCycleBadgeClass = (cycle: string) => {
    switch (cycle.toUpperCase()) {
      case 'YEARLY':
        return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'QUARTERLY':
        return 'bg-purple-50 text-purple-700 border-purple-150';
      case 'MONTHLY':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-150';
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
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">AMC Contracts</h1>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {amcs.length} Enrolled
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Manage Annual Maintenance Contracts, cycles, and payouts.</p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Create AMC</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search by client, project, or contract notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
        />
      </div>

      {/* AMC List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <span className="text-xs font-semibold text-slate-400">Loading AMC contracts...</span>
          </div>
        ) : amcs.length > 0 ? (
          <>
            {/* Mobile View Card List */}
            <div className="block md:hidden divide-y divide-slate-100">
              {amcs.map((amc) => {
                const expiry = getExpiryDetails(amc.endDate, amc.status);
                return (
                  <div key={amc.id} className={`p-5 space-y-4 hover:bg-slate-50/50 transition-colors ${expiry.rowHighlight}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="block font-bold text-slate-800 text-sm leading-tight truncate">{amc.project.client.companyName}</span>
                            <span className="text-[10px] text-slate-400 font-semibold truncate">{amc.project.client.name}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${expiry.badgeClass}`}>
                        {expiry.text}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5 text-xs text-slate-500 font-medium">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{amc.project.projectName}</span>
                      </span>

                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Cycle: <strong className="text-slate-700">{amc.renewalCycle}</strong></span>
                        </span>
                        <span className="font-bold text-slate-800">
                          ₹{amc.amount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-medium space-y-0.5 border-t border-slate-50/60 pt-2">
                        <p>Start: {new Date(amc.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p>End: {new Date(amc.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                      <button
                        onClick={() => {
                          setSelectedAMC(amc);
                          setIsViewOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAMC(amc);
                          setFormError(null);
                          setIsEditOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(amc.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Client / Company</th>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Start Date</th>
                    <th className="px-6 py-4">End Date</th>
                    <th className="px-6 py-4">Billing Cycle</th>
                    <th className="px-6 py-4">Days Left</th>
                    <th className="px-6 py-4">AMC Amount</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                  {amcs.map((amc) => {
                    const expiry = getExpiryDetails(amc.endDate, amc.status);
                    return (
                      <tr key={amc.id} className={`hover:bg-slate-50/50 transition-colors group ${expiry.rowHighlight}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <div>
                              <span className="block font-bold text-slate-800 leading-tight">{amc.project.client.companyName}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{amc.project.client.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            {amc.project.projectName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                          {new Date(amc.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                          {new Date(amc.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${getCycleBadgeClass(amc.renewalCycle)}`}>
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>{amc.renewalCycle}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${expiry.badgeClass}`}>
                            {expiry.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          ₹{amc.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedAMC(amc);
                                setIsViewOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                              title="View AMC Info"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAMC(amc);
                                setFormError(null);
                                setIsEditOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                              title="Edit AMC"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(amc.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                              title="Delete AMC"
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
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700">No AMC contracts found</span>
            <p className="text-xs text-slate-400 mt-1">Try tracking a new AMC contract associated with a project workspace.</p>
          </div>
        )}
      </div>

      {/* Add AMC Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Create AMC Contract</h3>
            <p className="text-xs text-slate-400 mb-5">Configure support cycle billing and contract values.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Project Workspace</label>
                {projects.length > 0 ? (
                  <select
                    name="projectId"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    <option value="" disabled selected>Select project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.projectName} ({p.client.companyName})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50 text-[10px] text-amber-600 font-semibold border border-amber-100">
                    Add a project first.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">AMC Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    placeholder="15000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue="ACTIVE"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Billing Cycle</label>
                <select
                  name="renewalCycle"
                  required
                  defaultValue="YEARLY"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                >
                  {cycleOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Additional Notes (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Includes 4 hours of monthly updates"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
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
                  disabled={actionPending || projects.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-75 cursor-pointer"
                >
                  {actionPending ? 'Creating...' : 'Create AMC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit AMC Modal */}
      {isEditOpen && selectedAMC && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsEditOpen(false);
                setSelectedAMC(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Edit AMC Contract</h3>
            <p className="text-xs text-slate-400 mb-5">Modify contract billing terms and active status.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Project Workspace</label>
                <select
                  name="projectId"
                  required
                  defaultValue={selectedAMC.projectId}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName} ({p.client.companyName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={formatDateStringForInput(selectedAMC.startDate)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    defaultValue={formatDateStringForInput(selectedAMC.endDate)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">AMC Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    defaultValue={selectedAMC.amount}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Status</label>
                  <select
                    name="status"
                    required
                    defaultValue={selectedAMC.status}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Billing Cycle</label>
                <select
                  name="renewalCycle"
                  required
                  defaultValue={selectedAMC.renewalCycle}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                >
                  {cycleOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Additional Notes (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  defaultValue={selectedAMC.notes || ''}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedAMC(null);
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
                  {actionPending ? 'Saving...' : 'Update AMC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View AMC Details Modal */}
      {isViewOpen && selectedAMC && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsViewOpen(false);
                setSelectedAMC(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">AMC Contract Details</h3>
                <span className="text-xs text-slate-400 font-semibold">Project: {selectedAMC.project.projectName}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-600">
              <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Client Name</span>
                  <span className="text-slate-800 text-sm font-semibold">{selectedAMC.project.client.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Company</span>
                  <span className="text-slate-800 text-sm font-semibold block">{selectedAMC.project.client.companyName}</span>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Contract Start Date</span>
                  <span className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(selectedAMC.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Contract Expiry Date</span>
                  <span className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {new Date(selectedAMC.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">AMC Value</span>
                  <span className="text-slate-800 text-base font-black">
                    ₹{selectedAMC.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Renewal Cycle</span>
                  <span className="text-slate-800 text-sm font-bold block">{selectedAMC.renewalCycle}</span>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Active Status</span>
                <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  selectedAMC.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                  {selectedAMC.status}
                </span>
              </div>

              {selectedAMC.notes && (
                <div className="border-t border-slate-50 pt-3">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Internal Notes</span>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-600 text-xs italic font-medium leading-relaxed">
                    "{selectedAMC.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  setSelectedAMC(null);
                }}
                className="px-4 py-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
