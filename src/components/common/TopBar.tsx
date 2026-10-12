import React from 'react';
import { Menu, Sun, Moon, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useApp, ActivePage } from '../../context/AppContext';

interface TopBarProps {
  onToggleMobileMenu: () => void;
}

const PAGE_TITLES: Record<ActivePage, { section: string; title: string }> = {
  landing: { section: 'SmartGrow AI', title: 'Platform Overview' },
  dashboard: { section: 'Overview', title: 'Executive Dashboard' },
  'business-content': { section: 'Business Assistant', title: 'AI Content Generator' },
  invoices: { section: 'Business Assistant', title: 'GST Invoice Generator' },
  quotations: { section: 'Business Assistant', title: 'Quotations & Estimates' },
  customers: { section: 'Business Assistant', title: 'Customer Directory' },
  'resume-builder': { section: 'Job Assistant', title: 'AI Resume Builder' },
  'resume-analyzer': { section: 'Job Assistant', title: 'ATS Resume Analyzer' },
  'jd-analyzer': { section: 'Job Assistant', title: 'Job Description Analyzer' },
  'interview-prep': { section: 'Job Assistant', title: 'Interview Preparation & Practice' },
  applications: { section: 'Job Assistant', title: 'Application Tracker' },
  pricing: { section: 'Account', title: 'Plans & Pricing' },
  settings: { section: 'Account', title: 'Settings & Integrations' },
  privacy: { section: 'Legal', title: 'Privacy Policy' },
  terms: { section: 'Legal', title: 'Terms of Service' },
};

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu }) => {
  const { activePage, setActivePage, isDarkMode, toggleDarkMode, user, openBillingModal, openAuthModal } = useApp();

  const currentMeta = PAGE_TITLES[activePage] || { section: 'SmartGrow AI', title: 'Dashboard' };

  return (
    <header className="h-16 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-between gap-6 sticky top-0 z-30">
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 truncate">
          <button
            onClick={() => setActivePage('dashboard')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            {currentMeta.section}
          </button>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-semibold text-slate-900 dark:text-white truncate">
            {currentMeta.title}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Quick Switches */}
      <div className="hidden md:flex items-center gap-2 text-xs">
        <button
          onClick={() => setActivePage('business-content')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            ['business-content', 'invoices', 'quotations', 'customers'].includes(activePage)
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Business Assistant
        </button>
        <button
          onClick={() => setActivePage('resume-builder')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
            ['resume-builder', 'resume-analyzer', 'jd-analyzer', 'interview-prep', 'applications'].includes(activePage)
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Job Assistant
        </button>
      </div>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Usage Quota Meter */}
        {user && (
          <div className="hidden sm:flex items-center gap-2 text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="tabular-nums font-mono font-medium">
              {user.usage.aiGenerationsUsed} / {user.usage.aiGenerationsLimit}
            </span>
            <span className="text-slate-400 text-[10px]">AI</span>
          </div>
        )}

        {/* User Status / Upgrade Plan Button */}
        {user ? (
          user.plan === 'free' ? (
            <button
              onClick={() => openBillingModal('pro')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Upgrade</span>
            </button>
          ) : (
            <button
              onClick={() => setActivePage('pricing')}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 uppercase tracking-wide font-mono"
            >
              {user.plan}
            </button>
          )
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            Sign In
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
