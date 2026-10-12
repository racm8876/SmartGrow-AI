# SmartGrow AI — AI Business & Job Assistant Platform

SmartGrow AI is a production-grade, dual-engine SaaS web platform built for:
1. **Small Business Owners, Shop Owners & Freelancers**: To generate high-converting, localized marketing copy (English, Hindi, and Hinglish), issue compliant GST Tax Invoices and Quotations with auto-calculations, and manage customer ledgers.
2. **Job Seekers & Software Engineers**: To craft ATS-friendly resumes with action-verb enhancers, deconstruct job descriptions, evaluate semantic keyword overlaps, and practice role-specific technical/STAR interview questions with instant AI feedback.

---

## Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons.
- **Backend**: Node.js with Express & TypeScript (`server.ts`), integrated with Vite middlewares.
- **AI Integration**: Google Gemini API via `@google/genai` (model: `gemini-3.8-flash`) executed securely on the server side.
- **Database Architecture**: Server persistence layer with clear Firestore-ready document models.
- **Payments**: Indian Payment Gateway (Razorpay) architecture supporting live webhook verification and built-in demo sandbox checkout mode.

---

## Key Modules & Features

### 1. Business Assistant Module
- **AI Content Generator**:
  - Channels: WhatsApp Customer Replies, Instagram Captions, Festive Campaign Offers, Product Descriptions, Marketing Emails, Google/Meta Ad Copy.
  - Languages: English, Hindi (Devanagari), and Hinglish (Romanized conversational Hindi-English).
  - Tones: Professional, Friendly, Festive, Urgent, Persuasive.
- **GST Invoice Generator**:
  - Auto-incrementing unique invoice numbering (`INV-2026-001`).
  - Itemized rows: HSN/SAC codes, Quantities, Unit Rates, Line Discounts, GST % (0%, 5%, 12%, 18%, 28%).
  - Configurable GST status (supports GST-registered and composition/non-GST sellers).
  - Print & PDF Export matching standard Indian tax invoice standards.
- **Quotation Generator**:
  - Clearly stamped as non-binding estimates.
  - Expiration validity tracking.
  - One-click conversion to Tax Invoice.
- **Customer CRM & Outstanding Tracking**:
  - Customer contact directory with state GSTIN numbers.
  - Linked invoice history and outstanding payment ledger.

### 2. Job Assistant Module
- **ATS Resume Builder**:
  - Multi-section builder (Personal, Experience, Education, Technical Skills, Projects, Certifications).
  - In-line **AI Enhance** button for bullet points to inject quantifiable impact and action verbs without inventing false credentials.
  - Clean single-column ATS templates (Modern Clean, Classic Executive, Minimal Tech).
  - Print & PDF download.
- **Resume vs JD Analyzer**:
  - Semantic evaluation against target Job Descriptions.
  - Match score (0-100), matched keywords, missing keywords, and 3 specific bullet point rewrites.
- **Job Description Deconstructor**:
  - Instant extraction of required vs preferred skills, years of experience, and likely interview questions.
- **Interview Preparation & Live Practice Mode**:
  - Target roles: Software Developer, Full-stack Developer, Python Developer, Data Analyst, AI/ML Engineer, College Fresher.
  - Model answers with STAR methodology breakdowns and follow-up prompts.
  - **Live Practice Mode**: Type your verbal response and receive real-time coaching feedback and scores out of 10.
- **Job Application Pipeline Tracker**:
  - Kanban/table tracking across Applied, Screening, Interview, Offer, and Rejected stages.
  - Log interview dates, target CTC benchmarks, and follow-up reminders.

---

## Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
# Gemini AI (injected automatically in AI Studio)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Port (must be 3000 in AI Studio)
PORT=3000

# Razorpay Indian Payment Gateway (Optional - for live payments; default is demo sandbox)
RAZORPAY_KEY_ID="rzp_test_xxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# Firebase Cloud Firestore (Optional - for direct cloud database synchronization)
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
```

---

## Local Development Commands

```bash
# Install dependencies
npm install

# Run fullstack server (dev mode with tsx and Vite middleware)
npm run dev

# Lint TypeScript code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## Pricing & Monetization

- **Free Starter**: 15 AI Generations/mo, 10 Invoices, 2 Saved Resumes.
- **Pro Growth (₹199/mo)**: 150 AI Generations/mo, 100 GST Invoices & Quotes, 15 Resumes, Full ATS Analysis & Interview Practice Coach.
- **Business Scale (₹499/mo)**: 500 AI Generations/mo, 1,000 Invoices & Quotes, Unlimited Customer Directory, Priority processing.
