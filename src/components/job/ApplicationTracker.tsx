import React, { useState } from 'react';
import {
  BriefcaseBusiness,
  Plus,
  Search,
  ExternalLink,
  Calendar,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JobApplication, ApplicationStatus } from '../../types';
import * as api from '../../services/api';

const STATUS_COLUMNS: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: 'applied', label: 'Applied', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
  { status: 'screening', label: 'Screening', color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' },
  { status: 'interview', label: 'Interview', color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' },
  { status: 'offer', label: 'Offer Received', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' },
  { status: 'rejected', label: 'Archived / Rejected', color: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300' },
];

export const ApplicationTracker: React.FC = () => {
  const { applications, addApplication, editApplication, removeApplication, addToast } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [location, setLocation] = useState('Bengaluru / Remote');
  const [status, setStatus] = useState<ApplicationStatus>('applied');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [interviewDate, setInterviewDate] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('₹18,00,000 CTC');
  const [notes, setNotes] = useState('');
  const [reminders, setReminders] = useState('');

  const openNewModal = () => {
    setEditingApp(null);
    setCompanyName('');
    setJobTitle('');
    setJobUrl('');
    setLocation('Bengaluru / Remote');
    setStatus('applied');
    setAppliedDate(new Date().toISOString().split('T')[0]);
    setInterviewDate('');
    setSalaryExpectation('₹18,00,000 CTC');
    setNotes('');
    setReminders('');
    setIsModalOpen(true);
  };

  const openEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setCompanyName(app.companyName);
    setJobTitle(app.jobTitle);
    setJobUrl(app.jobUrl || '');
    setLocation(app.location || '');
    setStatus(app.status);
    setAppliedDate(app.appliedDate || '');
    setInterviewDate(app.interviewDate || '');
    setSalaryExpectation(app.salaryExpectation || '');
    setNotes(app.notes || '');
    setReminders(app.reminders || '');
    setIsModalOpen(true);
  };

  const handleSaveApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) {
      addToast('error', 'Company name and job title are required.');
      return;
    }

    try {
      if (editingApp) {
        await editApplication(editingApp.id, {
          companyName,
          jobTitle,
          jobUrl,
          location,
          status,
          appliedDate,
          interviewDate,
          salaryExpectation,
          notes,
          reminders,
        });
        addToast('success', 'Application record updated in Firestore.');
        setIsModalOpen(false);
      } else {
        await addApplication({
          companyName,
          jobTitle,
          jobUrl,
          location,
          status,
          appliedDate,
          interviewDate,
          salaryExpectation,
          notes,
          reminders,
        });
        addToast('success', 'New application tracked and saved to Firestore!');
        setIsModalOpen(false);
      }
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleQuickStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await editApplication(appId, { status: newStatus });
      addToast('success', `Moved to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this application record?')) return;
    try {
      await removeApplication(id);
      addToast('info', 'Application record removed from Firestore.');
    } catch (err: any) {
      addToast('error', err.message);
    }
  };

  const filteredApps = applications.filter((app) => {
    const q = search.toLowerCase();
    const matchesSearch =
      app.companyName.toLowerCase().includes(q) ||
      app.jobTitle.toLowerCase().includes(q) ||
      (app.location && app.location.toLowerCase().includes(q));
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BriefcaseBusiness className="w-5 h-5 text-blue-600" />
            <span>Job Application Pipeline Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track interview rounds, follow-up dates, compensation benchmarks, and referral links across all companies.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Track New Job</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company, role, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
          {['all', 'applied', 'screening', 'interview', 'offer', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.length === 0 ? (
          <div className="col-span-full p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            No applications match your criteria. Click <strong>"Track New Job"</strong> to add an application.
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{app.jobTitle}</h3>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate mt-0.5">
                      {app.companyName} · {app.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(app)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Applied Date:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{app.appliedDate}</span>
                  </div>

                  {app.salaryExpectation && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Target CTC:</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                        {app.salaryExpectation}
                      </span>
                    </div>
                  )}

                  {app.interviewDate && (
                    <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-medium">
                      <span>Interview Round:</span>
                      <span className="font-mono">{app.interviewDate}</span>
                    </div>
                  )}

                  {app.jobUrl && (
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline pt-1"
                    >
                      <span>View Job Posting</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {app.notes && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300">
                      {app.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Switcher Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                <select
                  value={app.status}
                  onChange={(e) => handleQuickStatusChange(app.id, e.target.value as ApplicationStatus)}
                  className={`text-[11px] font-semibold py-1 px-2 rounded-md border capitalize cursor-pointer ${
                    app.status === 'interview'
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                      : app.status === 'offer'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : app.status === 'rejected'
                      ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer Received</option>
                  <option value="rejected">Rejected / Closed</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT APPLICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingApp ? 'Update Job Application' : 'Track New Job Application'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Razorpay, Swiggy, TCS"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Location / Mode</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Bengaluru / Remote / Hybrid"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white capitalize"
                  >
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer Received</option>
                    <option value="rejected">Rejected / Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Applied Date</label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Interview Date (If set)</label>
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Application URL</label>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://company.com/jobs/..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target CTC / Salary</label>
                  <input
                    type="text"
                    value={salaryExpectation}
                    onChange={(e) => setSalaryExpectation(e.target.value)}
                    placeholder="e.g. ₹20,00,000 CTC"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Interview Notes / Next Steps
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Referrer: College senior. Focus on React system design in Round 2."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  {editingApp ? 'Update Application' : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
