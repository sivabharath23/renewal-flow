'use client';

import { useState, useEffect } from 'react';
import { getServers, createServerAction, updateServerAction, deleteServerAction } from './actions';
import { getProjects } from '@/app/projects/actions';
import {
  Server,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Briefcase,
  Calendar,
  AlertCircle,
  Network,
  Cpu,
  Clock
} from 'lucide-react';

interface ServerType {
  id: string;
  provider: string; // Hostinger, AWS, DigitalOcean, Contabo, Vultr, Custom
  projectId: string;
  planName: string;
  ipAddress: string;
  purchaseDate: string | Date;
  expiryDate: string | Date;
  amount: number;
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

export default function ServersPage() {
  const [servers, setServers] = useState<ServerType[]>([]);
  const [projects, setProjects] = useState<ProjectOptionType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<ServerType | null>(null);

  // Form helpers
  const [formError, setFormError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);

  const providerOptions = ['Hostinger', 'AWS', 'DigitalOcean', 'Contabo', 'Vultr', 'Custom'];

  const loadData = async (query = '') => {
    setLoading(true);
    const serverData = await getServers(query);
    const projectData = await getProjects();
    setServers(serverData as unknown as ServerType[]);
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
    const result = await createServerAction(formData);

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
    if (!selectedServer) return;
    setFormError(null);
    setActionPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateServerAction(selectedServer.id, formData);

    setActionPending(false);
    if (result.error) {
      setFormError(result.error);
    } else {
      setIsEditOpen(false);
      setSelectedServer(null);
      loadData(searchQuery);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this server tracker?')) return;
    const result = await deleteServerAction(id);
    if (result.error) {
      alert(result.error);
    } else {
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

  const getProviderBadgeClass = (provider: string) => {
    switch (provider.toUpperCase()) {
      case 'AWS':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'DIGITALOCEAN':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'HOSTINGER':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'VULTR':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'CONTABO':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
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
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Hosting & Servers</h1>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {servers.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Track server infrastructure provider plans and renewal cycles.</p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add Hosting</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search by IP, provider, plan, or project..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
        />
      </div>

      {/* Servers List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <span className="text-xs font-semibold text-slate-400">Loading servers...</span>
          </div>
        ) : servers.length > 0 ? (
          <>
            {/* Mobile View Card List */}
            <div className="block md:hidden divide-y divide-slate-100">
              {servers.map((server) => {
                const expiry = getExpiryDetails(server.expiryDate);
                return (
                  <div key={server.id} className={`p-5 space-y-4 hover:bg-slate-50/50 transition-colors ${expiry.rowHighlight}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-lg border mb-1.5 ${getProviderBadgeClass(server.provider)}`}>
                          {server.provider}
                        </span>
                        <span className="font-bold text-slate-800 text-sm block truncate flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {server.planName}
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
                          <span className="block font-semibold text-slate-700 leading-tight truncate">{server.project.projectName}</span>
                          <span className="text-[10px] text-slate-400 font-medium truncate">{server.project.client.companyName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Network className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>IP: {server.ipAddress}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Expiry: {new Date(server.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <span className="font-bold text-slate-800">
                          ₹{server.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                      <button
                        onClick={() => {
                          setSelectedServer(server);
                          setIsViewOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedServer(server);
                          setFormError(null);
                          setIsEditOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(server.id)}
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
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Plan Details</th>
                    <th className="px-6 py-4">Project / Client</th>
                    <th className="px-6 py-4">IP Address</th>
                    <th className="px-6 py-4">Expiry Date</th>
                    <th className="px-6 py-4">Days Left</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                  {servers.map((server) => {
                    const expiry = getExpiryDetails(server.expiryDate);
                    return (
                      <tr key={server.id} className={`hover:bg-slate-50/50 transition-colors group ${expiry.rowHighlight}`}>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-lg border ${getProviderBadgeClass(server.provider)}`}>
                            {server.provider}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-slate-400" />
                            {server.planName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-slate-600 font-medium">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <div>
                              <span className="block font-semibold text-slate-700 leading-tight">{server.project.projectName}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{server.project.client.companyName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Network className="w-3.5 h-3.5 text-slate-300" />
                            {server.ipAddress}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                          {new Date(server.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${expiry.badgeClass}`}>
                            {expiry.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          ₹{server.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedServer(server);
                                setIsViewOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                              title="View Server Info"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedServer(server);
                                setFormError(null);
                                setIsEditOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                              title="Edit Server"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(server.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                              title="Delete Server"
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
              <Server className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700">No servers found</span>
            <p className="text-xs text-slate-400 mt-1">Try tracking a new hosting server plan linked to a project workspace.</p>
          </div>
        )}
      </div>

      {/* Add Server Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Add Hosting Server</h3>
            <p className="text-xs text-slate-400 mb-5">Configure provider, IP addresses, and billing cycles.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Hosting Provider</label>
                  <select
                    name="provider"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    {providerOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Project Link</label>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Plan Name</label>
                  <input
                    type="text"
                    name="planName"
                    required
                    placeholder="VPS 2 / Shared Premium"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">IP Address</label>
                  <input
                    type="text"
                    name="ipAddress"
                    required
                    placeholder="192.168.1.1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Cost / Renewal Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  required
                  placeholder="3500"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Additional Notes (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Uses Cloudflare DNS routing"
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
                  {actionPending ? 'Saving...' : 'Save Hosting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Server Modal */}
      {isEditOpen && selectedServer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsEditOpen(false);
                setSelectedServer(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Edit Hosting Server</h3>
            <p className="text-xs text-slate-400 mb-5">Modify hosting plan parameters and billing dates.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Hosting Provider</label>
                  <select
                    name="provider"
                    required
                    defaultValue={selectedServer.provider}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    {providerOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Project Link</label>
                  <select
                    name="projectId"
                    required
                    defaultValue={selectedServer.projectId}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.projectName} ({p.client.companyName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Plan Name</label>
                  <input
                    type="text"
                    name="planName"
                    required
                    defaultValue={selectedServer.planName}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">IP Address</label>
                  <input
                    type="text"
                    name="ipAddress"
                    required
                    defaultValue={selectedServer.ipAddress}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
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
                    defaultValue={formatDateStringForInput(selectedServer.purchaseDate)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    required
                    defaultValue={formatDateStringForInput(selectedServer.expiryDate)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Cost / Renewal Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  required
                  defaultValue={selectedServer.amount}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Additional Notes (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  defaultValue={selectedServer.notes || ''}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedServer(null);
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
                  {actionPending ? 'Saving...' : 'Update Hosting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Server Details Modal */}
      {isViewOpen && selectedServer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsViewOpen(false);
                setSelectedServer(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">{selectedServer.provider} Hosting</h3>
                <span className="text-xs text-slate-400 font-semibold">Project: {selectedServer.project.projectName}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-600">
              <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Hosting Plan</span>
                  <span className="text-slate-800 text-sm font-semibold">{selectedServer.planName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">IP Address</span>
                  <span className="text-slate-800 text-sm font-mono font-semibold">{selectedServer.ipAddress}</span>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Purchase Date</span>
                  <span className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(selectedServer.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Expiry Date</span>
                  <span className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {new Date(selectedServer.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Renewal Amount</span>
                <span className="text-slate-800 text-base font-black">
                  ₹{selectedServer.amount.toLocaleString('en-IN')}
                </span>
              </div>

              {selectedServer.notes && (
                <div className="border-t border-slate-50 pt-3">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Internal Notes</span>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-600 text-xs italic font-medium leading-relaxed">
                    "{selectedServer.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  setSelectedServer(null);
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
