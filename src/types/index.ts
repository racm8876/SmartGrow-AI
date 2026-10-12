export type UserRole = 'business' | 'job_seeker' | 'all';
export type PlanTier = 'free' | 'pro' | 'business';

export interface UserUsage {
  aiGenerationsUsed: number;
  aiGenerationsLimit: number;
  invoicesCreated: number;
  invoicesLimit: number;
  resumesCreated: number;
  resumesLimit: number;
}

export interface BusinessProfile {
  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  panNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  defaultGstRate: number;
  currency: string;
}

export interface JobSeekerProfile {
  fullName: string;
  targetRole: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  experienceYears: number;
  primarySkills: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: PlanTier;
  avatarUrl?: string;
  createdAt: string;
  usage: UserUsage;
  businessProfile: BusinessProfile;
  jobSeekerProfile: JobSeekerProfile;
}

// Invoices & Quotations
export interface InvoiceItem {
  id: string;
  description: string;
  hsnSac?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 18 for 18% GST, 0 for exempt
  discountPercent?: number;
  total: number;
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerGstin?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes: string;
  terms: string;
  isGstRegistered: boolean;
  createdAt: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'converted';

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerGstin?: string;
  issueDate: string;
  validUntil: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: QuotationStatus;
  notes: string;
  terms: string;
  isGstRegistered: boolean;
  convertedInvoiceId?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  phone: string;
  email: string;
  gstin?: string;
  address: string;
  city?: string;
  notes: string;
  totalInvoiced: number;
  pendingBalance: number;
  createdAt: string;
  updatedAt: string;
}

// AI Content Generation
export type BusinessContentType = 
  | 'whatsapp_reply'
  | 'social_caption'
  | 'festive_offer'
  | 'product_description'
  | 'marketing_email'
  | 'ad_copy';

export type ContentLanguage = 'english' | 'hindi' | 'hinglish';
export type ContentTone = 'professional' | 'friendly' | 'urgent' | 'festive' | 'persuasive';

export interface BusinessContentRequest {
  type: BusinessContentType;
  businessType: string;
  productOrService: string;
  targetAudience: string;
  language: ContentLanguage;
  tone: ContentTone;
  desiredLength: 'short' | 'medium' | 'detailed';
  offerDetails?: string;
  customerQuery?: string;
}

export interface BusinessContentVariation {
  title: string;
  content: string;
  keyPoints?: string[];
  hashtags?: string[];
  callToAction?: string;
}

export interface BusinessContentResult {
  variations: BusinessContentVariation[];
  language: string;
  tip: string;
}

// Resume & Job Types
export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  graduationYear: string;
  grade?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  bullets: string[];
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
}

export interface ResumeData {
  id: string;
  title: string;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    summary: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  experience: WorkExperience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  projects: Project[];
  certifications: Certification[];
  template: 'modern' | 'classic' | 'technical';
  updatedAt: string;
}

export interface ResumeAnalysisResult {
  matchScore: number;
  summary: string;
  matchedSkills: string[];
  missingKeywords: string[];
  formattingSuggestions: string[];
  bulletPointImprovements: {
    original: string;
    improved: string;
    reason: string;
  }[];
  roleSpecificTips: string[];
}

export interface JobDescriptionAnalysisResult {
  roleTitle: string;
  companySummary?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceRequirement: string;
  responsibilities: string[];
  importantKeywords: string[];
  potentialInterviewTopics: {
    topic: string;
    whyImportant: string;
    suggestedFocus: string;
  }[];
}

export interface InterviewQuestion {
  id: string;
  roleCategory: string;
  question: string;
  difficulty: 'fresher' | 'intermediate' | 'advanced';
  sampleAnswer: string;
  starTechniqueGuide?: string;
  followUpQuestions: string[];
  evaluatorLookout: string;
}

export interface InterviewPracticeFeedback {
  scoreOutOf10: number;
  feedback: string;
  strongPoints: string[];
  improvementPoints: string[];
  refinedAnswerSuggestion: string;
}

export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'wishlist';

export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  location: string;
  status: ApplicationStatus;
  appliedDate: string;
  interviewDate?: string;
  salaryExpectation?: string;
  notes: string;
  reminders: string;
  updatedAt: string;
}
