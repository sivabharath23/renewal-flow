'use client';

import { useState, useEffect } from 'react';
import { getProjects, createProjectAction, updateProjectAction, deleteProjectAction } from './actions';
import { getClients } from '@/app/clients/actions';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '@/components/ConfirmModal';
import Pagination from '@/components/Pagination';
import InvoicePreloader from '@/components/InvoicePreloader';
import {
  Briefcase,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Building,
  Calendar,
  AlertCircle,
  FileText,
  Globe,
  Server as ServerIcon,
  FileCheck,
  ChevronDown
} from 'lucide-react';

interface ProjectType {
  id: string;
  projectName: string;
  clientId: string;
  description: string | null;
  status: string; // ACTIVE, INACTIVE, COMPLETED
  createdAt: Date;
  client: {
    name: string;
    companyName: string;
  };
  _count?: {
    domains: number;
    servers: number;
    amcContracts: number;
    invoices: number;
  };
}

interface ClientOptionType {
  id: string;
  name: string;
  companyName: string;
}

export default function ProjectsPage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [clients, setClients] = useState<ClientOptionType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const LIMIT = 10;

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);

  // Form helpers
  const [formError, setFormError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState(false);

  // Delete confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const loadData = async (query = '', page = 1) => {
    setLoading(true);
    const [projData, clientData] = await Promise.all([
      getProjects(query, page, LIMIT),
      getClients()
    ]);
    
    if (projData && 'data' in projData) {
      setProjects(projData.data as unknown as ProjectType[]);
      setTotalCount(projData.total);
      setTotalPages(projData.pages);
    } else {
      setProjects([]);
      setTotalCount(0);
      setTotalPages(0);
    }
    setClients(clientData as ClientOptionType[]);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(searchQuery, currentPage);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentPage]);

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setActionPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await createProjectAction(formData);

    setActionPending(false);
    if (result.error) {
      setFormError(result.error);
      showToast(result.error, 'error');
    } else {
      setIsAddOpen(false);
      showToast('Project created successfully!', 'success');
      setCurrentPage(1);
      loadData(searchQuery, 1);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    setFormError(null);
    setActionPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateProjectAction(selectedProject.id, formData);

    setActionPending(false);
    if (result.error) {
      setFormError(result.error);
      showToast(result.error, 'error');
    } else {
      setIsEditOpen(false);
      setSelectedProject(null);
      showToast('Project updated successfully!', 'success');
      loadData(searchQuery, currentPage);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeletePending(true);
    const result = await deleteProjectAction(deleteTargetId);
    setDeletePending(false);
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Project deleted successfully!', 'success');
      const nextPage = projects.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setCurrentPage(nextPage);
      loadData(searchQuery, nextPage);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'ACTIVE':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'INACTIVE':
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Projects Registry</h1>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Manage deliverables and contracts linked to your clients.</p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search by project name or client..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full appearance-none pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
        />
      </div>

      {/* Projects List Table */}
      <div className="bg-transparent lg:bg-white lg:rounded-2xl lg:border lg:border-slate-100 lg:shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12">
            <InvoicePreloader text="Loading projects..." />
          </div>
        ) : projects.length > 0 ? (
          <>
            {/* Mobile/Tablet View Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-xs space-y-4 hover:bg-slate-50/20 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 text-sm block truncate">{project.projectName}</span>
                      {project.description && (
                        <span className="text-xs text-slate-400 block mt-0.5 truncate max-w-[220px]">
                          {project.description}
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${getStatusBadgeClass(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="block font-semibold text-slate-700 leading-tight truncate">{project.client.companyName}</span>
                        <span className="text-[10px] text-slate-400 font-medium truncate">{project.client.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-150 w-full">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setIsViewOpen(true);
                      }}
                      className="w-full px-1 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setFormError(null);
                        setIsEditOpen(true);
                      }}
                      className="w-full px-1 py-1.5 text-xs font-bold text-slate-600 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(project.id)}
                      className="w-full px-1 py-1.5 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Project Name</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800 block">{project.projectName}</span>
                        {project.description && (
                          <span className="text-xs text-slate-400 truncate max-w-[200px] block mt-0.5 font-medium">{project.description}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <span className="block font-semibold text-slate-700 leading-tight">{project.client.companyName}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{project.client.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setIsViewOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setFormError(null);
                              setIsEditOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                            title="Edit Project"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(project.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Delete Project"
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              limit={LIMIT}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </>
        ) : (
          <div className="py-24 text-center max-w-sm mx-auto flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700">No projects found</span>
            <p className="text-xs text-slate-400 mt-1">Try adding a new project and associating it with a client profile.</p>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Create Project</h3>
            <p className="text-xs text-slate-400 mb-5">Create a project workspace and assign it to a client.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Project Name</label>
                <input
                  type="text"
                  name="projectName"
                  required
                  placeholder="E-Commerce Redesign"
                  className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Assign Client</label>
                {clients.length > 0 ? (
                  <div className="relative w-full">
                    <select
                      name="clientId"
                      required
                      className="w-full appearance-none pr-10 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                    >
                      <option value="" disabled selected>Select a client...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName} ({c.name})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-600">
                    No clients found. Please add a client first.
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Project Status</label>
                <div className="relative w-full">
                  <select
                    name="status"
                    required
                    defaultValue="ACTIVE"
                    className="w-full appearance-none pr-10 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Project Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Scope, hosting requirements, and custom notes..."
                  className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none font-medium"
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
                  disabled={actionPending || clients.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-75 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{actionPending ? 'Creating...' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditOpen && selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsEditOpen(false);
                setSelectedProject(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Edit Project Workspace</h3>
            <p className="text-xs text-slate-400 mb-5">Modify basic parameters and deliverables of this project.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Project Name</label>
                <input
                  type="text"
                  name="projectName"
                  required
                  defaultValue={selectedProject.projectName}
                  className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Assign Client</label>
                <div className="relative w-full">
                  <select
                    name="clientId"
                    required
                    defaultValue={selectedProject.clientId}
                    className="w-full appearance-none pr-10 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.name})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Project Status</label>
                <div className="relative w-full">
                  <select
                    name="status"
                    required
                    defaultValue={selectedProject.status}
                    className="w-full appearance-none pr-10 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Project Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={selectedProject.description || ''}
                  className="w-full appearance-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setSelectedProject(null);
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
                  <span>{actionPending ? 'Saving...' : 'Update Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Project Details Modal (History / Overview) */}
      {isViewOpen && selectedProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsViewOpen(false);
                setSelectedProject(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">{selectedProject.projectName}</h3>
                <span className="text-xs text-slate-400 font-semibold">Client: {selectedProject.client.companyName}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-600">
              <div className="border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Status</span>
                <span className={`inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
              </div>

              {selectedProject.description && (
                <div className="border-t border-slate-50 pt-3">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Description</span>
                  <p className="text-slate-700 text-xs leading-relaxed font-semibold">
                    {selectedProject.description}
                  </p>
                </div>
              )}

              <div className="border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-400 font-bold block mb-1.5">Connected Deliverables</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="text-slate-800 font-bold block leading-none">{selectedProject._count?.domains || 0}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Domains</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
                    <ServerIcon className="w-4 h-4 text-cyan-500" />
                    <div>
                      <span className="text-slate-800 font-bold block leading-none">{selectedProject._count?.servers || 0}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Servers</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-500" />
                    <div>
                      <span className="text-slate-800 font-bold block leading-none">{selectedProject._count?.amcContracts || 0}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">AMCs</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <div>
                      <span className="text-slate-800 font-bold block leading-none">{selectedProject._count?.invoices || 0}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Invoices</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">History</span>
                <span className="text-slate-500 text-xs block leading-tight font-medium">
                  Workspace created on {new Date(selectedProject.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  setSelectedProject(null);
                }}
                className="px-4 py-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close details</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated domains, servers, and invoices will be deleted."
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
