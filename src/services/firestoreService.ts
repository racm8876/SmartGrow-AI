import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from './firebase';
import { User, Invoice, Quotation, Customer, JobApplication, ResumeData } from '../types';

// ==========================================
// USER PROFILE & ACCOUNT IN FIRESTORE
// ==========================================

export async function getOrCreateUserDocument(firebaseUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
}): Promise<User> {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(userDocRef);

  if (snapshot.exists()) {
    const data = snapshot.data() as User;
    return {
      ...data,
      id: firebaseUser.uid,
      email: firebaseUser.email || data.email,
    };
  }

  // Initial user document for new signups
  const newUser: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'SmartGrow User'),
    role: 'all',
    plan: 'free',
    createdAt: new Date().toISOString(),
    usage: {
      aiGenerationsUsed: 0,
      aiGenerationsLimit: 15,
      invoicesCreated: 0,
      invoicesLimit: 10,
      resumesCreated: 0,
      resumesLimit: 2,
    },
    businessProfile: {
      companyName: '',
      ownerName: firebaseUser.displayName || '',
      phone: '',
      email: firebaseUser.email || '',
      gstin: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      panNumber: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      defaultGstRate: 18,
      currency: 'INR',
    },
    jobSeekerProfile: {
      fullName: firebaseUser.displayName || '',
      targetRole: 'Software Developer',
      email: firebaseUser.email || '',
      phone: '',
      location: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
      experienceYears: 0,
      primarySkills: [],
    },
  };

  await setDoc(userDocRef, {
    ...newUser,
    updatedAt: serverTimestamp(),
  });

  return newUser;
}

export async function updateUserInFirestore(userId: string, updates: Partial<User>): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function incrementUserUsage(userId: string, key: 'aiGenerationsUsed' | 'invoicesCreated' | 'resumesCreated'): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  const snap = await getDoc(userDocRef);
  if (snap.exists()) {
    const currentUsage = snap.data().usage || {};
    const updatedCount = (currentUsage[key] || 0) + 1;
    await updateDoc(userDocRef, {
      [`usage.${key}`]: updatedCount,
      updatedAt: serverTimestamp(),
    });
  }
}

// ==========================================
// INVOICES (SUBCOLLECTION: /users/{userId}/invoices)
// ==========================================

export async function getInvoicesFromFirestore(userId: string): Promise<Invoice[]> {
  const colRef = collection(db, 'users', userId, 'invoices');
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(100));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
    } as Invoice;
  });
}

export async function createInvoiceInFirestore(userId: string, invoice: Partial<Invoice>): Promise<Invoice> {
  const colRef = collection(db, 'users', userId, 'invoices');
  const invoiceId = invoice.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(colRef, invoiceId);

  const cleanInvoice: Invoice = {
    id: invoiceId,
    userId,
    invoiceNumber: invoice.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    customerId: invoice.customerId || '',
    customerName: invoice.customerName || 'Customer',
    customerEmail: invoice.customerEmail || '',
    customerPhone: invoice.customerPhone || '',
    customerAddress: invoice.customerAddress || '',
    customerGstin: invoice.customerGstin || '',
    issueDate: invoice.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoice.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    items: invoice.items || [],
    subtotal: Number(invoice.subtotal) || 0,
    taxAmount: Number(invoice.taxAmount) || 0,
    discountAmount: Number(invoice.discountAmount) || 0,
    totalAmount: Number(invoice.totalAmount) || 0,
    status: invoice.status || 'pending',
    notes: invoice.notes || '',
    terms: invoice.terms || '',
    isGstRegistered: Boolean(invoice.isGstRegistered),
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, cleanInvoice);
  await incrementUserUsage(userId, 'invoicesCreated');
  return cleanInvoice;
}

export async function updateInvoiceInFirestore(userId: string, invoiceId: string, updates: Partial<Invoice>): Promise<void> {
  const docRef = doc(db, 'users', userId, 'invoices', invoiceId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInvoiceFromFirestore(userId: string, invoiceId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'invoices', invoiceId);
  await deleteDoc(docRef);
}

// ==========================================
// QUOTATIONS (SUBCOLLECTION: /users/{userId}/quotations)
// ==========================================

export async function getQuotationsFromFirestore(userId: string): Promise<Quotation[]> {
  const colRef = collection(db, 'users', userId, 'quotations');
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(100));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
    } as Quotation;
  });
}

export async function createQuotationInFirestore(userId: string, quote: Partial<Quotation>): Promise<Quotation> {
  const colRef = collection(db, 'users', userId, 'quotations');
  const quoteId = quote.id || `qt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(colRef, quoteId);

  const cleanQuote: Quotation = {
    id: quoteId,
    userId,
    quotationNumber: quote.quotationNumber || `QT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    customerId: quote.customerId || '',
    customerName: quote.customerName || 'Customer',
    customerEmail: quote.customerEmail || '',
    customerPhone: quote.customerPhone || '',
    customerAddress: quote.customerAddress || '',
    issueDate: quote.issueDate || new Date().toISOString().split('T')[0],
    validUntil: quote.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    items: quote.items || [],
    subtotal: Number(quote.subtotal) || 0,
    taxAmount: Number(quote.taxAmount) || 0,
    discountAmount: Number(quote.discountAmount) || 0,
    totalAmount: Number(quote.totalAmount) || 0,
    status: quote.status || 'sent',
    notes: quote.notes || '',
    terms: quote.terms || '',
    isGstRegistered: Boolean(quote.isGstRegistered),
    createdAt: new Date().toISOString(),
  };

  await setDoc(docRef, cleanQuote);
  return cleanQuote;
}

export async function updateQuotationInFirestore(userId: string, quoteId: string, updates: Partial<Quotation>): Promise<void> {
  const docRef = doc(db, 'users', userId, 'quotations', quoteId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteQuotationFromFirestore(userId: string, quoteId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'quotations', quoteId);
  await deleteDoc(docRef);
}

// ==========================================
// CUSTOMERS (SUBCOLLECTION: /users/{userId}/customers)
// ==========================================

export async function getCustomersFromFirestore(userId: string): Promise<Customer[]> {
  const colRef = collection(db, 'users', userId, 'customers');
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(100));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
    } as Customer;
  });
}

export async function createCustomerInFirestore(userId: string, cust: Partial<Customer>): Promise<Customer> {
  const colRef = collection(db, 'users', userId, 'customers');
  const customerId = cust.id || `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(colRef, customerId);

  const cleanCustomer: Customer = {
    id: customerId,
    userId,
    name: cust.name || 'New Customer',
    companyName: cust.companyName || '',
    phone: cust.phone || '',
    email: cust.email || '',
    gstin: cust.gstin || '',
    address: cust.address || '',
    city: cust.city || '',
    notes: cust.notes || '',
    totalInvoiced: Number(cust.totalInvoiced) || 0,
    pendingBalance: Number(cust.pendingBalance) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, cleanCustomer);
  return cleanCustomer;
}

export async function updateCustomerInFirestore(userId: string, customerId: string, updates: Partial<Customer>): Promise<void> {
  const docRef = doc(db, 'users', userId, 'customers', customerId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCustomerFromFirestore(userId: string, customerId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'customers', customerId);
  await deleteDoc(docRef);
}

// ==========================================
// JOB APPLICATIONS (SUBCOLLECTION: /users/{userId}/applications)
// ==========================================

export async function getApplicationsFromFirestore(userId: string): Promise<JobApplication[]> {
  const colRef = collection(db, 'users', userId, 'applications');
  const q = query(colRef, orderBy('updatedAt', 'desc'), limit(100));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
    } as JobApplication;
  });
}

export async function createApplicationInFirestore(userId: string, appData: Partial<JobApplication>): Promise<JobApplication> {
  const colRef = collection(db, 'users', userId, 'applications');
  const appId = appData.id || `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(colRef, appId);

  const cleanApp: JobApplication = {
    id: appId,
    userId,
    companyName: appData.companyName || 'Target Company',
    jobTitle: appData.jobTitle || 'Role',
    jobUrl: appData.jobUrl || '',
    location: appData.location || 'India / Remote',
    status: appData.status || 'applied',
    appliedDate: appData.appliedDate || new Date().toISOString().split('T')[0],
    interviewDate: appData.interviewDate || '',
    salaryExpectation: appData.salaryExpectation || '',
    notes: appData.notes || '',
    reminders: appData.reminders || '',
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, cleanApp);
  return cleanApp;
}

export async function updateApplicationInFirestore(userId: string, appId: string, updates: Partial<JobApplication>): Promise<void> {
  const docRef = doc(db, 'users', userId, 'applications', appId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteApplicationFromFirestore(userId: string, appId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'applications', appId);
  await deleteDoc(docRef);
}

// ==========================================
// RESUMES (SUBCOLLECTION: /users/{userId}/resumes)
// ==========================================

export async function getResumesFromFirestore(userId: string): Promise<ResumeData[]> {
  const colRef = collection(db, 'users', userId, 'resumes');
  const q = query(colRef, orderBy('updatedAt', 'desc'), limit(20));
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      ...data,
      id: docSnap.id,
    } as ResumeData;
  });
}

export async function saveResumeInFirestore(userId: string, resume: ResumeData): Promise<ResumeData> {
  const colRef = collection(db, 'users', userId, 'resumes');
  const resId = resume.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(colRef, resId);

  const cleanResume: ResumeData = {
    ...resume,
    id: resId,
    userId,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, cleanResume);
  await incrementUserUsage(userId, 'resumesCreated');
  return cleanResume;
}

export async function deleteResumeFromFirestore(userId: string, resumeId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'resumes', resumeId);
  await deleteDoc(docRef);
}
