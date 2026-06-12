'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getRevenueReport,
  getClientReport,
  getDomainReport,
  getServerReport,
  getAMCReport,
  getPendingPaymentsReport
} from './actions';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  Users,
  Globe,
  Server,
  FileSpreadsheet,
  AlertCircle,
  Clock
} from 'lucide-react';
import InvoicePreloader from '@/components/InvoicePreloader';

type ReportType = 'REVENUE' | 'CLIENT' | 'DOMAIN' | 'SERVER' | 'AMC' | 'PENDING';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('REVENUE');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(0); // Jan 1st of current year
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);

  const handleGenerateReport = useCallback(async () => {
    setLoading(true);
    let data: any[] = [];
    switch (reportType) {
      case 'REVENUE':
        data = await getRevenueReport(startDate, endDate);
        break;
      case 'CLIENT':
        data = await getClientReport();
        break;
      case 'DOMAIN':
        data = await getDomainReport(startDate, endDate);
        break;
      case 'SERVER':
        data = await getServerReport(startDate, endDate);
        break;
      case 'AMC':
        data = await getAMCReport(startDate, endDate);
        break;
      case 'PENDING':
        data = await getPendingPaymentsReport();
        break;
    }
    setReportData(data);
    setLoading(false);
  }, [reportType, startDate, endDate]);

  useEffect(() => {
    handleGenerateReport();
  }, [handleGenerateReport]);

  const handleExportCSV = () => {
    if (reportData.length === 0) return;

    let headers: string[] = [];
    let rows: any[][] = [];

    switch (reportType) {
      case 'REVENUE':
        headers = ['Invoice Number', 'Company Name', 'Project Name', 'Amount (INR)', 'Paid Date'];
        rows = reportData.map((d) => [
          d.invoiceNumber,
          d.companyName,
          d.projectName,
          d.amount,
          new Date(d.paidDate).toLocaleDateString(),
        ]);
        break;
      case 'CLIENT':
        headers = ['Client Name', 'Company Name', 'Email', 'Phone', 'Total Projects', 'Total Spent (INR)'];
        rows = reportData.map((d) => [
          d.clientName,
          d.companyName,
          d.email,
          d.phone,
          d.totalProjects,
          d.totalSpent,
        ]);
        break;
      case 'DOMAIN':
        headers = ['Domain Name', 'Company Name', 'Project Name', 'Registrar', 'Expiry Date', 'Renewal Cost (INR)', 'Status'];
        rows = reportData.map((d) => [
          d.domainName,
          d.companyName,
          d.projectName,
          d.registrar,
          new Date(d.expiryDate).toLocaleDateString(),
          d.renewalAmount,
          d.status,
        ]);
        break;
      case 'SERVER':
        headers = ['Provider', 'Plan Name', 'IP Address', 'Project Name', 'Company Name', 'Expiry Date', 'Renewal Cost (INR)'];
        rows = reportData.map((d) => [
          d.provider,
          d.planName,
          d.ipAddress,
          d.projectName,
          d.companyName,
          new Date(d.expiryDate).toLocaleDateString(),
          d.amount,
        ]);
        break;
      case 'AMC':
        headers = ['Project Name', 'Company Name', 'Start Date', 'End Date', 'Cycle', 'Amount (INR)', 'Status'];
        rows = reportData.map((d) => [
          d.projectName,
          d.companyName,
          new Date(d.startDate).toLocaleDateString(),
          new Date(d.endDate).toLocaleDateString(),
          d.renewalCycle,
          d.amount,
          d.status,
        ]);
        break;
      case 'PENDING':
        headers = ['Invoice Number', 'Company Name', 'Project Name', 'Due Date', 'Pending Amount (INR)'];
        rows = reportData.map((d) => [
          d.invoiceNumber,
          d.companyName,
          d.projectName,
          new Date(d.dueDate).toLocaleDateString(),
          d.amount,
        ]);
        break;
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((val) => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType.toLowerCase()}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSummaryStats = () => {
    if (reportData.length === 0) return null;

    switch (reportType) {
      case 'REVENUE': {
        const total = reportData.reduce((acc, curr) => acc + curr.amount, 0);
        return [
          { name: 'Total Revenue', value: `₹${total.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { name: 'Total Settlements', value: reportData.length, icon: FileSpreadsheet, color: 'text-blue-600 bg-blue-50' },
        ];
      }
      case 'CLIENT': {
        const totalSpent = reportData.reduce((acc, curr) => acc + curr.totalSpent, 0);
        return [
          { name: 'Total Clients', value: reportData.length, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
          { name: 'Cumulative Value', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
        ];
      }
      case 'DOMAIN': {
        const total = reportData.reduce((acc, curr) => acc + curr.renewalAmount, 0);
        return [
          { name: 'Domains in Scope', value: reportData.length, icon: Globe, color: 'text-blue-600 bg-blue-50' },
          { name: 'Total Renewal Cost', value: `₹${total.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
        ];
      }
      case 'SERVER': {
        const total = reportData.reduce((acc, curr) => acc + curr.amount, 0);
        return [
          { name: 'Servers in Scope', value: reportData.length, icon: Server, color: 'text-cyan-600 bg-cyan-50' },
          { name: 'Total Hosting Cost', value: `₹${total.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
        ];
      }
      case 'AMC': {
        const total = reportData.reduce((acc, curr) => acc + curr.amount, 0);
        return [
          { name: 'AMCs in Scope', value: reportData.length, icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-50' },
          { name: 'Total AMC Value', value: `₹${total.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
        ];
      }
      case 'PENDING': {
        const total = reportData.reduce((acc, curr) => acc + curr.amount, 0);
        return [
          { name: 'Pending Invoices', value: reportData.length, icon: Clock, color: 'text-rose-600 bg-rose-50' },
          { name: 'Total Outstanding', value: `₹${total.toLocaleString('en-IN')}`, icon: AlertCircle, color: 'text-rose-600 bg-rose-50' },
        ];
      }
      default:
        return null;
    }
  };

  const summary = getSummaryStats();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header (hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Reports & Exporters</h1>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              Analysis Console
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Review financial transactions, upcoming renewal liabilities, and export lists.</p>
        </div>

        {/* Action Controls */}
        {reportData.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Printable Title Header (only visible in print) */}
      <div className="hidden print-only border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">RenewalFlow - System Report</h2>
        <p className="text-xs text-slate-500 mt-1">
          Report type: {reportType} | Period: {startDate} to {endDate}
        </p>
      </div>

      {/* Control Grid Filters (hidden in print) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end no-print">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 block">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="REVENUE">Revenue Settlements</option>
            <option value="CLIENT">Client Spending Metrics</option>
            <option value="DOMAIN">Upcoming Domain Renewals</option>
            <option value="SERVER">Hosting Server Expirations</option>
            <option value="AMC">AMC Support Renewals</option>
            <option value="PENDING">Outstanding Invoices</option>
          </select>
        </div>

        {reportType !== 'CLIENT' && reportType !== 'PENDING' ? (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={handleGenerateReport}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Update Scope
            </button>
          </>
        ) : (
          <div className="md:col-span-3 text-right">
            <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-400 font-bold px-3 py-2 rounded-xl">
              This report query compiles overall database records.
            </span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 print-shadow-none">
          {summary.map((sum) => {
            const Icon = sum.icon;
            return (
              <div
                key={sum.name}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4 print-border-none"
              >
                <div className={`w-10 h-10 rounded-xl ${sum.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block leading-tight">{sum.name}</span>
                  <span className="text-xl font-black text-slate-800 mt-1 block leading-none">{sum.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Data Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden print-shadow-none">
        {loading ? (
          <div className="py-12">
            <InvoicePreloader text="Compiling dataset..." />
          </div>
        ) : reportData.length > 0 ? (
          <>
            {/* Mobile View Card List */}
            <div className="block md:hidden divide-y divide-slate-100">
              {reportData.map((d, index) => (
                <div key={index} className="p-5 space-y-3.5 hover:bg-slate-50/20 transition-colors text-xs font-semibold text-slate-700">
                  {reportType === 'REVENUE' && (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">{d.invoiceNumber}</span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{d.companyName}</span>
                        </div>
                        <span className="font-black text-slate-800 text-sm">₹{d.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Project: {d.projectName}</span>
                        <span className="text-[10px] font-medium text-slate-400">Paid: {new Date(d.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </>
                  )}
                  {reportType === 'CLIENT' && (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">{d.clientName}</span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{d.companyName}</span>
                        </div>
                        <span className="font-black text-emerald-600 text-sm">₹{d.totalSpent.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px]">{d.email}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-150 text-[10px] font-bold text-slate-600 shrink-0">{d.totalProjects} Projects</span>
                      </div>
                    </>
                  )}
                  {reportType === 'DOMAIN' && (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">{d.domainName}</span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{d.companyName}</span>
                        </div>
                        <span className="font-black text-slate-800 text-sm">₹{d.renewalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Registrar: {d.registrar}</span>
                        <span className="text-[10px] font-medium text-slate-400">Expires: {new Date(d.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </>
                  )}
                  {reportType === 'SERVER' && (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">{d.provider} ({d.planName})</span>
                          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{d.ipAddress}</span>
                        </div>
                        <span className="font-black text-slate-800 text-sm">₹{d.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-slate-500 truncate max-w-full">
                        <span>Project: {d.projectName}</span>
                      </div>
                    </>
                  )}
                  {reportType === 'AMC' && (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">{d.projectName}</span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{d.companyName}</span>
                        </div>
                        <span className="font-black text-slate-800 text-sm">₹{d.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-150 text-[10px] font-bold text-slate-600">{d.renewalCycle}</span>
                        <span className="text-[10px] font-medium text-slate-400">{new Date(d.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(d.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </>
                  )}
                  {reportType === 'PENDING' && (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-rose-600 text-sm block">{d.invoiceNumber}</span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{d.companyName}</span>
                        </div>
                        <span className="font-black text-rose-600 text-sm">₹{d.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Project: {d.projectName}</span>
                        <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">Due {new Date(d.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {reportType === 'REVENUE' && (
                      <>
                        <th className="px-6 py-4">Invoice #</th>
                        <th className="px-6 py-4">Company Name</th>
                        <th className="px-6 py-4">Project Workspace</th>
                        <th className="px-6 py-4">Settlement Date</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </>
                    )}
                    {reportType === 'CLIENT' && (
                      <>
                        <th className="px-6 py-4">Client Contact</th>
                        <th className="px-6 py-4">Company</th>
                        <th className="px-6 py-4">Email Address</th>
                        <th className="px-6 py-4 text-center">Projects</th>
                        <th className="px-6 py-4 text-right">Total Invoiced Paid</th>
                      </>
                    )}
                    {reportType === 'DOMAIN' && (
                      <>
                        <th className="px-6 py-4">Domain Name</th>
                        <th className="px-6 py-4">Company Name</th>
                        <th className="px-6 py-4">Registrar</th>
                        <th className="px-6 py-4">Expiry Date</th>
                        <th className="px-6 py-4 text-right">Renewal Cost</th>
                      </>
                    )}
                    {reportType === 'SERVER' && (
                      <>
                        <th className="px-6 py-4">Provider</th>
                        <th className="px-6 py-4">Plan Name</th>
                        <th className="px-6 py-4">IP Address</th>
                        <th className="px-6 py-4">Project</th>
                        <th className="px-6 py-4 text-right font-bold">Cost</th>
                      </>
                    )}
                    {reportType === 'AMC' && (
                      <>
                        <th className="px-6 py-4">Project Name</th>
                        <th className="px-6 py-4">Company Name</th>
                        <th className="px-6 py-4">Start / End Dates</th>
                        <th className="px-6 py-4">Billing Cycle</th>
                        <th className="px-6 py-4 text-right">AMC Amount</th>
                      </>
                    )}
                    {reportType === 'PENDING' && (
                      <>
                        <th className="px-6 py-4">Invoice Number</th>
                        <th className="px-6 py-4">Company Name</th>
                        <th className="px-6 py-4">Project Workspace</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4 text-right">Pending Amount</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs sm:text-sm text-slate-700 font-semibold">
                  {reportData.map((d, index) => (
                    <tr key={index} className="hover:bg-slate-50/20 transition-colors">
                      {reportType === 'REVENUE' && (
                        <>
                          <td className="px-6 py-4 font-bold text-slate-800">{d.invoiceNumber}</td>
                          <td className="px-6 py-4 text-slate-500">{d.companyName}</td>
                          <td className="px-6 py-4 text-slate-500">{d.projectName}</td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(d.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-800">
                            ₹{d.amount.toLocaleString('en-IN')}
                          </td>
                        </>
                      )}
                      {reportType === 'CLIENT' && (
                        <>
                          <td className="px-6 py-4 font-bold text-slate-800">{d.clientName}</td>
                          <td className="px-6 py-4 text-slate-500">{d.companyName}</td>
                          <td className="px-6 py-4 text-slate-400 font-mono">{d.email}</td>
                          <td className="px-6 py-4 text-center text-slate-600">{d.totalProjects}</td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600">
                            ₹{d.totalSpent.toLocaleString('en-IN')}
                          </td>
                        </>
                      )}
                      {reportType === 'DOMAIN' && (
                        <>
                          <td className="px-6 py-4 font-bold text-slate-800">{d.domainName}</td>
                          <td className="px-6 py-4 text-slate-500">{d.companyName}</td>
                          <td className="px-6 py-4 text-slate-500">{d.registrar}</td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(d.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-800">
                            ₹{d.renewalAmount.toLocaleString('en-IN')}
                          </td>
                        </>
                      )}
                      {reportType === 'SERVER' && (
                        <>
                          <td className="px-6 py-4 font-bold text-slate-800">{d.provider}</td>
                          <td className="px-6 py-4 text-slate-600">{d.planName}</td>
                          <td className="px-6 py-4 text-slate-500 font-mono">{d.ipAddress}</td>
                          <td className="px-6 py-4 text-slate-500">{d.projectName}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-800">
                            ₹{d.amount.toLocaleString('en-IN')}
                          </td>
                        </>
                      )}
                      {reportType === 'AMC' && (
                        <>
                          <td className="px-6 py-4 font-bold text-slate-800">{d.projectName}</td>
                          <td className="px-6 py-4 text-slate-500">{d.companyName}</td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(d.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(d.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-slate-500">{d.renewalCycle}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-800">
                            ₹{d.amount.toLocaleString('en-IN')}
                          </td>
                        </>
                      )}
                      {reportType === 'PENDING' && (
                        <>
                          <td className="px-6 py-4 font-bold text-rose-600">{d.invoiceNumber}</td>
                          <td className="px-6 py-4 text-slate-500">{d.companyName}</td>
                          <td className="px-6 py-4 text-slate-500">{d.projectName}</td>
                          <td className="px-6 py-4 text-slate-400">
                            {new Date(d.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-rose-600">
                            ₹{d.amount.toLocaleString('en-IN')}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-24 text-center max-w-sm mx-auto flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-3">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700">No records found</span>
            <p className="text-xs text-slate-400 mt-1">There is no matching data recorded for this selection scope.</p>
          </div>
        )}
      </div>
    </div>
  );
}
