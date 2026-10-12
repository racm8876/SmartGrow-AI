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

const AppShell: React.FC = () => {
  const { activePage } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on landing page, show the dedicated full-width marketing landing experience
  if (activePage === 'landing') {
    return (
      <main className="min-h-screen">
        <LandingPage />
        <BillingModal />
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveContent()}
        </main>
      </div>

      <BillingModal />
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
