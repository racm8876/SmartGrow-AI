import {
  User,
  Invoice,
  Quotation,
  Customer,
  JobApplication,
  ResumeData,
  BusinessContentRequest,
  BusinessContentResult,
  ResumeAnalysisResult,
  JobDescriptionAnalysisResult,
  InterviewQuestion,
  InterviewPracticeFeedback,
} from '../types';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {
      errorMsg = `Server error: ${res.statusText} (${res.status})`;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

// User & Profile
export async function getUser(): Promise<{ success: boolean; data: User }> {
  const res = await fetch('/api/user');
  return handleResponse(res);
}

export async function updateUserProfile(profile: {
  businessProfile?: Partial<User['businessProfile']>;
  jobSeekerProfile?: Partial<User['jobSeekerProfile']>;
  name?: string;
}): Promise<{ success: boolean; data: User }> {
  const res = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  return handleResponse(res);
}

export async function updateUserPlan(plan: 'free' | 'pro' | 'business'): Promise<{ success: boolean; data: User }> {
  const res = await fetch('/api/user/plan', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });
  return handleResponse(res);
}

// Invoices
export async function getInvoices(): Promise<{ success: boolean; data: Invoice[] }> {
  const res = await fetch('/api/invoices');
  return handleResponse(res);
}

export async function createInvoice(invoice: Partial<Invoice>): Promise<{ success: boolean; data: Invoice }> {
  const res = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  return handleResponse(res);
}

export async function updateInvoice(id: string, invoice: Partial<Invoice>): Promise<{ success: boolean; data: Invoice }> {
  const res = await fetch(`/api/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  return handleResponse(res);
}

export async function deleteInvoice(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// Quotations
export async function getQuotations(): Promise<{ success: boolean; data: Quotation[] }> {
  const res = await fetch('/api/quotations');
  return handleResponse(res);
}

export async function createQuotation(quotation: Partial<Quotation>): Promise<{ success: boolean; data: Quotation }> {
  const res = await fetch('/api/quotations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quotation),
  });
  return handleResponse(res);
}

export async function updateQuotation(id: string, quotation: Partial<Quotation>): Promise<{ success: boolean; data: Quotation }> {
  const res = await fetch(`/api/quotations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quotation),
  });
  return handleResponse(res);
}

export async function convertQuotationToInvoice(id: string): Promise<{ success: boolean; data: { invoice: Invoice; quotation: Quotation } }> {
  const res = await fetch(`/api/quotations/${id}/convert-to-invoice`, { method: 'POST' });
  return handleResponse(res);
}

export async function deleteQuotation(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// Customers
export async function getCustomers(): Promise<{ success: boolean; data: Customer[] }> {
  const res = await fetch('/api/customers');
  return handleResponse(res);
}

export async function createCustomer(customer: Partial<Customer>): Promise<{ success: boolean; data: Customer }> {
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  return handleResponse(res);
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<{ success: boolean; data: Customer }> {
  const res = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  });
  return handleResponse(res);
}

export async function deleteCustomer(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// Job Applications
export async function getApplications(): Promise<{ success: boolean; data: JobApplication[] }> {
  const res = await fetch('/api/applications');
  return handleResponse(res);
}

export async function createApplication(application: Partial<JobApplication>): Promise<{ success: boolean; data: JobApplication }> {
  const res = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(application),
  });
  return handleResponse(res);
}

export async function updateApplication(id: string, application: Partial<JobApplication>): Promise<{ success: boolean; data: JobApplication }> {
  const res = await fetch(`/api/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(application),
  });
  return handleResponse(res);
}

export async function deleteApplication(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

// Resumes
export async function getResumes(): Promise<{ success: boolean; data: ResumeData[] }> {
  const res = await fetch('/api/resumes');
  return handleResponse(res);
}

export async function createResume(resume: Partial<ResumeData>): Promise<{ success: boolean; data: ResumeData }> {
  const res = await fetch('/api/resumes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resume),
  });
  return handleResponse(res);
}

export async function updateResume(id: string, resume: Partial<ResumeData>): Promise<{ success: boolean; data: ResumeData }> {
  const res = await fetch(`/api/resumes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resume),
  });
  return handleResponse(res);
}

// AI Endpoints
export async function generateBusinessContent(params: BusinessContentRequest): Promise<{ success: boolean; data: BusinessContentResult }> {
  const res = await fetch('/api/ai/business-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function polishResumeContent(params: {
  sectionType: string;
  rawInput: string;
  targetRole?: string;
  yearsOfExperience?: number;
}): Promise<{
  success: boolean;
  data: {
    polishedBullets: { text: string; actionVerbUsed: string; atsImpact: string }[];
    executiveSummarySuggestion: string;
    atsKeywordsIncluded: string[];
  };
}> {
  const res = await fetch('/api/ai/resume-polish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function analyzeResume(params: {
  resumeText: string;
  jobDescriptionText: string;
  targetRole?: string;
}): Promise<{ success: boolean; data: ResumeAnalysisResult }> {
  const res = await fetch('/api/ai/analyze-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function analyzeJobDescription(jobDescriptionText: string): Promise<{ success: boolean; data: JobDescriptionAnalysisResult }> {
  const res = await fetch('/api/ai/analyze-jd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobDescriptionText }),
  });
  return handleResponse(res);
}

export async function getInterviewQuestions(params: {
  role: string;
  difficulty: string;
  focusArea?: string;
}): Promise<{ success: boolean; data: { questions: InterviewQuestion[] } }> {
  const res = await fetch('/api/ai/interview-prep', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function evaluateInterviewAnswer(params: {
  question: string;
  candidateAnswer: string;
  targetRole?: string;
}): Promise<{ success: boolean; data: InterviewPracticeFeedback }> {
  const res = await fetch('/api/ai/interview-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

// Billing
export async function createBillingOrder(planTier: 'pro' | 'business'): Promise<{
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  planTier: string;
  isDemoSandbox: boolean;
  message: string;
}> {
  const res = await fetch('/api/billing/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planTier }),
  });
  return handleResponse(res);
}

export async function verifyBillingPayment(params: {
  planTier: 'pro' | 'business';
  orderId: string;
  paymentId: string;
}): Promise<{ success: boolean; plan: string; usage: any; receipt?: any }> {
  const res = await fetch('/api/billing/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function getSystemStatus(): Promise<{
  geminiConfigured: boolean;
  razorpayConfigured: boolean;
  firebaseConfigured: boolean;
  environment: string;
  serverTime: string;
}> {
  const res = await fetch('/api/system/status');
  return handleResponse(res);
}
