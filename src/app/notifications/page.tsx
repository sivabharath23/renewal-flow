'use client';

import { useState, useEffect } from 'react';
import { getReminders, deleteReminderAction } from './actions';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '@/components/ConfirmModal';
import InvoicePreloader from '@/components/InvoicePreloader';
import {
  Bell,
  Trash2,
  Globe,
  Server,
  FileText,
  Receipt,
  Calendar,
  Mail,
  Search,
  ShieldCheck,
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface ReminderType {
  id: string;
  referenceType: string; // DOMAIN, SERVER, AMC, INVOICE
  referenceId: string;
  reminderDate: string | Date;
  notificationType: string;
  status: string; // SENT, FAILED
  createdAt: string | Date;
  userId: string | null;
  user: {
    name: string;
    email: string;
  } | null;
}

export default function NotificationsPage() {
  const [reminders, setReminders] = useState<ReminderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  
  // Custom Confirmation Modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    const data = await getReminders();
    setReminders(data as unknown as ReminderType[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeletePending(true);
    const result = await deleteReminderAction(deleteId);
    setDeletePending(false);
    setIsDeleteOpen(false);
    setDeleteId(null);
    
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Notification log deleted successfully!', 'success');
      loadData();
    }
  };

  const getReferenceTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'DOMAIN':
        return {
          icon: Globe,
          color: 'text-blue-600 bg-blue-50 border-blue-100',
        };
      case 'SERVER':
        return {
          icon: Server,
          color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        };
      case 'AMC':
        return {
          icon: FileText,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        };
      case 'INVOICE':
        return {
          icon: Receipt,
          color: 'text-rose-600 bg-rose-50 border-rose-100',
        };
      default:
        return {
          icon: Bell,
          color: 'text-slate-500 bg-slate-50 border-slate-100',
        };
    }
  };

  const filteredReminders = reminders.filter((r) => {
    if (typeFilter === 'ALL') return true;
    return r.referenceType === typeFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">System Reminders</h1>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {filteredReminders.length} Logs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Audit log of system alerts sent out dynamically before renewal dates.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2">
          {['ALL', 'DOMAIN', 'SERVER', 'AMC', 'INVOICE'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                typeFilter === type
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Registry */}
      <div className="bg-transparent lg:bg-white lg:rounded-2xl lg:border lg:border-slate-100 lg:shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12">
            <InvoicePreloader text="Loading notification logs..." />
          </div>
        ) : filteredReminders.length > 0 ? (
          <>
            {/* Mobile/Tablet View Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {filteredReminders.map((reminder) => {
                const config = getReferenceTypeIcon(reminder.referenceType);
                const Icon = config.icon;
                return (
                  <div key={reminder.id} className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-xs space-y-4 hover:bg-slate-50/20 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${config.color}`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            {reminder.referenceType} Reminder
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-300" />
                            {new Date(reminder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteClick(reminder.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-slate-150 shrink-0 cursor-pointer"
                        title="Dismiss notification log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-2.5 text-xs text-slate-500 font-medium pt-1">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Sent via {reminder.notificationType}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Status: 
                          <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${
                            reminder.status === 'SENT' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {reminder.status}
                          </span>
                        </span>
                      </div>
                      {reminder.user && (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block shrink-0">Tenant scope:</span>
                          <span className="text-[10px] text-slate-600 font-bold truncate">
                            {reminder.user.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Alert Type</th>
                    <th className="px-6 py-4">Delivery Method</th>
                    <th className="px-6 py-4">Associated Tenant</th>
                    <th className="px-6 py-4">Sent Timestamp</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm text-slate-700 font-medium">
                  {filteredReminders.map((reminder) => {
                    const config = getReferenceTypeIcon(reminder.referenceType);
                    const Icon = config.icon;
                    return (
                      <tr key={reminder.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center border shrink-0 ${config.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-800">
                              {reminder.referenceType}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-500 flex items-center gap-1.5 py-6">
                          <Mail className="w-4 h-4 text-slate-300" />
                          <span>Sent via {reminder.notificationType}</span>
                        </td>
                        <td className="px-6 py-4">
                          {reminder.user ? (
                            <div>
                              <span className="block font-semibold text-slate-700 leading-tight">{reminder.user.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{reminder.user.email}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">System / Global</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-semibold">
                          {new Date(reminder.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            reminder.status === 'SENT'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {reminder.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteClick(reminder.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Delete log entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
              <Bell className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700">No reminder logs found</span>
            <p className="text-xs text-slate-400 mt-1">Reminders will populate here once the cron triggers and emails are dispatched.</p>
          </div>
        )}
      </div>

      {/* Dismiss Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Notification Log"
        message="Are you sure you want to delete this notification log record? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
        isLoading={deletePending}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
