import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Invoice, Quotation, Customer, JobApplication, ResumeData } from '../types';
import * as api from '../services/api';

export type ActivePage =
  | 'landing'
  | 'dashboard'
  | 'business-content'
  | 'invoices'
  | 'quotations'
  | 'customers'
  | 'resume-builder'
  | 'resume-analyzer'
  | 'jd-analyzer'
  | 'interview-prep'
  | 'applications'
  | 'pricing'
  | 'settings'
  | 'privacy'
  | 'terms';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  user: User | null;
  loadingUser: boolean;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  isBillingModalOpen: boolean;
  openBillingModal: (preselectedTier?: 'pro' | 'business') => void;
  closeBillingModal: () => void;
  selectedUpgradeTier: 'pro' | 'business';
  refreshUserData: () => Promise<void>;
  updateUserPlanLocal: (tier: 'pro' | 'business') => void;
  // Shared data caches
  invoices: Invoice[];
  quotations: Quotation[];
  customers: Customer[];
  applications: JobApplication[];
  resumes: ResumeData[];
  refreshInvoices: () => Promise<void>;
  refreshQuotations: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  refreshApplications: () => Promise<void>;
  refreshResumes: () => Promise<void>;
  // System status
  systemStatus: {
    geminiConfigured: boolean;
    razorpayConfigured: boolean;
    firebaseConfigured: boolean;
  } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);
  const [selectedUpgradeTier, setSelectedUpgradeTier] = useState<'pro' | 'business'>('pro');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [systemStatus, setSystemStatus] = useState<AppContextType['systemStatus']>(null);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const openBillingModal = (preselectedTier: 'pro' | 'business' = 'pro') => {
    setSelectedUpgradeTier(preselectedTier);
    setIsBillingModalOpen(true);
  };

  const closeBillingModal = () => {
    setIsBillingModalOpen(false);
  };

  const refreshUserData = async () => {
    try {
      const res = await api.getUser();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load user data:', err);
    }
  };

  const updateUserPlanLocal = (tier: 'pro' | 'business') => {
    if (!user) return;
    setUser({
      ...user,
      plan: tier,
      usage: {
        ...user.usage,
        aiGenerationsLimit: tier === 'business' ? 500 : 150,
        invoicesLimit: tier === 'business' ? 1000 : 100,
        resumesLimit: tier === 'business' ? 50 : 15,
      },
    });
  };

  const refreshInvoices = async () => {
    try {
      const res = await api.getInvoices();
      if (res.success) setInvoices(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshQuotations = async () => {
    try {
      const res = await api.getQuotations();
      if (res.success) setQuotations(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshCustomers = async () => {
    try {
      const res = await api.getCustomers();
      if (res.success) setCustomers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshApplications = async () => {
    try {
      const res = await api.getApplications();
      if (res.success) setApplications(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshResumes = async () => {
    try {
      const res = await api.getResumes();
      if (res.success) setResumes(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function init() {
      setLoadingUser(true);
      await Promise.allSettled([
        refreshUserData(),
        refreshInvoices(),
        refreshQuotations(),
        refreshCustomers(),
        refreshApplications(),
        refreshResumes(),
      ]);
      try {
        const status = await api.getSystemStatus();
        setSystemStatus({
          geminiConfigured: status.geminiConfigured,
          razorpayConfigured: status.razorpayConfigured,
          firebaseConfigured: status.firebaseConfigured,
        });
      } catch (err) {
        console.error('System status query failed:', err);
      }
      setLoadingUser(false);
    }
    init();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        loadingUser,
        activePage,
        setActivePage,
        isDarkMode,
        toggleDarkMode,
        toasts,
        addToast,
        removeToast,
        isBillingModalOpen,
        openBillingModal,
        closeBillingModal,
        selectedUpgradeTier,
        refreshUserData,
        updateUserPlanLocal,
        invoices,
        quotations,
        customers,
        applications,
        resumes,
        refreshInvoices,
        refreshQuotations,
        refreshCustomers,
        refreshApplications,
        refreshResumes,
        systemStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
