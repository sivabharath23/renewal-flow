'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getTenants, impersonateTenant, getActiveImpersonation } from '@/app/actions/impersonate';
import { useToast } from '@/context/ToastContext';
import { Users, Search, ChevronDown, Check, X, User } from 'lucide-react';

interface TenantType {
  id: string;
  name: string;
  email: string;
}

export default function TenantSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tenants, setTenants] = useState<TenantType[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const list = await getTenants();
      setTenants(list);
      const activeId = await getActiveImpersonation();
      setSelectedId(activeId);
      setLoading(false);
    }
    loadData();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (id: string | null) => {
    const result = await impersonateTenant(id);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      setSelectedId(id);
      setIsOpen(false);
      showToast(
        id 
          ? `Scoping context switched to tenant: ${tenants.find(t => t.id === id)?.name}` 
          : 'Scoping context reset to all tenants.', 
        'success'
      );
      router.refresh();
    }
  };

  const selectedTenant = tenants.find((t) => t.id === selectedId);

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left w-full sm:w-64" ref={dropdownRef}>
      <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider md:hidden">Scope Client Context</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 active:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <div className="flex items-center gap-2 truncate">
          <Users className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="truncate">
            {selectedTenant ? `${selectedTenant.name} (${selectedTenant.id})` : 'All Client Records'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-2 sm:mb-0 sm:mt-2 w-full sm:w-72 bg-white rounded-2xl border border-slate-150 shadow-2xl z-[150] p-3 animate-in fade-in slide-in-from-top-5 duration-150">
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="absolute inset-y-0 left-3 flex items-center pointer-events-none w-3.5 h-3.5 text-slate-400 my-auto" />
            <input
              type="text"
              placeholder="Search clients by name, ID or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-2 flex items-center p-1 text-slate-400 hover:text-slate-600 my-auto cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List items */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
            {/* Default Option: ALL */}
            <button
              onClick={() => handleSelect(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                !selectedId
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">All Client Records</span>
              </div>
              {!selectedId && <Check className="w-3.5 h-3.5" />}
            </button>

            {loading ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-1" />
                <span className="text-[10px] text-slate-400 font-semibold">Loading tenants...</span>
              </div>
            ) : filteredTenants.length > 0 ? (
              filteredTenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                    selectedId === t.id
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="truncate">
                      <span className="block font-bold text-slate-800 leading-tight truncate">{t.name}</span>
                      <span className="text-[9px] text-slate-400 font-semibold block truncate mt-0.5">{t.email} ({t.id})</span>
                    </div>
                  </div>
                  {selectedId === t.id && <Check className="w-3.5 h-3.5 shrink-0 text-blue-600" />}
                </button>
              ))
            ) : (
              <div className="py-6 text-center text-[10px] text-slate-400 font-bold">
                No matching clients found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
