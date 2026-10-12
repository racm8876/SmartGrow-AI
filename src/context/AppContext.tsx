import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Invoice, Quotation, Customer, JobApplication, ResumeData } from '../types';
import * as api from '../services/api';
import {
  auth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  sendEmailVerification,
  deleteUser as firebaseDeleteUser,
  FirebaseUser,
} from '../services/firebase';
import {
  getOrCreateUserDocument,
  updateUserInFirestore,
  getInvoicesFromFirestore,
  createInvoiceInFirestore,
  updateInvoiceInFirestore,
  deleteInvoiceFromFirestore,
  getQuotationsFromFirestore,
  createQuotationInFirestore,
  updateQuotationInFirestore,
  deleteQuotationFromFirestore,
  getCustomersFromFirestore,
  createCustomerInFirestore,
  updateCustomerInFirestore,
  deleteCustomerFromFirestore,
  getApplicationsFromFirestore,
  createApplicationInFirestore,
  updateApplicationInFirestore,
  deleteApplicationFromFirestore,
  getResumesFromFirestore,
  saveResumeInFirestore,
  deleteResumeFromFirestore,
} from '../services/firestoreService';

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
  firebaseUser: FirebaseUser | null;
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
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  signOutUser: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserPlanLocal: (tier: 'pro' | 'business') => Promise<void>;
  updateUserProfileData: (updates: {
    businessProfile?: Partial<User['businessProfile']>;
    jobSeekerProfile?: Partial<User['jobSeekerProfile']>;
    name?: string;
  }) => Promise<void>;
  // Firestore Data Caches & CRUD
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
  // Mutators
  addInvoice: (invoice: Partial<Invoice>) => Promise<Invoice>;
  editInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  removeInvoice: (id: string) => Promise<void>;
  addQuotation: (quote: Partial<Quotation>) => Promise<Quotation>;
  editQuotation: (id: string, quote: Partial<Quotation>) => Promise<void>;
  removeQuotation: (id: string) => Promise<void>;
  addCustomer: (cust: Partial<Customer>) => Promise<Customer>;
  editCustomer: (id: string, cust: Partial<Customer>) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
  addApplication: (appData: Partial<JobApplication>) => Promise<JobApplication>;
  editApplication: (id: string, appData: Partial<JobApplication>) => Promise<void>;
  removeApplication: (id: string) => Promise<void>;
  saveResumeDoc: (resume: ResumeData) => Promise<ResumeData>;
  removeResumeDoc: (id: string) => Promise<void>;
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);
  const [selectedUpgradeTier, setSelectedUpgradeTier] = useState<'pro' | 'business'>('pro');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

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

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Load Firestore data collections for current user
  const loadUserDataFromFirestore = async (uid: string) => {
    try {
      const [invList, quoteList, custList, appList, resList] = await Promise.all([
        getInvoicesFromFirestore(uid),
        getQuotationsFromFirestore(uid),
        getCustomersFromFirestore(uid),
        getApplicationsFromFirestore(uid),
        getResumesFromFirestore(uid),
      ]);
      setInvoices(invList);
      setQuotations(quoteList);
      setCustomers(custList);
      setApplications(appList);
      setResumes(resList);
    } catch (err) {
      console.error('[Firestore] Error loading user collections:', err);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoadingUser(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const token = await fbUser.getIdToken();
          api.setAuthToken(token);
          const userData = await getOrCreateUserDocument(fbUser);
          setUser(userData);
          await loadUserDataFromFirestore(fbUser.uid);
          // If user landed directly or is on landing, move to dashboard on successful sign-in
          setActivePage((prev) => (prev === 'landing' ? 'dashboard' : prev));
        } catch (err) {
          console.error('[Auth Init Error]', err);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        api.setAuthToken(null);
        setInvoices([]);
        setQuotations([]);
        setCustomers([]);
        setApplications([]);
        setResumes([]);
      }
      setLoadingUser(false);
    });

    // Check system status
    api
      .getSystemStatus()
      .then((status) => {
        setSystemStatus({
          geminiConfigured: status.geminiConfigured,
          razorpayConfigured: status.razorpayConfigured,
          firebaseConfigured: status.firebaseConfigured,
        });
      })
      .catch((e) => console.error('Status fetch error:', e));

    return () => unsubscribe();
  }, []);

  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setActivePage('landing');
      addToast('info', 'You have been signed out.');
    } catch (err: any) {
      addToast('error', err?.message || 'Error signing out.');
    }
  };

  const resendVerificationEmail = async () => {
    if (!firebaseUser) return;
    try {
      await sendEmailVerification(firebaseUser);
      addToast('success', 'Verification link re-sent! Check your inbox.');
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to send verification link.');
    }
  };

  const deleteUserAccount = async () => {
    if (!firebaseUser || !user) return;
    try {
      await firebaseDeleteUser(firebaseUser);
      setUser(null);
      setFirebaseUser(null);
      setActivePage('landing');
      addToast('info', 'Your account has been deleted.');
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to delete account. Please re-authenticate and try again.');
    }
  };

  const refreshUserData = async () => {
    if (firebaseUser) {
      try {
        const userData = await getOrCreateUserDocument(firebaseUser);
        setUser(userData);
      } catch (e) {
        console.error('Failed to refresh user data:', e);
      }
    }
  };

  const updateUserPlanLocal = async (tier: 'pro' | 'business') => {
    if (!user) return;
    const aiLimit = tier === 'business' ? 500 : 150;
    const invLimit = tier === 'business' ? 1000 : 100;
    const resLimit = tier === 'business' ? 50 : 15;

    const updatedUser: User = {
      ...user,
      plan: tier,
      usage: {
        ...user.usage,
        aiGenerationsLimit: aiLimit,
        invoicesLimit: invLimit,
        resumesLimit: resLimit,
      },
    };
    setUser(updatedUser);
    await updateUserInFirestore(user.id, {
      plan: tier,
      usage: updatedUser.usage,
    });
  };

  const updateUserProfileData = async (updates: {
    businessProfile?: Partial<User['businessProfile']>;
    jobSeekerProfile?: Partial<User['jobSeekerProfile']>;
    name?: string;
  }) => {
    if (!user) return;
    const mergedUser: User = {
      ...user,
      name: updates.name !== undefined ? updates.name : user.name,
      businessProfile: {
        ...user.businessProfile,
        ...(updates.businessProfile || {}),
      },
      jobSeekerProfile: {
        ...user.jobSeekerProfile,
        ...(updates.jobSeekerProfile || {}),
      },
    };
    setUser(mergedUser);
    await updateUserInFirestore(user.id, mergedUser);
    addToast('success', 'Profile saved successfully.');
  };

  // Invoices Mutators
  const refreshInvoices = async () => {
    if (user) setInvoices(await getInvoicesFromFirestore(user.id));
  };

  const addInvoice = async (invoice: Partial<Invoice>): Promise<Invoice> => {
    if (!user) throw new Error('Authentication required');
    const created = await createInvoiceInFirestore(user.id, invoice);
    setInvoices((prev) => [created, ...prev]);
    // Increment local usage count
    setUser((prev) =>
      prev
        ? {
            ...prev,
            usage: { ...prev.usage, invoicesCreated: prev.usage.invoicesCreated + 1 },
          }
        : prev
    );
    return created;
  };

  const editInvoice = async (id: string, invoice: Partial<Invoice>) => {
    if (!user) throw new Error('Authentication required');
    await updateInvoiceInFirestore(user.id, id, invoice);
    setInvoices((prev) => prev.map((item) => (item.id === id ? { ...item, ...invoice } : item)));
  };

  const removeInvoice = async (id: string) => {
    if (!user) throw new Error('Authentication required');
    await deleteInvoiceFromFirestore(user.id, id);
    setInvoices((prev) => prev.filter((item) => item.id !== id));
  };

  // Quotations Mutators
  const refreshQuotations = async () => {
    if (user) setQuotations(await getQuotationsFromFirestore(user.id));
  };

  const addQuotation = async (quote: Partial<Quotation>): Promise<Quotation> => {
    if (!user) throw new Error('Authentication required');
    const created = await createQuotationInFirestore(user.id, quote);
    setQuotations((prev) => [created, ...prev]);
    return created;
  };

  const editQuotation = async (id: string, quote: Partial<Quotation>) => {
    if (!user) throw new Error('Authentication required');
    await updateQuotationInFirestore(user.id, id, quote);
    setQuotations((prev) => prev.map((item) => (item.id === id ? { ...item, ...quote } : item)));
  };

  const removeQuotation = async (id: string) => {
    if (!user) throw new Error('Authentication required');
    await deleteQuotationFromFirestore(user.id, id);
    setQuotations((prev) => prev.filter((item) => item.id !== id));
  };

  // Customers Mutators
  const refreshCustomers = async () => {
    if (user) setCustomers(await getCustomersFromFirestore(user.id));
  };

  const addCustomer = async (cust: Partial<Customer>): Promise<Customer> => {
    if (!user) throw new Error('Authentication required');
    const created = await createCustomerInFirestore(user.id, cust);
    setCustomers((prev) => [created, ...prev]);
    return created;
  };

  const editCustomer = async (id: string, cust: Partial<Customer>) => {
    if (!user) throw new Error('Authentication required');
    await updateCustomerInFirestore(user.id, id, cust);
    setCustomers((prev) => prev.map((item) => (item.id === id ? { ...item, ...cust } : item)));
  };

  const removeCustomer = async (id: string) => {
    if (!user) throw new Error('Authentication required');
    await deleteCustomerFromFirestore(user.id, id);
    setCustomers((prev) => prev.filter((item) => item.id !== id));
  };

  // Applications Mutators
  const refreshApplications = async () => {
    if (user) setApplications(await getApplicationsFromFirestore(user.id));
  };

  const addApplication = async (appData: Partial<JobApplication>): Promise<JobApplication> => {
    if (!user) throw new Error('Authentication required');
    const created = await createApplicationInFirestore(user.id, appData);
    setApplications((prev) => [created, ...prev]);
    return created;
  };

  const editApplication = async (id: string, appData: Partial<JobApplication>) => {
    if (!user) throw new Error('Authentication required');
    await updateApplicationInFirestore(user.id, id, appData);
    setApplications((prev) => prev.map((item) => (item.id === id ? { ...item, ...appData } : item)));
  };

  const removeApplication = async (id: string) => {
    if (!user) throw new Error('Authentication required');
    await deleteApplicationFromFirestore(user.id, id);
    setApplications((prev) => prev.filter((item) => item.id !== id));
  };

  // Resumes Mutators
  const refreshResumes = async () => {
    if (user) setResumes(await getResumesFromFirestore(user.id));
  };

  const saveResumeDoc = async (resume: ResumeData): Promise<ResumeData> => {
    if (!user) throw new Error('Authentication required');
    const saved = await saveResumeInFirestore(user.id, resume);
    setResumes((prev) => {
      const idx = prev.findIndex((r) => r.id === saved.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setUser((prev) =>
      prev
        ? {
            ...prev,
            usage: { ...prev.usage, resumesCreated: prev.usage.resumesCreated + 1 },
          }
        : prev
    );
    return saved;
  };

  const removeResumeDoc = async (id: string) => {
    if (!user) throw new Error('Authentication required');
    await deleteResumeFromFirestore(user.id, id);
    setResumes((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        firebaseUser,
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
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signOutUser,
        resendVerificationEmail,
        deleteUserAccount,
        refreshUserData,
        updateUserPlanLocal,
        updateUserProfileData,
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
        addInvoice,
        editInvoice,
        removeInvoice,
        addQuotation,
        editQuotation,
        removeQuotation,
        addCustomer,
        editCustomer,
        removeCustomer,
        addApplication,
        editApplication,
        removeApplication,
        saveResumeDoc,
        removeResumeDoc,
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
