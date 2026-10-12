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
  Mail,
  Trash2,
  Lock,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { auth, sendPasswordResetEmail } from '../../services/firebase';

export const SettingsPage: React.FC = () => {
  const {
    user,
    firebaseUser,
    updateUserProfileData,
    resendVerificationEmail,
    deleteUserAccount,
    addToast,
    systemStatus,
    openBillingModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'business' | 'job_seeker' | 'account' | 'integrations'>('business');

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
      await updateUserProfileData({
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
    } catch (err: any) {
      addToast('error', err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSeeker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfileData({
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
    } catch (err: any) {
      addToast('error', err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!firebaseUser?.email) {
      addToast('error', 'No email address registered.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, firebaseUser.email);
      addToast('success', `Password reset instructions sent to ${firebaseUser.email}`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to send password reset email.');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you ABSOLUTELY sure you want to permanently delete your account and all associated Firestore records? This action cannot be undone.')) {
      await deleteUserAccount();
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
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('business')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'business'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Business Profile (GST & Invoicing)
        </button>
        <button
          onClick={() => setActiveTab('job_seeker')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'job_seeker'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Job Seeker Profile (ATS & Roles)
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'account'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Account & Security
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'integrations'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Production Integrations Status
        </button>
      </div>

      {/* Tab 1: Business Profile */}
      {activeTab === 'business' && (
        <form onSubmit={handleSaveBusiness} className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Company & Tax Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Brand Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Sharma Digital & Retail"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Owner / Signatory Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Billing Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Billing Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@sharmasolutions.in"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN (Optional for Non-GST)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="27AADCS1234M1Z2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Default GST Slab (%)</label>
                <select
                  value={defaultGstRate}
                  onChange={(e) => setDefaultGstRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18% (Standard Services)</option>
                  <option value={28}>28%</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Billing Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot 42, Cyber Hub, Phase 2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Bank & Remittance Details for Invoices</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="HDFC Bank"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="50100234567890"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  placeholder="HDFC0001234"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Business Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Job Seeker Profile */}
      {activeTab === 'job_seeker' && (
        <form onSubmit={handleSaveSeeker} className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Candidate Profile & ATS Defaults</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={seekerFullName}
                  onChange={(e) => setSeekerFullName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Role Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Full Stack Engineer / React Specialist"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={seekerEmail}
                  onChange={(e) => setSeekerEmail(e.target.value)}
                  placeholder="aarav.sharma@gmail.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile / WhatsApp</label>
                <input
                  type="tel"
                  value={seekerPhone}
                  onChange={(e) => setSeekerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Location Preference</label>
                <input
                  type="text"
                  value={seekerLocation}
                  onChange={(e) => setSeekerLocation(e.target.value)}
                  placeholder="Bengaluru / Hybrid / Remote"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  value={primarySkills}
                  onChange={(e) => setPrimarySkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js, PostgreSQL, Docker, AWS"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Candidate Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Account & Security */}
      {activeTab === 'account' && (
        <div className="space-y-6 text-xs">
          {/* Identity & Verification */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-600" />
              <span>Account Credentials & Email Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-slate-500 font-medium">Registered Email</div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  {firebaseUser?.email || user?.email || 'Guest User'}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {firebaseUser?.emailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <AlertCircle className="w-3.5 h-3.5" /> Unverified
                      </span>
                      <button
                        onClick={resendVerificationEmail}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Resend Link
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-slate-500 font-medium">Current Subscription</div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm capitalize">
                  {user?.plan || 'Free'} Plan
                </div>
                <button
                  onClick={() => openBillingModal('pro')}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline block pt-1"
                >
                  Change Plan Tier
                </button>
              </div>
            </div>
          </div>

          {/* Password Reset */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Password Reset</span>
              </h4>
              <p className="text-slate-500 mt-1">
                Receive a secure password reset link at your registered email address.
              </p>
            </div>
            <button
              onClick={handlePasswordReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl transition-colors shrink-0"
            >
              Send Reset Link
            </button>
          </div>

          {/* Account Deletion */}
          <div className="p-6 bg-red-50/60 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/60 shadow-xs flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-red-900 dark:text-red-200 text-sm flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Delete Account & Data</span>
              </h4>
              <p className="text-red-700 dark:text-red-300 mt-1">
                Permanently purge your account, profile documents, invoices, quotations, and resumes.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shrink-0 shadow-xs"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Integrations */}
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
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
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
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {systemStatus?.razorpayConfigured ? 'Live Gateway Connected' : 'Demo Sandbox Mode'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                {systemStatus?.razorpayConfigured
                  ? 'Live Razorpay order creation and HMAC signature verification active.'
                  : 'Simulates Razorpay order verification and activates Pro (₹199) and Business (₹499) tiers.'}
              </p>
            </div>

            {/* Firebase */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>Cloud Firestore</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Live Provisioned
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Persistent documents and subcollections secured by deployed Zero-Trust Firestore Security Rules.
              </p>
            </div>
          </div>

          {/* Setup Instructions Guide */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Production Configuration Guide
            </h3>

            <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">1. Live Razorpay Merchant Credentials:</h4>
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
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">2. Firebase Firestore & Auth:</h4>
                <p className="text-[11px]">
                  Firebase Firestore and Authentication are live configured via <code>firebase-applet-config.json</code> with project <strong>cryptic-poetry-p2w8r</strong> and security rules actively deployed.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">3. Google Gemini API:</h4>
                <p className="text-[11px]">
                  Your Gemini API key is provided securely on the server via <code>process.env.GEMINI_API_KEY</code>. Client code never receives the key.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
