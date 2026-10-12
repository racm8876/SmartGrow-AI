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

let currentAuthToken: string | null = null;

export function setAuthToken(token: string | null) {
  currentAuthToken = token;
}

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }
  return headers;
}

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
  const res = await fetch('/api/user', { headers: getHeaders() });
  return handleResponse(res);
}

export async function updateUserProfile(profile: {
  businessProfile?: Partial<User['businessProfile']>;
  jobSeekerProfile?: Partial<User['jobSeekerProfile']>;
  name?: string;
}): Promise<{ success: boolean; data: User }> {
  const res = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profile),
  });
  return handleResponse(res);
}

export async function updateUserPlan(plan: 'free' | 'pro' | 'business'): Promise<{ success: boolean; data: User }> {
  const res = await fetch('/api/user/plan', {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ plan }),
  });
  return handleResponse(res);
}

// Invoices
export async function getInvoices(): Promise<{ success: boolean; data: Invoice[] }> {
  const res = await fetch('/api/invoices', { headers: getHeaders() });
  return handleResponse(res);
}

export async function createInvoice(invoice: Partial<Invoice>): Promise<{ success: boolean; data: Invoice }> {
  const res = await fetch('/api/invoices', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(invoice),
  });
  return handleResponse(res);
}

export async function updateInvoice(id: string, invoice: Partial<Invoice>): Promise<{ success: boolean; data: Invoice }> {
  const res = await fetch(`/api/invoices/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(invoice),
  });
  return handleResponse(res);
}

export async function deleteInvoice(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/invoices/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// Quotations
export async function getQuotations(): Promise<{ success: boolean; data: Quotation[] }> {
  const res = await fetch('/api/quotations', { headers: getHeaders() });
  return handleResponse(res);
}

export async function createQuotation(quotation: Partial<Quotation>): Promise<{ success: boolean; data: Quotation }> {
  const res = await fetch('/api/quotations', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(quotation),
  });
  return handleResponse(res);
}

export async function updateQuotation(id: string, quotation: Partial<Quotation>): Promise<{ success: boolean; data: Quotation }> {
  const res = await fetch(`/api/quotations/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(quotation),
  });
  return handleResponse(res);
}

export async function deleteQuotation(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/quotations/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// Customers
export async function getCustomers(): Promise<{ success: boolean; data: Customer[] }> {
  const res = await fetch('/api/customers', { headers: getHeaders() });
  return handleResponse(res);
}

export async function createCustomer(customer: Partial<Customer>): Promise<{ success: boolean; data: Customer }> {
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(customer),
  });
  return handleResponse(res);
}

export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<{ success: boolean; data: Customer }> {
  const res = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(customer),
  });
  return handleResponse(res);
}

export async function deleteCustomer(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/customers/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// Job Applications
export async function getApplications(): Promise<{ success: boolean; data: JobApplication[] }> {
  const res = await fetch('/api/applications', { headers: getHeaders() });
  return handleResponse(res);
}

export async function createApplication(app: Partial<JobApplication>): Promise<{ success: boolean; data: JobApplication }> {
  const res = await fetch('/api/applications', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(app),
  });
  return handleResponse(res);
}

export async function updateApplication(id: string, app: Partial<JobApplication>): Promise<{ success: boolean; data: JobApplication }> {
  const res = await fetch(`/api/applications/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(app),
  });
  return handleResponse(res);
}

export async function deleteApplication(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/applications/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// Resumes
export async function getResumes(): Promise<{ success: boolean; data: ResumeData[] }> {
  const res = await fetch('/api/resumes', { headers: getHeaders() });
  return handleResponse(res);
}

export async function createResume(resume: ResumeData): Promise<{ success: boolean; data: ResumeData }> {
  const res = await fetch('/api/resumes', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(resume),
  });
  return handleResponse(res);
}

export async function updateResume(id: string, resume: ResumeData): Promise<{ success: boolean; data: ResumeData }> {
  const res = await fetch(`/api/resumes/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(resume),
  });
  return handleResponse(res);
}

// Gemini AI Endpoints
export async function generateBusinessContent(
  req: BusinessContentRequest
): Promise<{ success: boolean; data: BusinessContentResult }> {
  const res = await fetch('/api/ai/business-content', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(req),
  });
  return handleResponse(res);
}

export async function polishResumeBullet(params: {
  rawBullet: string;
  targetRole?: string;
  actionVerbTone?: string;
}): Promise<{ success: boolean; data: { original: string; enhanced: string; explanation: string } }> {
  const res = await fetch('/api/ai/resume-polish', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function analyzeResume(params: {
  resumeText: string;
  jobDescriptionText?: string;
  targetRole?: string;
}): Promise<{ success: boolean; data: ResumeAnalysisResult }> {
  const res = await fetch('/api/ai/analyze-resume', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function analyzeJobDescription(params: {
  jobDescriptionText: string;
  resumeSummary?: string;
}): Promise<{ success: boolean; data: JobDescriptionAnalysisResult }> {
  const res = await fetch('/api/ai/analyze-jd', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function getInterviewQuestions(params: {
  targetRole: string;
  difficulty?: 'fresher' | 'mid' | 'senior';
  topicCount?: number;
}): Promise<{ success: boolean; data: InterviewQuestion[] }> {
  const res = await fetch('/api/ai/interview-prep', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function evaluateInterviewAnswer(params: {
  question: string;
  userAnswer: string;
  targetRole: string;
}): Promise<{ success: boolean; data: InterviewPracticeFeedback }> {
  const res = await fetch('/api/ai/interview-feedback', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

// Billing & Razorpay
export async function createBillingOrder(planTier: 'pro' | 'business'): Promise<{
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  planTier: string;
  isDemoSandbox: boolean;
  message?: string;
}> {
  const res = await fetch('/api/billing/create-order', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ planTier }),
  });
  return handleResponse(res);
}

export async function verifyBillingPayment(params: {
  planTier: 'pro' | 'business';
  orderId: string;
  paymentId: string;
  signature?: string;
}): Promise<{
  success: boolean;
  plan: string;
  usage: User['usage'];
  receipt: {
    orderId: string;
    paymentId: string;
    timestamp: string;
  };
}> {
  const res = await fetch('/api/billing/verify-payment', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

// System Status
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
