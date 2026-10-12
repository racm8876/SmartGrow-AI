/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { TopBar } from './components/common/TopBar';
import { ToastContainer } from './components/common/ToastContainer';
import { BillingModal } from './components/common/BillingModal';
import { AuthModal } from './components/auth/AuthModal';

import { LandingPage } from './components/landing/LandingPage';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { ContentGenerator } from './components/business/ContentGenerator';
import { InvoiceGenerator } from './components/business/InvoiceGenerator';
import { QuotationGenerator } from './components/business/QuotationGenerator';
import { CustomerManagement } from './components/business/CustomerManagement';

import { ResumeBuilder } from './components/job/ResumeBuilder';
import { ResumeAnalyzer } from './components/job/ResumeAnalyzer';
import { JobDescriptionAnalyzer } from './components/job/JobDescriptionAnalyzer';
import { InterviewPrep } from './components/job/InterviewPrep';
import { ApplicationTracker } from './components/job/ApplicationTracker';

import { SettingsPage } from './components/settings/SettingsPage';
import { PricingPage } from './components/settings/PricingPage';
import { LegalPage } from './components/settings/LegalPage';
import { Mail, AlertTriangle } from 'lucide-react';

const AppShell: React.FC = () => {
  const {
    activePage,
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    firebaseUser,
    resendVerificationEmail,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on landing page, show the dedicated full-width marketing landing experience
  if (activePage === 'landing') {
    return (
      <main className="min-h-screen">
        <LandingPage />
        <BillingModal />
        <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} defaultMode={authModalMode} />
        <ToastContainer />
      </main>
    );
  }

  const renderActiveContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <MainDashboard />;
      case 'business-content':
        return <ContentGenerator />;
      case 'invoices':
        return <InvoiceGenerator />;
      case 'quotations':
        return <QuotationGenerator />;
      case 'customers':
        return <CustomerManagement />;
      case 'resume-builder':
        return <ResumeBuilder />;
      case 'resume-analyzer':
        return <ResumeAnalyzer />;
      case 'jd-analyzer':
        return <JobDescriptionAnalyzer />;
      case 'interview-prep':
        return <InterviewPrep />;
      case 'applications':
        return <ApplicationTracker />;
      case 'pricing':
        return <PricingPage />;
      case 'settings':
        return <SettingsPage />;
      case 'privacy':
        return <LegalPage type="privacy" />;
      case 'terms':
        return <LegalPage type="terms" />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      {/* Main Workspace Frame */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        <TopBar onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />

        {/* Email verification alert banner if user is unverified */}
        {firebaseUser && !firebaseUser.emailVerified && firebaseUser.email && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="truncate">
                Your email (<strong>{firebaseUser.email}</strong>) is unverified.
              </span>
            </div>
            <button
              onClick={resendVerificationEmail}
              className="text-amber-700 dark:text-amber-300 font-semibold hover:underline shrink-0 flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Resend Verification Link</span>
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveContent()}
        </main>
      </div>

      <BillingModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} defaultMode={authModalMode} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
