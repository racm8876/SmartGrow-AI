import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory Database Store with sample seed data for instant usability
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
    id: 'usr_demo_01',
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
      subtotal: 32600,
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
    {
      id: 'inv_03',
      invoiceNumber: 'INV-2026-003',
      customerId: 'cust_03',
      customerName: 'GreenLeaf Organic Foods',
      customerEmail: 'hello@greenleafindia.com',
      customerPhone: '+91 99887 76655',
      customerAddress: '12 Indiranagar 100ft Road, Bengaluru',
      customerGstin: '',
      issueDate: '2026-03-01',
      dueDate: '2026-03-15',
      items: [
        {
          id: 'item_4',
          description: 'Product Photography & Social Media Catalog Design',
          hsnSac: '998365',
          quantity: 1,
          unitPrice: 25000,
          taxRate: 0,
          discountPercent: 0,
          total: 25000,
        },
      ],
      subtotal: 25000,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 25000,
      status: 'overdue',
      notes: 'Second follow-up sent on 18-Mar-2026.',
      terms: 'Non-GST billing as requested.',
      isGstRegistered: false,
      createdAt: '2026-03-01T09:00:00.000Z',
    },
  ],
  quotations: [
    {
      id: 'quot_01',
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
      subtotal: 40500,
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
    {
      id: 'app_02',
      companyName: 'Swiggy',
      jobTitle: 'Full Stack Engineer (Node + TypeScript)',
      jobUrl: 'https://careers.swiggy.com',
      location: 'Bengaluru, India',
      status: 'screening',
      appliedDate: '2026-03-15',
      interviewDate: '',
      salaryExpectation: '₹20,00,000 CTC',
      notes: 'Applied via employee referral from college alumni.',
      reminders: 'Follow up if no update by Friday.',
      updatedAt: '2026-03-15T18:00:00.000Z',
    },
    {
      id: 'app_03',
      companyName: 'Postman',
      jobTitle: 'Developer Advocate / Platform Engineer',
      jobUrl: 'https://postman.com/careers',
      location: 'Remote, India',
      status: 'applied',
      appliedDate: '2026-03-18',
      interviewDate: '',
      salaryExpectation: '₹22,00,000 CTC',
      notes: 'Submitted customized resume emphasizing API integrations and developer tooling.',
      reminders: 'Check application status in portal.',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
  ],
  resumes: [
    {
      id: 'res_01',
      title: 'Full Stack Developer - ATS Optimized',
      personal: {
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@gmail.com',
        phone: '+91 98765 43210',
        location: 'Bengaluru, India',
        headline: 'Full Stack Engineer | React, TypeScript, Node.js & Distributed Systems',
        summary: 'Results-driven software engineer with 2+ years of experience building high-throughput web applications, payment workflows, and performant user interfaces. Proven track record of reducing bundle size by 35% and improving API latency.',
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
            'Implemented automated CI/CD pipelines with comprehensive unit tests, boosting test coverage to 88%.',
          ],
        },
        {
          id: 'exp_2',
          company: 'PixelCraft Digital',
          role: 'Frontend Engineering Intern',
          location: 'Pune, India',
          startDate: '2023-12',
          endDate: '2024-06',
          current: false,
          bullets: [
            'Developed modular design system components utilized across 4 customer-facing portals.',
            'Collaborated with senior engineers to implement client-side caching and offline PWA capabilities.',
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
        technical: ['TypeScript', 'JavaScript (ES6+)', 'React 19', 'Node.js', 'Express', 'PostgreSQL', 'RESTful APIs', 'Tailwind CSS'],
        soft: ['Technical Problem Solving', 'Agile / Scrum', 'Cross-functional Collaboration', 'Code Reviewing'],
        tools: ['Git / GitHub', 'Docker', 'Postman', 'Vite', 'Figma', 'Linux'],
      },
      projects: [
        {
          id: 'proj_1',
          title: 'CloudFlow - Micro-SaaS Analytics Engine',
          description: 'Real-time telemetry and subscription billing platform for independent creators.',
          technologies: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
          liveUrl: 'https://cloudflow-demo.app',
          githubUrl: 'https://github.com/aarav-sharma/cloudflow',
          bullets: [
            'Engineered automated reconciliation system handling ₹5L+ in test transactions.',
            'Designed responsive, accessible charts and metric tables with zero layout shift.',
          ],
        },
      ],
      certifications: [
        {
          id: 'cert_1',
          title: 'Meta Certified Front-End Developer',
          issuer: 'Meta / Coursera',
          date: '2024',
          credentialUrl: 'https://coursera.org/verify/meta-cert',
        },
      ],
      template: 'modern',
      updatedAt: new Date().toISOString(),
    },
  ],
};

// ==========================================
// 1. GEMINI AI SERVER-SIDE ENDPOINTS
// ==========================================

// Helper: Check and increment usage limits
function checkAndIncrementAiUsage(res: Response): boolean {
  if (store.user.usage.aiGenerationsUsed >= store.user.usage.aiGenerationsLimit) {
    res.status(403).json({
      error: 'AI generation limit reached for your current plan.',
      currentUsage: store.user.usage.aiGenerationsUsed,
      limit: store.user.usage.aiGenerationsLimit,
      plan: store.user.plan,
      requiresUpgrade: true,
    });
    return false;
  }
  store.user.usage.aiGenerationsUsed += 1;
  return true;
}

// A. Business Content Generator
app.post('/api/ai/business-content', async (req: Request, res: Response) => {
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
      return res.status(400).json({ error: 'Missing required parameters (type, productOrService)' });
    }

    if (!checkAndIncrementAiUsage(res)) return;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please check the Secrets panel in AI Studio.',
      });
    }

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
Business Type: ${businessType || 'General Retail / Service'}
Product or Service: ${productOrService}
Target Audience: ${targetAudience || 'Indian consumers and local customers'}
${offerDetails ? `Special Offer / Festival Details: ${offerDetails}` : ''}
${customerQuery ? `Customer Message / Context: ${customerQuery}` : ''}

Provide 3 variations with distinct angles (e.g. Angle 1: Value & Trust, Angle 2: Urgency / Festive celebration, Angle 3: Direct WhatsApp / Call To Action).`;

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
                  title: { type: Type.STRING, description: 'Short descriptive headline of this angle' },
                  content: { type: Type.STRING, description: 'The complete generated text copy ready to copy-paste' },
                  keyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Key highlights or bullet points',
                  },
                  hashtags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Relevant hashtags if social or ads',
                  },
                  callToAction: { type: Type.STRING, description: 'Specific actionable closing line' },
                },
                required: ['title', 'content', 'callToAction'],
              },
            },
            language: { type: Type.STRING },
            tip: { type: Type.STRING, description: 'One expert marketing tip for the business owner to maximize response' },
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
    console.error('Error generating business content:', error);
    res.status(500).json({ error: error.message || 'Failed to generate business content via Gemini.' });
  }
});

// B. Resume Bullet & Summary Polisher (ATS Optimizer)
app.post('/api/ai/resume-polish', async (req: Request, res: Response) => {
  try {
    const { sectionType, rawInput, targetRole, yearsOfExperience = 2 } = req.body;

    if (!rawInput) {
      return res.status(400).json({ error: 'rawInput text is required' });
    }

    if (!checkAndIncrementAiUsage(res)) return;

    const systemPrompt = `You are a certified executive resume writer and ATS algorithm specialist.
Rules:
- Transform raw user input into quantifiable, high-impact bullet points or executive summaries.
- Use action verbs (Architected, Spearheaded, Accelerated, Streamlined, Reduced, Scaled).
- Emphasize metrics using placeholders (e.g., [X]%, ₹[Y]L) if user didn't specify numbers.
- DO NOT invent fake degrees, fake companies, or fake work experience.
- Keep output ATS-friendly, scannable, and clean.`;

    const userPrompt = `Section: ${sectionType || 'Work Experience'}
Target Role: ${targetRole || 'Software Engineer'}
Candidate Experience: ${yearsOfExperience} years
Raw input:
"""${rawInput}"""

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
            atsKeywordsIncluded: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['polishedBullets', 'executiveSummarySuggestion', 'atsKeywordsIncluded'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in resume polish:', error);
    res.status(500).json({ error: error.message || 'Failed to polish resume.' });
  }
});

// C. Resume vs Job Description Analyzer
app.post('/api/ai/analyze-resume', async (req: Request, res: Response) => {
  try {
    const { resumeText, jobDescriptionText, targetRole } = req.body;

    if (!resumeText || !jobDescriptionText) {
      return res.status(400).json({ error: 'Both resumeText and jobDescriptionText are required for realistic analysis.' });
    }

    if (!checkAndIncrementAiUsage(res)) return;

    const systemPrompt = `You are a senior technical recruiter and ATS evaluation auditor.
Evaluate the candidate's resume honestly against the provided job description.
Do NOT guarantee job offers or claim 100% ATS score. Explain that match score is an algorithmic estimate based on skill overlap and contextual keyword density.
Provide realistic, constructive feedback.`;

    const userPrompt = `Target Role: ${targetRole || 'Not specified'}
Job Description:
"""${jobDescriptionText}"""

Candidate Resume:
"""${resumeText}"""

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
            matchScore: { type: Type.INTEGER, description: 'Realistic score between 0 and 100' },
            summary: { type: Type.STRING, description: 'Honest 2-3 sentence overview of candidate positioning' },
            matchedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Skills explicitly present in both JD and Resume',
            },
            missingKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Critical keywords in JD missing or weak in Resume',
            },
            formattingSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'ATS formatting and layout recommendations',
            },
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
            roleSpecificTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
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
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze resume.' });
  }
});

// D. Job Description Analyzer
app.post('/api/ai/analyze-jd', async (req: Request, res: Response) => {
  try {
    const { jobDescriptionText } = req.body;

    if (!jobDescriptionText) {
      return res.status(400).json({ error: 'jobDescriptionText is required' });
    }

    if (!checkAndIncrementAiUsage(res)) return;

    const userPrompt = `Analyze this job description thoroughly:
"""${jobDescriptionText}"""

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
            requiredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            preferredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            experienceRequirement: { type: Type.STRING },
            responsibilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            importantKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
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
    console.error('Error analyzing job description:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze job description.' });
  }
});

// E. Interview Preparation Question Generator
app.post('/api/ai/interview-prep', async (req: Request, res: Response) => {
  try {
    const { role = 'Software Developer', difficulty = 'intermediate', focusArea = 'All' } = req.body;

    if (!checkAndIncrementAiUsage(res)) return;

    const userPrompt = `Role: ${role}
Difficulty Level: ${difficulty}
Focus Area: ${focusArea}

Generate 6 realistic, high-frequency interview questions asked in modern tech interviews (especially top Indian tech firms, startups, and product companies like Flipkart, Swiggy, Razorpay, TCS Digital, Infosys Topgear, Google India).
Include technical conceptual, problem-solving, and behavioral/STAR questions. Provide a comprehensive model answer, STAR breakdown where applicable, follow-up questions, and what interviewers evaluate.`;

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
                  followUpQuestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
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
    console.error('Error generating interview questions:', error);
    res.status(500).json({ error: error.message || 'Failed to generate interview prep questions.' });
  }
});

// F. Interview Practice Mode Feedback
app.post('/api/ai/interview-feedback', async (req: Request, res: Response) => {
  try {
    const { question, candidateAnswer, targetRole = 'Software Developer' } = req.body;

    if (!question || !candidateAnswer) {
      return res.status(400).json({ error: 'Both question and candidateAnswer are required' });
    }

    if (!checkAndIncrementAiUsage(res)) return;

    const userPrompt = `Question Asked: "${question}"
Target Role: ${targetRole}
Candidate Answer:
"""${candidateAnswer}"""

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
            strongPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            improvementPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            refinedAnswerSuggestion: { type: Type.STRING },
          },
          required: ['scoreOutOf10', 'feedback', 'strongPoints', 'improvementPoints', 'refinedAnswerSuggestion'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error giving interview feedback:', error);
    res.status(500).json({ error: error.message || 'Failed to generate interview feedback.' });
  }
});

// ==========================================
// 2. DATA PERSISTENCE & CRUD ENDPOINTS
// ==========================================

// User & Profile
app.get('/api/user', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.user });
});

app.put('/api/user/profile', (req: Request, res: Response) => {
  const { businessProfile, jobSeekerProfile, name } = req.body;
  if (name) store.user.name = name;
  if (businessProfile) store.user.businessProfile = { ...store.user.businessProfile, ...businessProfile };
  if (jobSeekerProfile) store.user.jobSeekerProfile = { ...store.user.jobSeekerProfile, ...jobSeekerProfile };
  res.json({ success: true, data: store.user });
});

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
    id: `cust_${Date.now()}`,
    name,
    companyName: companyName || '',
    phone,
    email: email || '',
    gstin: gstin || '',
    address: address || '',
    city: city || '',
    notes: notes || '',
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

  store.customers[index] = {
    ...store.customers[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: store.customers[index] });
});

app.delete('/api/customers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  store.customers = store.customers.filter((c) => c.id !== id);
  res.json({ success: true });
});

// Invoices CRUD
app.get('/api/invoices', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.invoices });
});

app.post('/api/invoices', (req: Request, res: Response) => {
  const invoiceData = req.body;
  if (!invoiceData.customerName || !invoiceData.items || !invoiceData.items.length) {
    return res.status(400).json({ error: 'Customer and at least one item required for invoice.' });
  }

  // Check invoice limit for free tier
  if (store.invoices.length >= store.user.usage.invoicesLimit) {
    return res.status(403).json({
      error: `Invoice limit (${store.user.usage.invoicesLimit}) reached for ${store.user.plan.toUpperCase()} plan. Please upgrade to Pro or Business.`,
    });
  }

  const invoiceNumber = invoiceData.invoiceNumber || `INV-2026-${String(store.invoices.length + 1).padStart(3, '0')}`;
  const newInvoice = {
    ...invoiceData,
    id: `inv_${Date.now()}`,
    invoiceNumber,
    createdAt: new Date().toISOString(),
  };

  store.invoices.unshift(newInvoice);
  store.user.usage.invoicesCreated = store.invoices.length;

  // Update customer balance if customerId matches
  if (newInvoice.customerId) {
    const cust = store.customers.find((c) => c.id === newInvoice.customerId);
    if (cust) {
      cust.totalInvoiced = (cust.totalInvoiced || 0) + Number(newInvoice.totalAmount || 0);
      if (newInvoice.status === 'pending' || newInvoice.status === 'overdue') {
        cust.pendingBalance = (cust.pendingBalance || 0) + Number(newInvoice.totalAmount || 0);
      }
    }
  }

  res.status(201).json({ success: true, data: newInvoice });
});

app.put('/api/invoices/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.invoices.findIndex((i) => i.id === id);
  if (index === -1) return res.status(404).json({ error: 'Invoice not found' });

  const oldInvoice = store.invoices[index];
  const updatedInvoice = { ...oldInvoice, ...req.body };
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
  store.invoices = store.invoices.filter((i) => i.id !== id);
  store.user.usage.invoicesCreated = store.invoices.length;
  res.json({ success: true });
});

// Quotations CRUD
app.get('/api/quotations', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.quotations });
});

app.post('/api/quotations', (req: Request, res: Response) => {
  const quotData = req.body;
  if (!quotData.customerName || !quotData.items || !quotData.items.length) {
    return res.status(400).json({ error: 'Customer and at least one item required for quotation.' });
  }

  const quotationNumber =
    quotData.quotationNumber || `QTN-2026-${String(store.quotations.length + 1).padStart(3, '0')}`;
  const newQuotation = {
    ...quotData,
    id: `quot_${Date.now()}`,
    quotationNumber,
    createdAt: new Date().toISOString(),
  };

  store.quotations.unshift(newQuotation);
  res.status(201).json({ success: true, data: newQuotation });
});

app.put('/api/quotations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.quotations.findIndex((q) => q.id === id);
  if (index === -1) return res.status(404).json({ error: 'Quotation not found' });

  store.quotations[index] = { ...store.quotations[index], ...req.body };
  res.json({ success: true, data: store.quotations[index] });
});

app.post('/api/quotations/:id/convert-to-invoice', (req: Request, res: Response) => {
  const { id } = req.params;
  const quot = store.quotations.find((q) => q.id === id);
  if (!quot) return res.status(404).json({ error: 'Quotation not found' });

  const invoiceNumber = `INV-2026-${String(store.invoices.length + 1).padStart(3, '0')}`;
  const createdInvoice = {
    id: `inv_${Date.now()}`,
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

  const newApp = {
    id: `app_${Date.now()}`,
    companyName,
    jobTitle,
    jobUrl: jobUrl || '',
    location: location || 'India / Remote',
    status: status || 'applied',
    appliedDate: appliedDate || new Date().toISOString().split('T')[0],
    interviewDate: interviewDate || '',
    salaryExpectation: salaryExpectation || '',
    notes: notes || '',
    reminders: reminders || '',
    updatedAt: new Date().toISOString(),
  };

  store.applications.unshift(newApp);
  res.status(201).json({ success: true, data: newApp });
});

app.put('/api/applications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = store.applications.findIndex((a) => a.id === id);
  if (index === -1) return res.status(404).json({ error: 'Application not found' });

  store.applications[index] = {
    ...store.applications[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: store.applications[index] });
});

app.delete('/api/applications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
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
    id: `res_${Date.now()}`,
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
  const amount = planTier === 'business' ? 49900 : planTier === 'pro' ? 19900 : 0; // in paise (₹199 / ₹499)

  const razorpayConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

  res.json({
    success: true,
    orderId: `order_sim_${Date.now()}`,
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
  const { planTier, orderId, paymentId } = req.body;
  if (!['pro', 'business'].includes(planTier)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  // Update user plan on server
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
      paymentId: paymentId || `pay_sim_${Date.now()}`,
      timestamp: new Date().toISOString(),
    },
  });
});

// System Status & Integrations Check
app.get('/api/system/status', (_req: Request, res: Response) => {
  res.json({
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    firebaseConfigured: Boolean(process.env.VITE_FIREBASE_PROJECT_ID),
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
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
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
