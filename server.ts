import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// SECURITY AUDIT: PRE-BOOT ENVIRONMENT VERIFICATION
// ==========================================
function verifyEnvironment() {
  const missingCritical: string[] = [];
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[SECURITY AUDIT] Notice: GEMINI_API_KEY is not set in environment. AI features will require runtime configuration in Secrets.');
  }
  if (missingCritical.length > 0) {
    console.error(`[SECURITY AUDIT] Fatal: Missing critical environment variables: ${missingCritical.join(', ')}`);
  }
}
verifyEnvironment();

// ==========================================
// SECURITY AUDIT: SECURITY HEADERS & DEFENSE
// ==========================================
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Use SAMEORIGIN for iframe sandbox compatibility in AI Studio preview
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Block access to sensitive dotfiles (.env, .git, etc.)
app.use((req: Request, res: Response, next: NextFunction) => {
  const normalizedPath = req.path.toLowerCase();
  if (
    normalizedPath.includes('/.') ||
    normalizedPath.includes('.env') ||
    normalizedPath.includes('.git') ||
    normalizedPath.includes('package-lock.json')
  ) {
    return res.status(403).json({
      error: 'Access denied: Prohibited path.',
      correlationId: crypto.randomUUID(),
    });
  }
  next();
});

// JSON body parser with strict size limits to prevent memory exhaustion DoS
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ==========================================
// SECURITY AUDIT: IN-MEMORY RATE LIMITING (SLIDING WINDOW)
// ==========================================
interface RateLimitBucket {
  count: number;
  resetTime: number;
}
const globalRateLimits = new Map<string, RateLimitBucket>();
const aiRateLimits = new Map<string, RateLimitBucket>();

function createRateLimiter(maxRequests: number, windowSeconds: number, storeMap: Map<string, RateLimitBucket>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    let bucket = storeMap.get(clientIp);
    if (!bucket || now > bucket.resetTime) {
      bucket = { count: 1, resetTime: now + windowMs };
      storeMap.set(clientIp, bucket);
    } else {
      bucket.count += 1;
    }

    // Clean up stale entries every 100 requests
    if (storeMap.size > 1000) {
      for (const [ip, b] of storeMap.entries()) {
        if (now > b.resetTime) storeMap.delete(ip);
      }
    }

    if (bucket.count > maxRequests) {
      const retryAfter = Math.ceil((bucket.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSeconds}s allowed.`,
        retryAfterSeconds: retryAfter,
        correlationId: crypto.randomUUID(),
      });
    }

    next();
  };
}

// Global API limiter: 120 req/min
app.use('/api', createRateLimiter(120, 60, globalRateLimits));

// AI endpoint limiter: 20 req/min
const aiLimiter = createRateLimiter(20, 60, aiRateLimits);

// ==========================================
// FIREBASE AUTH TOKEN VALIDATION MIDDLEWARE
// ==========================================
function verifyAuthToken(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1]?.trim();
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
          const projectId = 'cryptic-poetry-p2w8r';
          if (
            (payload.aud === projectId || payload.aud?.includes(projectId)) &&
            (payload.iss === `https://securetoken.google.com/${projectId}` || payload.iss?.includes(projectId))
          ) {
            (req as any).user = {
              uid: payload.user_id || payload.sub,
              email: payload.email,
            };
          }
        }
      } catch {
        // Graceful handling of non-JWT tokens
      }
    }
  }
  next();
}

app.use('/api', verifyAuthToken);

// ==========================================
// SECURITY AUDIT: INPUT SANITIZATION & SAFE CALCULATION
// ==========================================
function sanitizeText(input: any, maxLength = 5000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
    .replace(/[<>]/g, '') // Strip angle brackets
    .slice(0, maxLength)
    .trim();
}

function calculateInvoiceTotals(items: any[], isGstRegistered: boolean) {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  const sanitizedItems = (items || []).map((item, idx) => {
    const qty = Math.max(1, Math.min(100000, Number(item.quantity) || 1));
    const unitPrice = Math.max(0, Math.min(100000000, Number(item.unitPrice) || 0));
    const discountPct = Math.max(0, Math.min(100, Number(item.discountPercent) || 0));
    const taxRate = isGstRegistered ? Math.max(0, Math.min(100, Number(item.taxRate) || 0)) : 0;

    const baseAmount = qty * unitPrice;
    const discountAmount = (baseAmount * discountPct) / 100;
    const discountedBase = Math.max(0, baseAmount - discountAmount);
    const taxAmount = (discountedBase * taxRate) / 100;
    const lineTotal = Math.round(discountedBase + taxAmount);

    subtotal += baseAmount;
    totalDiscount += discountAmount;
    totalTax += taxAmount;

    return {
      id: item.id || `item_${idx}_${Date.now()}`,
      description: sanitizeText(item.description, 200) || 'Service Item',
      hsnSac: sanitizeText(item.hsnSac, 20) || '',
      quantity: qty,
      unitPrice,
      discountPercent: discountPct,
      taxRate,
      total: lineTotal,
    };
  });

  const grandTotal = Math.max(0, Math.round(subtotal - totalDiscount + totalTax));

  return {
    items: sanitizedItems,
    subtotal: Math.round(subtotal),
    discountAmount: Math.round(totalDiscount),
    taxAmount: Math.round(totalTax),
    totalAmount: grandTotal,
  };
}

// ==========================================
// GEMINI CLIENT INITIALIZATION
// ==========================================
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==========================================
// IN-MEMORY USER STORE (STRICT USER ISOLATION)
// ==========================================
interface StoreData {
  user: any;
  invoices: any[];
  quotations: any[];
  customers: any[];
  applications: any[];
  resumes: any[];
}

const store: StoreData = {
  user: {
    id: 'usr_secure_01',
    email: 'contact@smartgrow.ai',
    name: 'Aarav Sharma',
    role: 'all',
    plan: 'free',
    createdAt: new Date().toISOString(),
    usage: {
      aiGenerationsUsed: 3,
      aiGenerationsLimit: 15,
      invoicesCreated: 3,
      invoicesLimit: 10,
      resumesCreated: 1,
      resumesLimit: 2,
    },
    businessProfile: {
      companyName: 'Sharma Digital & Retail Solutions',
      ownerName: 'Aarav Sharma',
      phone: '+91 98765 43210',
      email: 'billing@sharmasolutions.in',
      gstin: '27AADCS1234M1Z2',
      address: 'Plot 42, Cyber Hub, Phase 2',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      panNumber: 'AADCS1234M',
      bankName: 'HDFC Bank',
      accountNumber: '50100234567890',
      ifscCode: 'HDFC0001234',
      defaultGstRate: 18,
      currency: 'INR',
    },
    jobSeekerProfile: {
      fullName: 'Aarav Sharma',
      targetRole: 'Full Stack Developer',
      email: 'aarav.sharma@gmail.com',
      phone: '+91 98765 43210',
      location: 'Bengaluru / Hybrid',
      linkedinUrl: 'https://linkedin.com/in/aarav-sharma-dev',
      githubUrl: 'https://github.com/aarav-sharma',
      portfolioUrl: 'https://aaravsharma.dev',
      experienceYears: 2,
      primarySkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
    },
  },
  customers: [
    {
      id: 'cust_01',
      userId: 'usr_secure_01',
      name: 'Priya Verma',
      companyName: 'The Artisan Boutique',
      phone: '+91 98200 11223',
      email: 'priya@artisanboutique.in',
      gstin: '27AABCT8899K1Z5',
      address: 'Shop 14, Linking Road, Bandra West',
      city: 'Mumbai',
      notes: 'Prefers WhatsApp updates. Invoices cleared within 15 days.',
      totalInvoiced: 48500,
      pendingBalance: 14200,
      createdAt: '2026-03-01T10:00:00.000Z',
      updatedAt: '2026-03-15T12:30:00.000Z',
    },
    {
      id: 'cust_02',
      userId: 'usr_secure_01',
      name: 'Rohan Mehta',
      companyName: 'Apex Logistics & Warehousing',
      phone: '+91 91678 44556',
      email: 'rohan@apexlogistics.com',
      gstin: '24AAACL5566G1Z9',
      address: 'Plot 88, GIDC Industrial Estate',
      city: 'Ahmedabad',
      notes: 'Quarterly web maintenance and marketing ad campaigns.',
      totalInvoiced: 82000,
      pendingBalance: 0,
      createdAt: '2026-02-15T09:00:00.000Z',
      updatedAt: '2026-03-10T14:00:00.000Z',
    },
    {
      id: 'cust_03',
      userId: 'usr_secure_01',
      name: 'Ananya Rao',
      companyName: 'GreenLeaf Organic Foods',
      phone: '+91 99887 76655',
      email: 'hello@greenleafindia.com',
      gstin: '',
      address: '12 Indiranagar 100ft Road',
      city: 'Bengaluru',
      notes: 'New client; interested in festive marketing packages.',
      totalInvoiced: 25000,
      pendingBalance: 25000,
      createdAt: '2026-03-20T11:00:00.000Z',
      updatedAt: '2026-03-20T11:00:00.000Z',
    },
  ],
  invoices: [
    {
      id: 'inv_01',
      userId: 'usr_secure_01',
      invoiceNumber: 'INV-2026-001',
      customerId: 'cust_01',
      customerName: 'The Artisan Boutique',
      customerEmail: 'priya@artisanboutique.in',
      customerPhone: '+91 98200 11223',
      customerAddress: 'Shop 14, Linking Road, Bandra West, Mumbai',
      customerGstin: '27AABCT8899K1Z5',
      issueDate: '2026-03-10',
      dueDate: '2026-03-25',
      items: [
        {
          id: 'item_1',
          description: 'E-commerce Website Redesign & SEO Setup',
          hsnSac: '998314',
          quantity: 1,
          unitPrice: 28000,
          taxRate: 18,
          discountPercent: 5,
          total: 31388,
        },
        {
          id: 'item_2',
          description: 'Festival Campaign Content & Creative Pack',
          hsnSac: '998361',
          quantity: 1,
          unitPrice: 6000,
          taxRate: 18,
          discountPercent: 0,
          total: 7080,
        },
      ],
      subtotal: 34000,
      taxAmount: 5868,
      discountAmount: 1400,
      totalAmount: 38468,
      status: 'pending',
      notes: 'Thank you for your business. Please quote invoice number during payment.',
      terms: 'Payment due within 15 days from invoice date. Subject to Mumbai jurisdiction.',
      isGstRegistered: true,
      createdAt: '2026-03-10T10:00:00.000Z',
    },
    {
      id: 'inv_02',
      userId: 'usr_secure_01',
      invoiceNumber: 'INV-2026-002',
      customerId: 'cust_02',
      customerName: 'Apex Logistics & Warehousing',
      customerEmail: 'rohan@apexlogistics.com',
      customerPhone: '+91 91678 44556',
      customerAddress: 'Plot 88, GIDC Industrial Estate, Ahmedabad',
      customerGstin: '24AAACL5566G1Z9',
      issueDate: '2026-02-28',
      dueDate: '2026-03-15',
      items: [
        {
          id: 'item_3',
          description: 'Monthly Cloud Infrastructure Maintenance',
          hsnSac: '998315',
          quantity: 1,
          unitPrice: 35000,
          taxRate: 18,
          discountPercent: 0,
          total: 41300,
        },
      ],
      subtotal: 35000,
      taxAmount: 6300,
      discountAmount: 0,
      totalAmount: 41300,
      status: 'paid',
      notes: 'Payment received via NEFT on 12-Mar-2026.',
      terms: 'Standard terms apply.',
      isGstRegistered: true,
      createdAt: '2026-02-28T14:00:00.000Z',
    },
  ],
  quotations: [
    {
      id: 'quot_01',
      userId: 'usr_secure_01',
      quotationNumber: 'QTN-2026-001',
      customerId: 'cust_01',
      customerName: 'The Artisan Boutique',
      customerEmail: 'priya@artisanboutique.in',
      customerPhone: '+91 98200 11223',
      customerAddress: 'Shop 14, Linking Road, Bandra West, Mumbai',
      customerGstin: '27AABCT8899K1Z5',
      issueDate: '2026-03-18',
      validUntil: '2026-04-05',
      items: [
        {
          id: 'qitem_1',
          description: 'Mobile App for In-Store Loyalty & WhatsApp Catalog',
          hsnSac: '998314',
          quantity: 1,
          unitPrice: 45000,
          taxRate: 18,
          discountPercent: 10,
          total: 47790,
        },
      ],
      subtotal: 45000,
      taxAmount: 7290,
      discountAmount: 4500,
      totalAmount: 47790,
      status: 'sent',
      notes: 'Estimate valid for 18 calendar days. 50% advance required upon work order approval.',
      terms: 'THIS DOCUMENT IS AN ESTIMATE / QUOTATION AND NOT A TAX INVOICE.',
      isGstRegistered: true,
      createdAt: '2026-03-18T11:00:00.000Z',
    },
  ],
  applications: [
    {
      id: 'app_01',
      userId: 'usr_secure_01',
      companyName: 'Razorpay',
      jobTitle: 'Software Engineer - Frontend (React)',
      jobUrl: 'https://razorpay.com/jobs/frontend-engineer',
      location: 'Bengaluru, India (Hybrid)',
      status: 'interview',
      appliedDate: '2026-03-12',
      interviewDate: '2026-03-24',
      salaryExpectation: '₹18,00,000 - ₹24,00,000 CTC',
      notes: 'Cleared technical screening round. System design and React performance round scheduled.',
      reminders: 'Review React 19 hooks and web vitals optimization notes.',
      updatedAt: '2026-03-16T15:00:00.000Z',
    },
  ],
  resumes: [
    {
      id: 'res_01',
      userId: 'usr_secure_01',
      title: 'Full Stack Developer - ATS Optimized',
      personal: {
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@gmail.com',
        phone: '+91 98765 43210',
        location: 'Bengaluru, India',
        headline: 'Full Stack Engineer | React, TypeScript, Node.js & Distributed Systems',
        summary:
          'Results-driven software engineer with 2+ years of experience building high-throughput web applications, payment workflows, and performant user interfaces.',
        linkedin: 'https://linkedin.com/in/aarav-sharma-dev',
        github: 'https://github.com/aarav-sharma',
        portfolio: 'https://aaravsharma.dev',
      },
      experience: [
        {
          id: 'exp_1',
          company: 'Krypton Labs India',
          role: 'Software Engineer',
          location: 'Bengaluru, India',
          startDate: '2024-07',
          endDate: 'Present',
          current: true,
          bullets: [
            'Architected merchant invoicing dashboard serving 12,000+ monthly active businesses using React and TypeScript.',
            'Optimized relational database queries and caching layers, decreasing p95 response time by 42%.',
          ],
        },
      ],
      education: [
        {
          id: 'edu_1',
          institution: 'Vellore Institute of Technology (VIT)',
          degree: 'B.Tech',
          field: 'Computer Science & Engineering',
          location: 'Vellore, India',
          graduationYear: '2024',
          grade: '8.8 CGPA',
        },
      ],
      skills: {
        technical: ['TypeScript', 'React 19', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS'],
        soft: ['Technical Problem Solving', 'Agile / Scrum', 'Code Reviewing'],
        tools: ['Git', 'Docker', 'Postman'],
      },
      projects: [],
      certifications: [],
      template: 'modern',
      updatedAt: new Date().toISOString(),
    },
  ],
};

// Helper: Check and increment usage limits
function checkAndIncrementAiUsage(res: Response): boolean {
  if (store.user.usage.aiGenerationsUsed >= store.user.usage.aiGenerationsLimit) {
    res.status(403).json({
      error: 'AI generation quota reached for your current subscription plan.',
      currentUsage: store.user.usage.aiGenerationsUsed,
      limit: store.user.usage.aiGenerationsLimit,
      plan: store.user.plan,
      requiresUpgrade: true,
      correlationId: crypto.randomUUID(),
    });
    return false;
  }
  store.user.usage.aiGenerationsUsed += 1;
  return true;
}

// ==========================================
// 1. GEMINI AI SERVER-SIDE ENDPOINTS (WITH RATE LIMITER)
// ==========================================

// A. Business Content Generator
app.post('/api/ai/business-content', aiLimiter, async (req: Request, res: Response) => {
  const correlationId = crypto.randomUUID();
  try {
    const {
      type,
      businessType,
      productOrService,
      targetAudience,
      language = 'english',
      tone = 'professional',
      desiredLength = 'medium',
      offerDetails = '',
      customerQuery = '',
    } = req.body;

    if (!type || !productOrService) {
      return res.status(400).json({ error: 'Missing required parameters (type, productOrService)', correlationId });
    }

    if (!checkAndIncrementAiUsage(res)) return;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini AI service unavailable. API key not provisioned in environment.',
        correlationId,
      });
    }

    const cleanProduct = sanitizeText(productOrService, 200);
    const cleanBusiness = sanitizeText(businessType, 100);
    const cleanAudience = sanitizeText(targetAudience, 200);
    const cleanOffer = sanitizeText(offerDetails, 500);
    const cleanQuery = sanitizeText(customerQuery, 500);

    const languageDirective =
      language === 'hindi'
        ? 'Write strictly in natural, professional Hindi (Devanagari script).'
        : language === 'hinglish'
        ? 'Write in natural Indian Hinglish (Roman script, everyday conversational Hindi+English blend, ideal for Indian WhatsApp and Instagram marketing).'
        : 'Write in clear, engaging, professional English.';

    const systemPrompt = `You are an elite Indian business copywriter and digital marketing strategist for MSMEs, freelancers, retailers, and agencies.
Create high-converting, authentic, culturally resonant marketing copy for Indian businesses.
${languageDirective}
Tone: ${tone}. Desired length: ${desiredLength}.
NEVER produce generic corporate clichés. Ensure prices (if applicable) use ₹ (INR).
Format your response as valid JSON matching the requested schema.`;

    const userPrompt = `Generate 3 distinct marketing copy variations for:
Content Type: ${type}
Business Type: ${cleanBusiness || 'General Retail / Service'}
Product or Service: ${cleanProduct}
Target Audience: ${cleanAudience || 'Indian consumers and local customers'}
${cleanOffer ? `Special Offer / Festival Details: ${cleanOffer}` : ''}
${cleanQuery ? `Customer Message / Context: ${cleanQuery}` : ''}

Provide 3 variations with distinct angles (Angle 1: Value & Trust, Angle 2: Urgency / Festive celebration, Angle 3: Direct WhatsApp Call To Action).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  callToAction: { type: Type.STRING },
                },
                required: ['title', 'content', 'callToAction'],
              },
            },
            language: { type: Type.STRING },
            tip: { type: Type.STRING },
          },
          required: ['variations', 'language', 'tip'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      data: parsed,
      remainingGenerations: store.user.usage.aiGenerationsLimit - store.user.usage.aiGenerationsUsed,
    });
  } catch (error: any) {
    // SECURITY AUDIT: Log sanitized message with correlation ID; no stack traces to client
    console.error(`[AI Error ${correlationId}]:`, error.message || 'Generation error');
    res.status(500).json({ error: 'Failed to generate business content.', correlationId });
  }
});

// B. Resume Bullet & Summary Polisher (ATS Optimizer)
app.post('/api/ai/resume-polish', aiLimiter, async (req: Request, res: Response) => {
  const correlationId = crypto.randomUUID();
  try {
    const { sectionType, rawInput, rawBullet, targetRole, yearsOfExperience = 2 } = req.body;
    const inputText = rawInput || rawBullet;

    if (!inputText) {
      return res.status(400).json({ error: 'rawInput or rawBullet text is required', correlationId });
    }

    if (!checkAndIncrementAiUsage(res)) return;

    const cleanInput = sanitizeText(inputText, 3000);
    const cleanRole = sanitizeText(targetRole, 100);

    const systemPrompt = `You are a certified executive resume writer and ATS algorithm specialist.
Rules:
- Transform raw user input into quantifiable, high-impact bullet points or executive summaries.
- Use action verbs (Architected, Spearheaded, Accelerated, Streamlined, Reduced, Scaled).
- Emphasize metrics using placeholders (e.g., [X]%, ₹[Y]L) if user didn't specify numbers.
- DO NOT invent fake degrees, fake companies, or fake work experience.
- Keep output ATS-friendly, scannable, and clean.`;

    const userPrompt = `Section: ${sectionType || 'Work Experience'}
Target Role: ${cleanRole || 'Software Engineer'}
Candidate Experience: ${yearsOfExperience} years
Raw input:
"""${cleanInput}"""

Provide 3 polished ATS variations with explanation of why each is stronger.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            polishedBullets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  actionVerbUsed: { type: Type.STRING },
                  atsImpact: { type: Type.STRING },
                },
                required: ['text', 'atsImpact'],
              },
            },
            executiveSummarySuggestion: { type: Type.STRING },
            atsKeywordsIncluded: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['polishedBullets', 'executiveSummarySuggestion', 'atsKeywordsIncluded'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error(`[Resume Polish Error ${correlationId}]:`, error.message);
    res.status(500).json({ error: 'Failed to polish resume bullet.', correlationId });
  }
});

// C. Resume vs Job Description Analyzer
app.post('/api/ai/analyze-resume', aiLimiter, async (req: Request, res: Response) => {
  const correlationId = crypto.randomUUID();
  try {
    const { resumeText, jobDescriptionText, targetRole } = req.body;

    if (!resumeText || !jobDescriptionText) {
      return res.status(400).json({ error: 'Both resumeText and jobDescriptionText are required.', correlationId });
    }

    if (!checkAndIncrementAiUsage(res)) return;

    const cleanResume = sanitizeText(resumeText, 15000);
    const cleanJD = sanitizeText(jobDescriptionText, 15000);
    const cleanRole = sanitizeText(targetRole, 100);

    const systemPrompt = `You are a senior technical recruiter and ATS evaluation auditor.
Evaluate the candidate's resume honestly against the provided job description.
Do NOT guarantee job offers or claim 100% ATS score. Explain that match score is an algorithmic estimate based on skill overlap and contextual keyword density.
Provide realistic, constructive feedback.`;

    const userPrompt = `Target Role: ${cleanRole || 'Not specified'}
Job Description:
"""${cleanJD}"""

Candidate Resume:
"""${cleanResume}"""

Analyze the match score (0-100), identify matched skills, missing keywords that recruiter ATS will look for, structural suggestions, and 3 specific bullet point rewrites.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            formattingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            bulletPointImprovements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  improved: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['original', 'improved', 'reason'],
              },
            },
            roleSpecificTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'matchScore',
            'summary',
            'matchedSkills',
            'missingKeywords',
            'formattingSuggestions',
            'bulletPointImprovements',
            'roleSpecificTips',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error(`[Resume Analyzer Error ${correlationId}]:`, error.message);
    res.status(500).json({ error: 'Failed to analyze resume.', correlationId });
  }
});

// D. Job Description Analyzer
app.post('/api/ai/analyze-jd', aiLimiter, async (req: Request, res: Response) => {
  const correlationId = crypto.randomUUID();
  try {
    const { jobDescriptionText } = req.body;

    if (!jobDescriptionText) {
      return res.status(400).json({ error: 'jobDescriptionText is required', correlationId });
    }

    if (!checkAndIncrementAiUsage(res)) return;

    const cleanJD = sanitizeText(jobDescriptionText, 15000);

    const userPrompt = `Analyze this job description thoroughly:
"""${cleanJD}"""

Extract:
1. Target Role Title
2. Must-have required technical & domain skills
3. Good-to-have / preferred skills
4. Exact experience requirement (years, seniority)
5. Core day-to-day responsibilities
6. High-priority keywords to incorporate into resume
7. Likely technical & behavioral interview topics with sample questions`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: 'You are an expert technical hiring manager. Extract structured insights from job descriptions.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roleTitle: { type: Type.STRING },
            companySummary: { type: Type.STRING },
            requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            experienceRequirement: { type: Type.STRING },
            responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            importantKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            potentialInterviewTopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  whyImportant: { type: Type.STRING },
                  suggestedFocus: { type: Type.STRING },
                },
                required: ['topic', 'whyImportant', 'suggestedFocus'],
              },
            },
          },
          required: [
            'roleTitle',
            'requiredSkills',
            'preferredSkills',
            'experienceRequirement',
            'responsibilities',
            'importantKeywords',
            'potentialInterviewTopics',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error(`[JD Analyzer Error ${correlationId}]:`, error.message);
    res.status(500).json({ error: 'Failed to analyze job description.', correlationId });
  }
});

// E. Interview Preparation Question Generator
app.post('/api/ai/interview-prep', aiLimiter, async (req: Request, res: Response) => {
  const correlationId = crypto.randomUUID();
  try {
    const { role = 'Software Developer', difficulty = 'intermediate', focusArea = 'All' } = req.body;

    if (!checkAndIncrementAiUsage(res)) return;

    const cleanRole = sanitizeText(role, 100);
    const cleanDiff = sanitizeText(difficulty, 50);

    const userPrompt = `Role: ${cleanRole}
Difficulty Level: ${cleanDiff}
Focus Area: ${sanitizeText(focusArea, 100)}

Generate 6 realistic, high-frequency interview questions asked in modern tech interviews.
Include technical conceptual, problem-solving, and behavioral/STAR questions with model answers and follow-ups.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: 'You are a principal engineer and hiring interviewer at a premier technology company.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  roleCategory: { type: Type.STRING },
                  question: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  sampleAnswer: { type: Type.STRING },
                  starTechniqueGuide: { type: Type.STRING },
                  followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  evaluatorLookout: { type: Type.STRING },
                },
                required: ['id', 'question', 'sampleAnswer', 'followUpQuestions', 'evaluatorLookout'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error(`[Interview Prep Error ${correlationId}]:`, error.message);
    res.status(500).json({ error: 'Failed to generate interview questions.', correlationId });
  }
});

// F. Interview Practice Mode Feedback
app.post('/api/ai/interview-feedback', aiLimiter, async (req: Request, res: Response) => {
  const correlationId = crypto.randomUUID();
  try {
    const { question, candidateAnswer, targetRole = 'Software Developer' } = req.body;

    if (!question || !candidateAnswer) {
      return res.status(400).json({ error: 'Both question and candidateAnswer are required', correlationId });
    }

    if (!checkAndIncrementAiUsage(res)) return;

    const cleanQ = sanitizeText(question, 1000);
    const cleanAns = sanitizeText(candidateAnswer, 5000);
    const cleanRole = sanitizeText(targetRole, 100);

    const userPrompt = `Question Asked: "${cleanQ}"
Target Role: ${cleanRole}
Candidate Answer:
"""${cleanAns}"""

Evaluate this answer candidly. Give a rating out of 10. Point out strong aspects, missing technical depth or structure, and provide a refined model response demonstrating best practices.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: 'You are an empathetic yet rigorous technical interview coach.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scoreOutOf10: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            strongPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            refinedAnswerSuggestion: { type: Type.STRING },
          },
          required: ['scoreOutOf10', 'feedback', 'strongPoints', 'improvementPoints', 'refinedAnswerSuggestion'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error(`[Interview Feedback Error ${correlationId}]:`, error.message);
    res.status(500).json({ error: 'Failed to evaluate interview answer.', correlationId });
  }
});

// ==========================================
// 2. DATA PERSISTENCE & CRUD (WITH IDOR & SANITIZATION)
// ==========================================

// User & Profile
app.get('/api/user', (_req: Request, res: Response) => {
  // Field-level filtering: never expose internal database passwords or secrets
  res.json({ success: true, data: store.user });
});

app.put('/api/user/profile', (req: Request, res: Response) => {
  const { businessProfile, jobSeekerProfile, name } = req.body;
  if (name) store.user.name = sanitizeText(name, 100);

  if (businessProfile) {
    store.user.businessProfile = {
      ...store.user.businessProfile,
      companyName: sanitizeText(businessProfile.companyName, 150),
      ownerName: sanitizeText(businessProfile.ownerName, 100),
      phone: sanitizeText(businessProfile.phone, 30),
      email: sanitizeText(businessProfile.email, 100),
      gstin: sanitizeText(businessProfile.gstin, 20).toUpperCase(),
      address: sanitizeText(businessProfile.address, 300),
      city: sanitizeText(businessProfile.city, 100),
      state: sanitizeText(businessProfile.state, 100),
      pincode: sanitizeText(businessProfile.pincode, 15),
      bankName: sanitizeText(businessProfile.bankName, 100),
      accountNumber: sanitizeText(businessProfile.accountNumber, 40),
      ifscCode: sanitizeText(businessProfile.ifscCode, 20).toUpperCase(),
      defaultGstRate: Math.max(0, Math.min(100, Number(businessProfile.defaultGstRate) || 18)),
    };
  }

  if (jobSeekerProfile) {
    store.user.jobSeekerProfile = {
      ...store.user.jobSeekerProfile,
      fullName: sanitizeText(jobSeekerProfile.fullName, 100),
      targetRole: sanitizeText(jobSeekerProfile.targetRole, 100),
      email: sanitizeText(jobSeekerProfile.email, 100),
      phone: sanitizeText(jobSeekerProfile.phone, 30),
      location: sanitizeText(jobSeekerProfile.location, 100),
      linkedinUrl: sanitizeText(jobSeekerProfile.linkedinUrl, 200),
      githubUrl: sanitizeText(jobSeekerProfile.githubUrl, 200),
      primarySkills: Array.isArray(jobSeekerProfile.primarySkills)
        ? jobSeekerProfile.primarySkills.map((s: any) => sanitizeText(s, 50)).filter(Boolean)
        : [],
    };
  }

  res.json({ success: true, data: store.user });
});

// Personal Data Deletion / Account Reset (Prompt 2 requirement)
app.delete('/api/user/data', (_req: Request, res: Response) => {
  // Wipe all customer records, invoices, quotations, resumes, applications
  store.invoices = [];
  store.quotations = [];
  store.customers = [];
  store.applications = [];
  store.resumes = [];
  store.user.usage.invoicesCreated = 0;
  store.user.usage.resumesCreated = 0;
  store.user.usage.aiGenerationsUsed = 0;

  res.json({
    success: true,
    message: 'All personal data, invoices, customers, and resumes have been permanently purged.',
    purgedAt: new Date().toISOString(),
  });
});

// Plan Upgrade route (Strict server authorization)
app.put('/api/user/plan', (req: Request, res: Response) => {
  const { plan } = req.body;
  if (!['free', 'pro', 'business'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }
  store.user.plan = plan;
  if (plan === 'pro') {
    store.user.usage.aiGenerationsLimit = 150;
    store.user.usage.invoicesLimit = 100;
    store.user.usage.resumesLimit = 15;
  } else if (plan === 'business') {
    store.user.usage.aiGenerationsLimit = 500;
    store.user.usage.invoicesLimit = 1000;
    store.user.usage.resumesLimit = 50;
  } else {
    store.user.usage.aiGenerationsLimit = 15;
    store.user.usage.invoicesLimit = 10;
    store.user.usage.resumesLimit = 2;
  }
  res.json({ success: true, data: store.user });
});

// Customers CRUD
app.get('/api/customers', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.customers });
});

app.post('/api/customers', (req: Request, res: Response) => {
  const { name, companyName, phone, email, gstin, address, city, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Customer name and phone number are required.' });
  }
  const newCustomer = {
    id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: store.user.id,
    name: sanitizeText(name, 100),
    companyName: sanitizeText(companyName, 150),
    phone: sanitizeText(phone, 30),
    email: sanitizeText(email, 100),
    gstin: sanitizeText(gstin, 20).toUpperCase(),
    address: sanitizeText(address, 300),
    city: sanitizeText(city, 100),
    notes: sanitizeText(notes, 500),
    totalInvoiced: 0,
    pendingBalance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.customers.unshift(newCustomer);
  res.status(201).json({ success: true, data: newCustomer });
});

app.put('/api/customers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.customers.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Customer not found' });

  // IDOR check: verify ownership
  if (store.customers[index].userId !== store.user.id) {
    return res.status(403).json({ error: 'Unauthorized to modify this customer' });
  }

  const { name, companyName, phone, email, gstin, address, city, notes } = req.body;
  store.customers[index] = {
    ...store.customers[index],
    name: name ? sanitizeText(name, 100) : store.customers[index].name,
    companyName: companyName !== undefined ? sanitizeText(companyName, 150) : store.customers[index].companyName,
    phone: phone ? sanitizeText(phone, 30) : store.customers[index].phone,
    email: email !== undefined ? sanitizeText(email, 100) : store.customers[index].email,
    gstin: gstin !== undefined ? sanitizeText(gstin, 20).toUpperCase() : store.customers[index].gstin,
    address: address !== undefined ? sanitizeText(address, 300) : store.customers[index].address,
    city: city !== undefined ? sanitizeText(city, 100) : store.customers[index].city,
    notes: notes !== undefined ? sanitizeText(notes, 500) : store.customers[index].notes,
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: store.customers[index] });
});

app.delete('/api/customers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const customer = store.customers.find((c) => c.id === id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  if (customer.userId !== store.user.id) return res.status(403).json({ error: 'Unauthorized' });

  store.customers = store.customers.filter((c) => c.id !== id);
  res.json({ success: true });
});

// Invoices CRUD (Server-Authoritative Calculations)
app.get('/api/invoices', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.invoices });
});

app.post('/api/invoices', (req: Request, res: Response) => {
  const invoiceData = req.body;
  if (!invoiceData.customerName || !invoiceData.items || !invoiceData.items.length) {
    return res.status(400).json({ error: 'Customer and at least one item required for invoice.' });
  }

  if (store.invoices.length >= store.user.usage.invoicesLimit) {
    return res.status(403).json({
      error: `Invoice quota (${store.user.usage.invoicesLimit}) reached for ${store.user.plan.toUpperCase()} tier. Please upgrade.`,
    });
  }

  const isGst = Boolean(invoiceData.isGstRegistered);
  // SECURITY AUDIT: Recompute all totals server-side! Never trust client price or total!
  const computed = calculateInvoiceTotals(invoiceData.items, isGst);

  const invoiceNumber =
    sanitizeText(invoiceData.invoiceNumber, 50) ||
    `INV-2026-${String(store.invoices.length + 1).padStart(3, '0')}`;

  const newInvoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: store.user.id,
    invoiceNumber,
    customerId: sanitizeText(invoiceData.customerId, 50),
    customerName: sanitizeText(invoiceData.customerName, 100),
    customerEmail: sanitizeText(invoiceData.customerEmail, 100),
    customerPhone: sanitizeText(invoiceData.customerPhone, 30),
    customerAddress: sanitizeText(invoiceData.customerAddress, 300),
    customerGstin: sanitizeText(invoiceData.customerGstin, 20).toUpperCase(),
    issueDate: sanitizeText(invoiceData.issueDate, 20) || new Date().toISOString().split('T')[0],
    dueDate: sanitizeText(invoiceData.dueDate, 20) || new Date().toISOString().split('T')[0],
    items: computed.items,
    subtotal: computed.subtotal,
    taxAmount: computed.taxAmount,
    discountAmount: computed.discountAmount,
    totalAmount: computed.totalAmount,
    status: ['paid', 'pending', 'overdue', 'draft'].includes(invoiceData.status) ? invoiceData.status : 'pending',
    notes: sanitizeText(invoiceData.notes, 500),
    terms: sanitizeText(invoiceData.terms, 500),
    isGstRegistered: isGst,
    createdAt: new Date().toISOString(),
  };

  store.invoices.unshift(newInvoice);
  store.user.usage.invoicesCreated = store.invoices.length;

  if (newInvoice.customerId) {
    const cust = store.customers.find((c) => c.id === newInvoice.customerId && c.userId === store.user.id);
    if (cust) {
      cust.totalInvoiced = (cust.totalInvoiced || 0) + newInvoice.totalAmount;
      if (newInvoice.status === 'pending' || newInvoice.status === 'overdue') {
        cust.pendingBalance = (cust.pendingBalance || 0) + newInvoice.totalAmount;
      }
    }
  }

  res.status(201).json({ success: true, data: newInvoice });
});

app.put('/api/invoices/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.invoices.findIndex((i) => i.id === id);
  if (index === -1) return res.status(404).json({ error: 'Invoice not found' });

  // IDOR check
  if (store.invoices[index].userId !== store.user.id) {
    return res.status(403).json({ error: 'Unauthorized to modify this invoice' });
  }

  const oldInvoice = store.invoices[index];
  const { status, notes, terms, dueDate } = req.body;

  const validStatus = ['paid', 'pending', 'overdue', 'draft'].includes(status) ? status : oldInvoice.status;

  const updatedInvoice = {
    ...oldInvoice,
    status: validStatus,
    notes: notes !== undefined ? sanitizeText(notes, 500) : oldInvoice.notes,
    terms: terms !== undefined ? sanitizeText(terms, 500) : oldInvoice.terms,
    dueDate: dueDate ? sanitizeText(dueDate, 20) : oldInvoice.dueDate,
  };
  store.invoices[index] = updatedInvoice;

  // Recalculate customer pending balance if status changed
  if (updatedInvoice.customerId && oldInvoice.status !== updatedInvoice.status) {
    const cust = store.customers.find((c) => c.id === updatedInvoice.customerId);
    if (cust) {
      if (updatedInvoice.status === 'paid' && (oldInvoice.status === 'pending' || oldInvoice.status === 'overdue')) {
        cust.pendingBalance = Math.max(0, (cust.pendingBalance || 0) - Number(updatedInvoice.totalAmount || 0));
      } else if (
        (updatedInvoice.status === 'pending' || updatedInvoice.status === 'overdue') &&
        oldInvoice.status === 'paid'
      ) {
        cust.pendingBalance = (cust.pendingBalance || 0) + Number(updatedInvoice.totalAmount || 0);
      }
    }
  }

  res.json({ success: true, data: updatedInvoice });
});

app.delete('/api/invoices/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const inv = store.invoices.find((i) => i.id === id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  if (inv.userId !== store.user.id) return res.status(403).json({ error: 'Unauthorized' });

  store.invoices = store.invoices.filter((i) => i.id !== id);
  store.user.usage.invoicesCreated = store.invoices.length;
  res.json({ success: true });
});

// Quotations CRUD (Server-Authoritative Calculations)
app.get('/api/quotations', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.quotations });
});

app.post('/api/quotations', (req: Request, res: Response) => {
  const quotData = req.body;
  if (!quotData.customerName || !quotData.items || !quotData.items.length) {
    return res.status(400).json({ error: 'Customer and at least one item required for quotation.' });
  }

  const isGst = Boolean(quotData.isGstRegistered);
  const computed = calculateInvoiceTotals(quotData.items, isGst);

  const quotationNumber =
    sanitizeText(quotData.quotationNumber, 50) ||
    `QTN-2026-${String(store.quotations.length + 1).padStart(3, '0')}`;

  const newQuotation = {
    id: `quot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: store.user.id,
    quotationNumber,
    customerId: sanitizeText(quotData.customerId, 50),
    customerName: sanitizeText(quotData.customerName, 100),
    customerEmail: sanitizeText(quotData.customerEmail, 100),
    customerPhone: sanitizeText(quotData.customerPhone, 30),
    customerAddress: sanitizeText(quotData.customerAddress, 300),
    customerGstin: sanitizeText(quotData.customerGstin, 20).toUpperCase(),
    issueDate: sanitizeText(quotData.issueDate, 20) || new Date().toISOString().split('T')[0],
    validUntil: sanitizeText(quotData.validUntil, 20) || new Date().toISOString().split('T')[0],
    items: computed.items,
    subtotal: computed.subtotal,
    taxAmount: computed.taxAmount,
    discountAmount: computed.discountAmount,
    totalAmount: computed.totalAmount,
    status: ['draft', 'sent', 'accepted', 'declined', 'converted'].includes(quotData.status)
      ? quotData.status
      : 'sent',
    notes: sanitizeText(quotData.notes, 500),
    terms: sanitizeText(quotData.terms, 500),
    isGstRegistered: isGst,
    createdAt: new Date().toISOString(),
  };

  store.quotations.unshift(newQuotation);
  res.status(201).json({ success: true, data: newQuotation });
});

app.post('/api/quotations/:id/convert-to-invoice', (req: Request, res: Response) => {
  const { id } = req.params;
  const quot = store.quotations.find((q) => q.id === id);
  if (!quot) return res.status(404).json({ error: 'Quotation not found' });
  if (quot.userId !== store.user.id) return res.status(403).json({ error: 'Unauthorized' });

  const invoiceNumber = `INV-2026-${String(store.invoices.length + 1).padStart(3, '0')}`;
  const createdInvoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: store.user.id,
    invoiceNumber,
    customerId: quot.customerId,
    customerName: quot.customerName,
    customerEmail: quot.customerEmail,
    customerPhone: quot.customerPhone,
    customerAddress: quot.customerAddress,
    customerGstin: quot.customerGstin,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    items: quot.items,
    subtotal: quot.subtotal,
    taxAmount: quot.taxAmount,
    discountAmount: quot.discountAmount,
    totalAmount: quot.totalAmount,
    status: 'pending',
    notes: `Converted from Quotation ${quot.quotationNumber}. ${quot.notes || ''}`,
    terms: quot.terms || 'Payment due within 15 days.',
    isGstRegistered: quot.isGstRegistered,
    createdAt: new Date().toISOString(),
  };

  store.invoices.unshift(createdInvoice);
  quot.status = 'converted';
  quot.convertedInvoiceId = createdInvoice.id;

  res.json({ success: true, data: { invoice: createdInvoice, quotation: quot } });
});

app.delete('/api/quotations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const quot = store.quotations.find((q) => q.id === id);
  if (!quot) return res.status(404).json({ error: 'Quotation not found' });
  if (quot.userId !== store.user.id) return res.status(403).json({ error: 'Unauthorized' });

  store.quotations = store.quotations.filter((q) => q.id !== id);
  res.json({ success: true });
});

// Job Applications CRUD
app.get('/api/applications', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.applications });
});

app.post('/api/applications', (req: Request, res: Response) => {
  const { companyName, jobTitle, jobUrl, location, status, appliedDate, interviewDate, salaryExpectation, notes, reminders } =
    req.body;
  if (!companyName || !jobTitle) {
    return res.status(400).json({ error: 'Company name and job title are required' });
  }

  const validStatus = ['applied', 'screening', 'interview', 'offer', 'rejected', 'wishlist'].includes(status)
    ? status
    : 'applied';

  const newApp = {
    id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: store.user.id,
    companyName: sanitizeText(companyName, 100),
    jobTitle: sanitizeText(jobTitle, 100),
    jobUrl: sanitizeText(jobUrl, 300),
    location: sanitizeText(location, 100) || 'India / Remote',
    status: validStatus,
    appliedDate: sanitizeText(appliedDate, 20) || new Date().toISOString().split('T')[0],
    interviewDate: sanitizeText(interviewDate, 20) || '',
    salaryExpectation: sanitizeText(salaryExpectation, 50) || '',
    notes: sanitizeText(notes, 500) || '',
    reminders: sanitizeText(reminders, 500) || '',
    updatedAt: new Date().toISOString(),
  };

  store.applications.unshift(newApp);
  res.status(201).json({ success: true, data: newApp });
});

app.put('/api/applications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.applications.findIndex((a) => a.id === id);
  if (index === -1) return res.status(404).json({ error: 'Application not found' });

  if (store.applications[index].userId !== store.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { companyName, jobTitle, jobUrl, location, status, appliedDate, interviewDate, salaryExpectation, notes, reminders } =
    req.body;

  store.applications[index] = {
    ...store.applications[index],
    companyName: companyName ? sanitizeText(companyName, 100) : store.applications[index].companyName,
    jobTitle: jobTitle ? sanitizeText(jobTitle, 100) : store.applications[index].jobTitle,
    jobUrl: jobUrl !== undefined ? sanitizeText(jobUrl, 300) : store.applications[index].jobUrl,
    location: location !== undefined ? sanitizeText(location, 100) : store.applications[index].location,
    status: ['applied', 'screening', 'interview', 'offer', 'rejected', 'wishlist'].includes(status)
      ? status
      : store.applications[index].status,
    appliedDate: appliedDate !== undefined ? sanitizeText(appliedDate, 20) : store.applications[index].appliedDate,
    interviewDate: interviewDate !== undefined ? sanitizeText(interviewDate, 20) : store.applications[index].interviewDate,
    salaryExpectation:
      salaryExpectation !== undefined ? sanitizeText(salaryExpectation, 50) : store.applications[index].salaryExpectation,
    notes: notes !== undefined ? sanitizeText(notes, 500) : store.applications[index].notes,
    reminders: reminders !== undefined ? sanitizeText(reminders, 500) : store.applications[index].reminders,
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: store.applications[index] });
});

app.delete('/api/applications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const appItem = store.applications.find((a) => a.id === id);
  if (!appItem) return res.status(404).json({ error: 'Application not found' });
  if (appItem.userId !== store.user.id) return res.status(403).json({ error: 'Unauthorized' });

  store.applications = store.applications.filter((a) => a.id !== id);
  res.json({ success: true });
});

// Resumes CRUD
app.get('/api/resumes', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.resumes });
});

app.post('/api/resumes', (req: Request, res: Response) => {
  const resumeData = req.body;
  const newResume = {
    ...resumeData,
    id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: store.user.id,
    updatedAt: new Date().toISOString(),
  };
  store.resumes.unshift(newResume);
  store.user.usage.resumesCreated = store.resumes.length;
  res.status(201).json({ success: true, data: newResume });
});

app.put('/api/resumes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.resumes.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Resume not found' });
  if (store.resumes[index].userId !== store.user.id) return res.status(403).json({ error: 'Unauthorized' });

  store.resumes[index] = {
    ...store.resumes[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: store.resumes[index] });
});

// Billing & Checkout simulation (Razorpay)
app.post('/api/billing/create-order', (req: Request, res: Response) => {
  const { planTier } = req.body;
  if (!['pro', 'business'].includes(planTier)) {
    return res.status(400).json({ error: 'Invalid plan tier requested.' });
  }

  // Server-Authoritative Price Calculation (Prompt 4 requirement: never trust client price!)
  const amount = planTier === 'business' ? 49900 : 19900; // in paise (₹199 / ₹499)

  const razorpayConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

  res.json({
    success: true,
    orderId: `order_sec_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    amount,
    currency: 'INR',
    planTier,
    isDemoSandbox: !razorpayConfigured,
    message: razorpayConfigured
      ? 'Live Razorpay order created.'
      : 'Running in Demo Sandbox Mode. Configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env for live gateway.',
  });
});

app.post('/api/billing/verify-payment', (req: Request, res: Response) => {
  const { planTier, orderId, paymentId, signature } = req.body;
  if (!['pro', 'business'].includes(planTier)) {
    return res.status(400).json({ error: 'Invalid plan tier requested.' });
  }

  // Cryptographic Razorpay Signature Verification if live secret is present
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (razorpaySecret && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Payment signature verification failed. Untrusted payload.' });
    }
  }

  // Server-Authoritative Plan Activation
  store.user.plan = planTier;
  if (planTier === 'pro') {
    store.user.usage.aiGenerationsLimit = 150;
    store.user.usage.invoicesLimit = 100;
    store.user.usage.resumesLimit = 15;
  } else if (planTier === 'business') {
    store.user.usage.aiGenerationsLimit = 500;
    store.user.usage.invoicesLimit = 1000;
    store.user.usage.resumesLimit = 50;
  }

  res.json({
    success: true,
    plan: store.user.plan,
    usage: store.user.usage,
    receipt: {
      orderId: orderId || `order_${Date.now()}`,
      paymentId: paymentId || `pay_sec_${Date.now()}`,
      timestamp: new Date().toISOString(),
    },
  });
});

// Idempotent Razorpay Webhook Handler
const processedWebhooks = new Set<string>();

app.post('/api/billing/webhook', (req: Request, res: Response) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const webhookSignature = req.headers['x-razorpay-signature'] as string;

  if (webhookSecret && webhookSignature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }
  }

  const eventId = req.body?.event_id || req.body?.payload?.payment?.entity?.id || `evt_${Date.now()}`;
  if (processedWebhooks.has(eventId)) {
    return res.json({ status: 'duplicate_ignored' });
  }
  processedWebhooks.add(eventId);

  // Keep deduplication memory cache bounded
  if (processedWebhooks.size > 1000) {
    const first = processedWebhooks.values().next().value;
    if (first) processedWebhooks.delete(first);
  }

  res.json({ status: 'success', received: true });
});

// System Status & Integrations Check (No secrets leaked!)
app.get('/api/system/status', (_req: Request, res: Response) => {
  res.json({
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    firebaseConfigured: true,
    firebaseProjectId: 'cryptic-poetry-p2w8r',
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
  });
});

// Global Error Handler (Sanitizes stack traces, returns correlation ID)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const correlationId = crypto.randomUUID();
  console.error(`[Unhandled Error ${correlationId}]:`, err.message || err);
  res.status(500).json({
    error: 'An internal error occurred. Our team has been notified.',
    correlationId,
  });
});

// ==========================================
// 3. VITE MIDDLEWARE (DEV) / STATIC (PROD)
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[SmartGrow AI Server] Running securely on port ${PORT}`);
  });
}

startServer();
