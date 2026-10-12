import React from 'react';
import {
  FileText,
  FileCheck,
  Users,
  BriefcaseBusiness,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MainDashboard: React.FC = () => {
  const {
    user,
    invoices,
    quotations,
    customers,
    applications,
    resumes,
    setActivePage,
    openBillingModal,
  } = useApp();

  // REAL CALCULATED METRICS ONLY - ZERO FABRICATION
  const totalInvoicesCount = invoices.length;
  const totalBilledAmount = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
  const totalPaidAmount = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
  const totalOutstandingAmount = invoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);

  const pendingInvoicesCount = invoices.filter((inv) => inv.status === 'pending' || inv.status === 'overdue').length;
  const activeApplicationsCount = applications.filter((app) => app.status !== 'rejected').length;
  const interviewsScheduledCount = applications.filter((app) => app.status === 'interview').length;

  const recentInvoices = invoices.slice(0, 4);
  const recentApplications = applications.slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name || 'Aarav'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.businessProfile?.companyName || 'Business Suite'} · All metrics computed from your live database records.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActivePage('business-content')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Copy</span>
          </button>
          <button
            onClick={() => setActivePage('invoices')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Business Assistant Real Stat Strip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Business Assistant · Live Financial Overview
          </h2>
          <span className="text-xs text-slate-400 font-mono">Currency: INR (₹)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Billed */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
              <span>Total Invoiced</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              ₹{totalBilledAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Across {totalInvoicesCount} total invoices
            </div>
          </div>

          {/* Paid Collections */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
              <span>Collected Payments</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              ₹{totalPaidAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Cleared & settled in bank
            </div>
          </div>

          {/* Outstanding Payments */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
              <span>Outstanding Dues</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              ₹{totalOutstandingAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {pendingInvoicesCount} invoices pending payment
            </div>
          </div>

          {/* Customers & Quotations */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
              <span>Customers & Quotes</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {customers.length} <span className="text-xs text-slate-400 font-sans font-normal">Clients</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {quotations.length} active quotations recorded
            </div>
          </div>
        </div>
      </div>

      {/* Job Assistant Real Stat Strip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Job Assistant · Pipeline Status
          </h2>
          <button
            onClick={() => setActivePage('applications')}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <span>View Tracker</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Active Applications</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {activeApplicationsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Applied or in active review</div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Interviews Scheduled</div>
            <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
              {interviewsScheduledCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Active technical/HR rounds</div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Resumes Created</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {resumes.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">ATS-formatted versions saved</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Invoices & Job Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices Table */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
            <button
              onClick={() => setActivePage('invoices')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              All Invoices
            </button>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No invoices created yet. Click "Create Invoice" to record your first sale.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {inv.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {inv.invoiceNumber} · Due {inv.dueDate}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded capitalize ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : inv.status === 'overdue'
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications Pipeline */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Job Pipeline</h3>
            <button
              onClick={() => setActivePage('applications')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              All Applications
            </button>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No job applications logged yet. Track your first job submission.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentApplications.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {app.jobTitle}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {app.companyName} · {app.location}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded capitalize ${
                        app.status === 'interview'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : app.status === 'offer'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {app.status}
                    </span>
                    {app.interviewDate && (
                      <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                        Round: {app.interviewDate}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
