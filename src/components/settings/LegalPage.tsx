import React from 'react';
import { Shield, FileCheck, Lock, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LegalPage: React.FC<{ type: 'privacy' | 'terms' }> = ({ type }) => {
  const { setActivePage } = useApp();

  const isPrivacy = type === 'privacy';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => setActivePage('dashboard')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
          </h1>
          <p className="text-slate-500 text-[11px] mt-1">SmartGrow AI · Effective Date: October 2026</p>
        </div>

        {isPrivacy ? (
          <>
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
              <p>
                SmartGrow AI collects only information strictly required to deliver business generation and career preparation utilities:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account & Profile:</strong> Name, email address, company registration details, and target job titles.</li>
                <li><strong>Business Invoicing Records:</strong> Customer details, item descriptions, invoice totals, and tax rates stored under your authenticated account.</li>
                <li><strong>Resume Data:</strong> Education, employment history, and project bullets entered for ATS optimization.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">2. Artificial Intelligence Processing</h2>
              <p>
                When generating marketing copy or analyzing resumes, prompts are securely processed via the Google Gemini API. We do not use your proprietary business records or personal resume details to train public language models without consent.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">3. Data Security & Storage</h2>
              <p>
                All sensitive API tokens and payment credentials remain secured on the server environment. User records are strictly partitioned by authenticated user identity.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing SmartGrow AI, you agree to these Terms. You are responsible for ensuring that all tax invoice details (including GSTIN and HSN codes) comply with your local jurisdiction's statutory requirements.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">2. Estimates & Quotations Disclaimer</h2>
              <p>
                Quotations created in the application are non-binding commercial estimates. They do not constitute official tax liabilities until formally converted into final invoices.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">3. ATS & Hiring Disclaimer</h2>
              <p>
                The Resume Analyzer and Job Description tools provide algorithmic heuristics based on semantic analysis. SmartGrow AI does not guarantee interview offers, hiring outcomes, or specific ATS vendor pass rates.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
