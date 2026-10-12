import React, { useState } from 'react';
import {
  Settings,
  Building,
  UserCheck,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Database,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';

export const SettingsPage: React.FC = () => {
  const { user, refreshUserData, addToast, systemStatus, openBillingModal } = useApp();

  const [activeTab, setActiveTab] = useState<'business' | 'job_seeker' | 'integrations'>('business');

  // Business Profile state
  const [companyName, setCompanyName] = useState(user?.businessProfile?.companyName || '');
  const [ownerName, setOwnerName] = useState(user?.businessProfile?.ownerName || '');
  const [phone, setPhone] = useState(user?.businessProfile?.phone || '');
  const [email, setEmail] = useState(user?.businessProfile?.email || '');
  const [gstin, setGstin] = useState(user?.businessProfile?.gstin || '');
  const [address, setAddress] = useState(user?.businessProfile?.address || '');
  const [city, setCity] = useState(user?.businessProfile?.city || '');
  const [state, setState] = useState(user?.businessProfile?.state || '');
  const [pincode, setPincode] = useState(user?.businessProfile?.pincode || '');
  const [bankName, setBankName] = useState(user?.businessProfile?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(user?.businessProfile?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(user?.businessProfile?.ifscCode || '');
  const [defaultGstRate, setDefaultGstRate] = useState(user?.businessProfile?.defaultGstRate || 18);

  // Job Seeker Profile state
  const [seekerFullName, setSeekerFullName] = useState(user?.jobSeekerProfile?.fullName || '');
  const [targetRole, setTargetRole] = useState(user?.jobSeekerProfile?.targetRole || '');
  const [seekerPhone, setSeekerPhone] = useState(user?.jobSeekerProfile?.phone || '');
  const [seekerEmail, setSeekerEmail] = useState(user?.jobSeekerProfile?.email || '');
  const [seekerLocation, setSeekerLocation] = useState(user?.jobSeekerProfile?.location || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.jobSeekerProfile?.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(user?.jobSeekerProfile?.githubUrl || '');
  const [primarySkills, setPrimarySkills] = useState(user?.jobSeekerProfile?.primarySkills?.join(', ') || '');

  const [saving, setSaving] = useState(false);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateUserProfile({
        businessProfile: {
          companyName,
          ownerName,
          phone,
          email,
          gstin,
          address,
          city,
          state,
          pincode,
          bankName,
          accountNumber,
          ifscCode,
          defaultGstRate: Number(defaultGstRate),
        },
      });

      if (res.success) {
        addToast('success', 'Business profile updated successfully!');
        await refreshUserData();
      }
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSeeker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateUserProfile({
        jobSeekerProfile: {
          fullName: seekerFullName,
          targetRole,
          phone: seekerPhone,
          email: seekerEmail,
          location: seekerLocation,
          linkedinUrl,
          githubUrl,
          primarySkills: primarySkills.split(',').map((s) => s.trim()).filter(Boolean),
        },
      });

      if (res.success) {
        addToast('success', 'Job seeker preferences saved!');
        await refreshUserData();
      }
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>Platform Settings & Integrations</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure your business billing identity, job search parameters, and verify external service connections.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('business')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'business'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Business Profile (GST & Invoicing)
        </button>
        <button
          onClick={() => setActiveTab('job_seeker')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'job_seeker'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Job Seeker Profile (ATS & Roles)
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'integrations'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Integrations & Setup Guide
        </button>
      </div>

      {/* BUSINESS PROFILE TAB */}
      {activeTab === 'business' && (
        <form onSubmit={handleSaveBusiness} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Company & Legal Information</h3>
            <p className="text-slate-500 text-[11px]">These details appear automatically on your generated Tax Invoices & Quotations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Owner / Signatory Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Business GSTIN</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="27AADCS1234M1Z2"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Default GST Rate (%)</label>
              <select
                value={defaultGstRate}
                onChange={(e) => setDefaultGstRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              >
                <option value="0">0% (Exempt)</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST (Standard Services)</option>
                <option value="28">28% GST</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Office / Billing Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Bank Details for Invoices */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Bank Account Details (Printed on Invoices for NEFT / RTGS / IMPS)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank, SBI"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="50100234567890"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  placeholder="HDFC0001234"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono uppercase"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Business Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* JOB SEEKER PROFILE TAB */}
      {activeTab === 'job_seeker' && (
        <form onSubmit={handleSaveSeeker} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Job Seeker Preferences</h3>
            <p className="text-slate-500 text-[11px]">Default profile used by the ATS Resume Builder and Interview Preparation Coach.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={seekerFullName}
                onChange={(e) => setSeekerFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Engineering Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Data Analyst"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={seekerPhone}
                onChange={(e) => setSeekerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Preferred Location / Mode</label>
              <input
                type="text"
                value={seekerLocation}
                onChange={(e) => setSeekerLocation(e.target.value)}
                placeholder="Bengaluru, Pune, Remote"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub / Portfolio URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Primary Skills & Technologies (comma separated)
            </label>
            <input
              type="text"
              value={primarySkills}
              onChange={(e) => setPrimarySkills(e.target.value)}
              placeholder="React, TypeScript, Node.js, PostgreSQL, Docker"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Seeker Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* INTEGRATIONS & SETUP GUIDE TAB */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 text-xs">
          {/* Integration Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gemini */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Google Gemini AI</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                  Active (gemini-3.8-flash)
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Powers business copy, resume bullet refinement, ATS analysis, and interview simulations.
              </p>
            </div>

            {/* Razorpay */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Indian Payment Gateway</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-800">
                  Demo Sandbox Mode
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Simulates Razorpay order verification and activates Pro (₹199) and Business (₹499) tiers.
              </p>
            </div>

            {/* Firebase */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>Database & Storage</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-blue-100 text-blue-800">
                  Local Server Persistence
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Invoices, clients, and applications persist across server sessions with full CRUD support.
              </p>
            </div>
          </div>

          {/* Setup Instructions Guide */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Configuration Instructions for Production Deployment
            </h3>

            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">1. Live Razorpay Merchant Setup:</h4>
                <p className="text-[11px]">
                  To charge real UPI / Netbanking / Debit Card payments in India:
                  <br />
                  1. Register at <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dashboard.razorpay.com</a>.
                  <br />
                  2. Go to <strong>Settings &gt; API Keys</strong> and generate your Key ID and Key Secret.
                  <br />
                  3. In your environment file (<code>.env</code>), configure:
                  <br />
                  <code>RAZORPAY_KEY_ID="rzp_live_your_key_id"</code>
                  <br />
                  <code>RAZORPAY_KEY_SECRET="your_live_key_secret"</code>
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">2. Firebase Firestore & Auth Setup:</h4>
                <p className="text-[11px]">
                  To configure Firebase Cloud Sync:
                  <br />
                  1. Create a Firebase project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.firebase.google.com</a>.
                  <br />
                  2. Enable Cloud Firestore in Production Mode and Authentication (Google & Email provider).
                  <br />
                  3. Copy your Web App configuration keys into <code>.env</code> as defined in <code>.env.example</code>.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">3. Google Gemini API:</h4>
                <p className="text-[11px]">
                  Your Gemini API key is automatically provided by the AI Studio platform via <code>process.env.GEMINI_API_KEY</code>. You do not need to enter or configure it manually in the frontend.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
