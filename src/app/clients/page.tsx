'use client';

import { useState, useEffect, startTransition } from 'react';
import { getClients, createClientAction, updateClientAction, deleteClientAction, checkIsAdmin } from './actions';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '@/components/ConfirmModal';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  AlertCircle
} from 'lucide-react';

interface ClientType {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  gstNo: string | null;
  notes: string | null;
  _count?: {
    projects: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    agencyType: string | null;
  } | null;
}

export default function ClientsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<ClientType[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);

  // Form error states
  const [formError, setFormError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);

  // Delete confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  // Load clients
  const loadClients = async (query = '') => {
    setLoading(true);
    const data = await getClients(query);
    const adminCheck = await checkIsAdmin();
    setIsAdmin(adminCheck);
    setClients(data as ClientType[]);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClients(searchQuery);
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Create Client
  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setActionPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await createClientAction(formData);

    setActionPending(false);
    if (result.error) {
      setFormError(result.error);
      showToast(result.error, 'error');
    } else {
      setIsAddOpen(false);
      showToast('Client added successfully!', 'success');
      loadClients(searchQuery);
    }
  };

  // Handle Edit Client
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClient) return;
    setFormError(null);
    setActionPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateClientAction(selectedClient.id, formData);

    setActionPending(false);
    if (result.error) {
      setFormError(result.error);
      showToast(result.error, 'error');
    } else {
      setIsEditOpen(false);
      setSelectedClient(null);
      showToast('Client details updated!', 'success');
      loadClients(searchQuery);
    }
  };

  // Handle Delete Client Click
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeletePending(true);
    const result = await deleteClientAction(deleteTargetId);
    setDeletePending(false);
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Client deleted successfully!', 'success');
      loadClients(searchQuery);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Clients Directory</h1>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {clients.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Manage and track your client profile and billing details.</p>
        </div>
        
        <button
          onClick={() => {
            setFormError(null);
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search by client name, company, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
        />
      </div>

      {/* Clients List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <span className="text-xs font-semibold text-slate-400">Loading clients...</span>
          </div>
        ) : clients.length > 0 ? (
          <>
            {/* Mobile View Card List */}
            <div className="block md:hidden divide-y divide-slate-100">
              {clients.map((client) => (
                <div key={client.id} className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 text-sm block truncate">{client.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-tight mt-0.5 truncate">
                        {client.companyName}
                      </span>
                      {client.gstNo && (
                        <span className="text-[9px] text-slate-400 font-semibold uppercase mt-1 block">
                          GST: {client.gstNo}
                        </span>
                      )}
                      {isAdmin && (
                        <span className="text-[9px] bg-slate-50 border border-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-semibold mt-1 inline-block">
                          Registered By: {client.user?.name || 'Admin'} ({client.user?.id || 'N/A'})
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-slate-50 border border-slate-150 text-[10px] font-bold text-slate-600 shrink-0">
                      {client._count?.projects || 0} Projects
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{client.phone}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setIsViewOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setFormError(null);
                        setIsEditOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(client.id)}
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
                    <th className="px-6 py-4">Client Name</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Contact Info</th>
                    {isAdmin && <th className="px-6 py-4">Registered By</th>}
                    <th className="px-6 py-4 text-center">Total Projects</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 block">{client.name}</span>
                        {client.gstNo && (
                          <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 block">GST: {client.gstNo}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{client.companyName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-slate-500 text-xs">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {client.email}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500 text-xs">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {client.phone}
                          </span>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{client.user?.name || 'Admin'}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{client.user?.id || 'N/A'}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600">
                          {client._count?.projects || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setIsViewOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                            title="View Client"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setFormError(null);
                              setIsEditOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                            title="Edit Client"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(client.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Delete Client"
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
              <Users className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700">No clients found</span>
            <p className="text-xs text-slate-400 mt-1">Try refining your search query or add a new client to get started.</p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Add New Client</h3>
            <p className="text-xs text-slate-400 mb-5">Fill in the company and point of contact details below.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Contact Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    placeholder="Acme Corp"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="billing@acme.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Billing Address</label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  placeholder="123 Corporate Ave, Mumbai, India"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">GST Number (Optional)</label>
                  <input
                    type="text"
                    name="gstNo"
                    placeholder="27AAAAA1111A1Z1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Internal Notes (Optional)</label>
                  <input
                    type="text"
                    name="notes"
                    placeholder="Client preferred UPI payment"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
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
                  disabled={actionPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-75 cursor-pointer"
                >
                  {actionPending ? 'Saving...' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditOpen && selectedClient && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsEditOpen(false);
                setSelectedClient(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Edit Client Details</h3>
            <p className="text-xs text-slate-400 mb-5">Update contact information and preferences for this client.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Contact Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={selectedClient.name}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    defaultValue={selectedClient.companyName}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={selectedClient.email}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    defaultValue={selectedClient.phone}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Billing Address</label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  defaultValue={selectedClient.address}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">GST Number (Optional)</label>
                  <input
                    type="text"
                    name="gstNo"
                    defaultValue={selectedClient.gstNo || ''}
                    placeholder="27AAAAA1111A1Z1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Internal Notes (Optional)</label>
                  <input
                    type="text"
                    name="notes"
                    defaultValue={selectedClient.notes || ''}
                    placeholder="Client preferred UPI payment"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedClient(null);
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
                  {actionPending ? 'Saving...' : 'Update Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {isViewOpen && selectedClient && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsViewOpen(false);
                setSelectedClient(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                {selectedClient.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">{selectedClient.name}</h3>
                <span className="text-xs text-slate-400 font-semibold">{selectedClient.companyName}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-600">
              <div className="border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Email Address</span>
                <span className="text-slate-800 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {selectedClient.email}
                </span>
              </div>

              <div className="border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Phone Number</span>
                <span className="text-slate-800 text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {selectedClient.phone}
                </span>
              </div>

              <div className="border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Billing Address</span>
                <span className="text-slate-800 text-sm flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedClient.address}</span>
                </span>
              </div>

              <div className="border-t border-slate-50 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">GST Registration</span>
                  <span className="text-slate-800 text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>{selectedClient.gstNo || 'Not Registered'}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Total Assigned Projects</span>
                  <span className="text-slate-800 text-sm font-bold block">
                    {selectedClient._count?.projects || 0} Projects
                  </span>
                </div>
              </div>

              {selectedClient.notes && (
                <div className="border-t border-slate-50 pt-3">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Internal Notes</span>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-600 text-xs italic font-medium leading-relaxed">
                    "{selectedClient.notes}"
                  </p>
                </div>
              )}

              {isAdmin && selectedClient.user && (
                <div className="border-t border-slate-50 pt-3">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Registered By Tenant</span>
                  <span className="text-slate-800 text-sm block font-semibold">
                    {selectedClient.user.name} ({selectedClient.user.id}) - {selectedClient.user.email}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  setSelectedClient(null);
                }}
                className="px-4 py-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Client"
        message="Are you sure you want to delete this client? All associated projects and invoices will be deleted."
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
