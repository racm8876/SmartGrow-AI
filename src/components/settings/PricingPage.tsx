import React from 'react';
import { Check, Crown, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PricingPage: React.FC = () => {
  const { user, openBillingModal } = useApp();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Subscription Plans & Usage Tiers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
          Transparent pricing tailored for Indian small businesses and job candidates. No hidden fees.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Free Plan */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Free Starter</div>
            <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mb-1">₹0</div>
            <div className="text-xs text-slate-500 mb-6">Forever Free · Basic test quotas</div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span><strong>15 AI Generations</strong> per month</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Up to 10 Invoices & Quotations</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>2 Saved ATS Resumes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Core Interview Questions</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            {user?.plan === 'free' ? (
              <span className="text-xs font-semibold text-slate-500 block py-2">Current Active Plan</span>
            ) : (
              <span className="text-xs text-slate-400 block py-2">Included</span>
            )}
          </div>
        </div>

        {/* Pro Plan */}
        <div className="rounded-2xl border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-lg relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
            Most Popular
          </div>

          <div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
              Pro Growth Plan
            </div>
            <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mb-1">₹199</div>
            <div className="text-xs text-slate-500 mb-6">per month · For active job seekers & freelancers</div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span><strong>150 AI Generations</strong> per month</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>100 GST Invoices & Quotations</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>15 Saved Resumes with AI Enhancement</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>ATS Resume vs JD Analyzer</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Live Interview Practice Coach</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
            {user?.plan === 'pro' ? (
              <span className="text-xs font-semibold text-emerald-600 block text-center py-2">
                Current Active Plan
              </span>
            ) : (
              <button
                onClick={() => openBillingModal('pro')}
                className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Upgrade to Pro (₹199/mo)
              </button>
            )}
          </div>
        </div>

        {/* Business Plan */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Business Scale Plan
            </div>
            <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mb-1">₹499</div>
            <div className="text-xs text-slate-500 mb-6">per month · For agencies, shops & studios</div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span><strong>500 AI Generations</strong> per month</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span><strong>1,000 Invoices & Quotations</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Unlimited Customer Directory & Ledgers</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Full Multilingual Copy (Hindi & Hinglish)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Priority Generation Response</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
            {user?.plan === 'business' ? (
              <span className="text-xs font-semibold text-emerald-600 block text-center py-2">
                Current Active Plan
              </span>
            ) : (
              <button
                onClick={() => openBillingModal('business')}
                className="w-full py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Upgrade to Business (₹499/mo)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
