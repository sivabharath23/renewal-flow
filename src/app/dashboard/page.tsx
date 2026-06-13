import db from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';
import { getUserFilter } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of renewal operations, monthly revenue, pending invoices, and expiring assets.',
};
import {
  Users,
  Briefcase,
  Globe,
  Server,
  FileText,
  AlertTriangle,
  Receipt,
  IndianRupee,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Plus
} from 'lucide-react';

export const revalidate = 0; // Disable static caching for real-time dashboard data

export default async function DashboardPage() {
  const filter = await getUserFilter();
  if (!filter) {
    redirect('/login');
  }

  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  // Fetch Stats and Data in Parallel
  const [
    totalClients,
    totalProjects,
    activeDomains,
    expiringDomains,
    expiringDomainsCount,
    totalServers,
    expiringServers,
    expiringServersCount,
    expiringAmcContracts,
    expiringAmcCount,
    pendingInvoices,
    pendingInvoicesCount,
    paidInvoicesThisMonth,
    chartData
  ] = await Promise.all([
    db.client.count({ where: filter }),
    db.project.count({ where: filter }),
    db.domain.count({ where: { status: 'ACTIVE', ...filter } }),
    db.domain.findMany({
      where: {
        ...filter,
        expiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      include: { project: { include: { client: true } } },
      take: 5,
      orderBy: { expiryDate: 'asc' },
    }),
    db.domain.count({
      where: {
        ...filter,
        expiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
    }),
    db.server.count({ where: filter }),
    db.server.findMany({
      where: {
        ...filter,
        expiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      include: { project: { include: { client: true } } },
      take: 5,
      orderBy: { expiryDate: 'asc' },
    }),
    db.server.count({
      where: {
        ...filter,
        expiryDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
    }),
    db.aMCContract.findMany({
      where: {
        ...filter,
        endDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      include: { project: { include: { client: true } } },
      take: 5,
      orderBy: { endDate: 'asc' },
    }),
    db.aMCContract.count({
      where: {
        ...filter,
        endDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
    }),
    db.invoice.findMany({
      where: { status: 'PENDING', ...filter },
      include: { client: true },
      take: 5,
      orderBy: { dueDate: 'asc' },
    }),
    db.invoice.count({
      where: { status: 'PENDING', ...filter },
    }),
    db.invoice.findMany({
      where: {
        ...filter,
        status: 'PAID',
        updatedAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
      select: { amount: true },
    }),
    // Fetch monthly revenue data for the chart (last 6 months in parallel)
    Promise.all(
      Array.from({ length: 6 }, (_, index) => {
        const i = 5 - index;
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString('default', { month: 'short' });
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

        return db.invoice
          .findMany({
            where: {
              ...filter,
              status: 'PAID',
              updatedAt: {
                gte: start,
                lte: end,
              },
            },
            select: { amount: true },
          })
          .then((paidInMonth) => {
            const amount = paidInMonth.reduce((acc, inv) => acc + inv.amount, 0);
            return { label, amount };
          });
      })
    ),
  ]);

  const revenueThisMonth = paidInvoicesThisMonth.reduce((acc, inv) => acc + inv.amount, 0);

  const maxAmount = Math.max(...chartData.map((d) => d.amount), 5000);

  const stats = [
    { name: 'Total Clients', value: totalClients, icon: Users, color: 'text-blue-600 bg-blue-50', link: '/clients' },
    { name: 'Total Projects', value: totalProjects, icon: Briefcase, color: 'text-indigo-600 bg-indigo-50', link: '/projects' },
    { name: 'Active Domains', value: activeDomains, icon: Globe, color: 'text-emerald-600 bg-emerald-50', link: '/domains' },
    { name: 'Domains Expiring', value: expiringDomainsCount, icon: AlertTriangle, color: expiringDomainsCount > 0 ? 'text-amber-600 bg-amber-50' : 'text-slate-400 bg-slate-50', link: '/domains' },
    { name: 'Total Hosting Servers', value: totalServers, icon: Server, color: 'text-cyan-600 bg-cyan-50', link: '/servers' },
    { name: 'Servers Expiring', value: expiringServersCount, icon: AlertTriangle, color: expiringServersCount > 0 ? 'text-amber-600 bg-amber-50' : 'text-slate-400 bg-slate-50', link: '/servers' },
    { name: 'AMC Expiring', value: expiringAmcCount, icon: FileText, color: expiringAmcCount > 0 ? 'text-amber-600 bg-amber-50' : 'text-slate-400 bg-slate-50', link: '/amc' },
    { name: 'Pending Invoices', value: pendingInvoicesCount, icon: Receipt, color: pendingInvoicesCount > 0 ? 'text-rose-600 bg-rose-50' : 'text-slate-400 bg-slate-50', link: '/invoices' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-blue-100/50">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Overview Dashboard</h2>
          <p className="text-blue-100/90 text-sm mt-1.5 font-medium max-w-xl">
            Welcome back! Here is a summary of your clients, ongoing projects, and contracts due for renewal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-sm font-semibold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Manage Invoices</span>
          </Link>
          <Link
            href="/clients"
            className="px-4 py-2.5 bg-white text-blue-600 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Client</span>
          </Link>
        </div>
      </div>

      {/* Highlights Financial Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md shadow-slate-100/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Revenue This Month
            </span>
            <span className="text-3xl font-black text-slate-800 tracking-tight">
              ₹{revenueThisMonth.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50/70 border border-emerald-100 px-3 py-1.5 rounded-xl">
          <TrendingUp className="w-4 h-4" />
          <span>Real-time earnings tracker</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.link}
              className="bg-white rounded-2xl border border-slate-100 p-3.5 md:p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col gap-3 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-tight block">
                  {stat.name}
                </span>
                <span className="text-2xl font-black text-slate-800 mt-0.5 block leading-none">
                  {stat.value}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts & Mini Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800">Monthly Revenue Trend</h3>
            <p className="text-xs text-slate-400 mt-0.5">Earnings from cleared invoices over the past 6 months</p>
          </div>
          
          {/* Custom SVG Line Chart */}
          <div className="flex-1 w-full min-h-[200px] relative flex flex-col justify-end">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="199" x2="500" y2="199" stroke="#cbd5e1" strokeWidth="1" />

              {/* Draw bars or line */}
              {chartData.map((d, index) => {
                const x = 50 + index * 80;
                // Invert y because SVG y goes down
                const height = (d.amount / maxAmount) * 150;
                const y = 180 - height;
                return (
                  <g key={d.label}>
                    {/* Hover highlights bar */}
                    <rect
                      x={x - 20}
                      y="10"
                      width="40"
                      height="180"
                      fill="transparent"
                      className="hover:fill-slate-50/50 transition-colors cursor-pointer group"
                    />
                    {/* Bar */}
                    <rect
                      x={x - 12}
                      y={y}
                      width="24"
                      height={height}
                      rx="6"
                      fill="#2563eb"
                      className="transition-all hover:fill-indigo-600"
                    />
                    {/* Tooltip amount label */}
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-700"
                    >
                      {d.amount > 0 ? `₹${d.amount}` : ''}
                    </text>
                    {/* Month Label */}
                    <text
                      x={x}
                      y="215"
                      textAnchor="middle"
                      className="text-xs font-semibold fill-slate-400"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right 1 Column: Pending Invoices */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Pending Invoices</h3>
                <p className="text-xs text-slate-400 mt-0.5">Awaiting verification or client payment</p>
              </div>
              <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-1 rounded-lg">
                {pendingInvoicesCount} Pending
              </span>
            </div>
            
            <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
              {pendingInvoices.length > 0 ? (
                pendingInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block truncate max-w-[150px]">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block truncate max-w-[150px]">
                        {inv.client.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-800 block">
                        ₹{inv.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-rose-500 font-bold block flex items-center justify-end gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        Due {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-2">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">All invoices settled!</span>
                </div>
              )}
            </div>
          </div>
          <Link
            href="/invoices"
            className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-all mt-4 block cursor-pointer"
          >
            View All Invoices
          </Link>
        </div>
      </div>

      {/* Upcoming Renewals Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Domains */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-800">Domain Renewals</h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Due &lt;30 days</span>
            </div>
            
            <div className="space-y-3">
              {expiringDomains.length > 0 ? (
                expiringDomains.map((dom) => {
                  const daysLeft = Math.ceil((new Date(dom.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const badgeColor = daysLeft < 7 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600';
                  return (
                    <div key={dom.id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block truncate max-w-[130px]">{dom.domainName}</span>
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">{dom.project.projectName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800 block">₹{dom.renewalAmount}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg inline-block mt-0.5 ${badgeColor}`}>
                          {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400">No domains expiring soon</span>
                </div>
              )}
            </div>
          </div>
          <Link
            href="/domains"
            className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-500 transition-all mt-4 block cursor-pointer"
          >
            Track Domains
          </Link>
        </div>

        {/* Hosting Servers */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-800">Hosting Renewals</h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Due &lt;30 days</span>
            </div>
            
            <div className="space-y-3">
              {expiringServers.length > 0 ? (
                expiringServers.map((srv) => {
                  const daysLeft = Math.ceil((new Date(srv.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const badgeColor = daysLeft < 7 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600';
                  return (
                    <div key={srv.id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block truncate max-w-[130px]">{srv.provider} ({srv.planName})</span>
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">{srv.project.projectName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800 block">₹{srv.amount}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg inline-block mt-0.5 ${badgeColor}`}>
                          {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400">No servers expiring soon</span>
                </div>
              )}
            </div>
          </div>
          <Link
            href="/servers"
            className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-500 transition-all mt-4 block cursor-pointer"
          >
            Track Servers
          </Link>
        </div>

        {/* AMC Contracts */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-800">AMC Expirations</h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Due &lt;30 days</span>
            </div>
            
            <div className="space-y-3">
              {expiringAmcContracts.length > 0 ? (
                expiringAmcContracts.map((amc) => {
                  const daysLeft = Math.ceil((new Date(amc.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const badgeColor = daysLeft < 7 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600';
                  return (
                    <div key={amc.id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block truncate max-w-[130px]">{amc.project.client.companyName}</span>
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">{amc.project.projectName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800 block">₹{amc.amount}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg inline-block mt-0.5 ${badgeColor}`}>
                          {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400">No AMC contracts expiring soon</span>
                </div>
              )}
            </div>
          </div>
          <Link
            href="/amc"
            className="w-full text-center py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-500 transition-all mt-4 block cursor-pointer"
          >
            Track AMC
          </Link>
        </div>
      </div>
    </div>
  );
}
