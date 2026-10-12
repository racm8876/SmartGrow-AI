import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  FileCheck,
  Users,
  FileUser,
  ScanSearch,
  FileSearch,
  MessageSquareCode,
  BriefcaseBusiness,
  CreditCard,
  Settings,
  Shield,
  FileCode2,
  ChevronRight,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { useApp, ActivePage } from '../../context/AppContext';
import { ASSETS } from '../../assets/images';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activePage, setActivePage, user, openBillingModal } = useApp();

  const handleNav = (page: ActivePage) => {
    setActivePage(page);
    onCloseMobile();
  };

  const navSection = (title: string, items: { page: ActivePage; label: string; icon: React.ReactNode; badge?: string }[]) => (
    <div className="mb-6">
      <div className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = activePage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => handleNav('landing')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              SG
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 dark:text-white leading-none tracking-tight">
                SmartGrow AI
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                Business & Job Suite
              </div>
            </div>
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {navSection('Core', [
            { page: 'dashboard', label: 'Main Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          ])}

          {navSection('Business Assistant', [
            { page: 'business-content', label: 'AI Content Generator', icon: <Sparkles className="w-4 h-4" />, badge: 'AI' },
            { page: 'invoices', label: 'GST Invoices', icon: <FileText className="w-4 h-4" /> },
            { page: 'quotations', label: 'Quotations / Estimates', icon: <FileCheck className="w-4 h-4" /> },
            { page: 'customers', label: 'Customer Directory', icon: <Users className="w-4 h-4" /> },
          ])}

          {navSection('Job Assistant', [
            { page: 'resume-builder', label: 'AI Resume Builder', icon: <FileUser className="w-4 h-4" />, badge: 'ATS' },
            { page: 'resume-analyzer', label: 'Resume Analyzer', icon: <ScanSearch className="w-4 h-4" /> },
            { page: 'jd-analyzer', label: 'Job Description Analyzer', icon: <FileSearch className="w-4 h-4" /> },
            { page: 'interview-prep', label: 'Interview Preparation', icon: <MessageSquareCode className="w-4 h-4" /> },
            { page: 'applications', label: 'Application Tracker', icon: <BriefcaseBusiness className="w-4 h-4" /> },
          ])}

          {navSection('Platform', [
            { page: 'pricing', label: 'Plans & Pricing', icon: <CreditCard className="w-4 h-4" /> },
            { page: 'settings', label: 'Settings & Integrations', icon: <Settings className="w-4 h-4" /> },
          ])}

          <div className="px-3 pt-2 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => handleNav('privacy')} className="hover:text-slate-700 dark:hover:text-slate-300">
              Privacy
            </button>
            <span>·</span>
            <button onClick={() => handleNav('terms')} className="hover:text-slate-700 dark:hover:text-slate-300">
              Terms
            </button>
            <span>·</span>
            <button onClick={() => handleNav('landing')} className="hover:text-slate-700 dark:hover:text-slate-300">
              Home
            </button>
          </div>
        </div>

        {/* User Card & Upgrade Prompt */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <img
              src={ASSETS.avatarFounder}
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user?.name || 'Aarav Sharma'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {user?.plan || 'free'} Plan
              </div>
            </div>
            {user?.plan === 'free' && (
              <button
                onClick={() => openBillingModal('pro')}
                className="p-1.5 text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded transition-colors"
                title="Upgrade to Pro"
              >
                <Crown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
