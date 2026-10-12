import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  FileText,
  FileCheck,
  Users,
  BriefcaseBusiness,
  FileUser,
  ScanSearch,
  MessageSquareCode,
  ShieldCheck,
  Check,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../assets/images';

export const LandingPage: React.FC = () => {
  const { setActivePage, openBillingModal, user, openAuthModal } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [interactiveTab, setInteractiveTab] = useState<'business' | 'job'>('business');

  // Interactive micro-preview state
  const [sampleNiche, setSampleNiche] = useState('Festive Sale for Handcrafted Sarees');
  const [sampleLanguage, setSampleLanguage] = useState<'English' | 'Hindi' | 'Hinglish'>('Hinglish');

  const faqs = [
    {
      q: 'What is SmartGrow AI and who is it designed for?',
      a: 'SmartGrow AI is a unified platform combining two critical modules: a Business Assistant (for MSMEs, freelancers, and small shop owners in India to generate localized marketing copy, GST-compliant invoices, quotations, and customer ledgers) and a Job Assistant (for freshers, software engineers, and professionals to build ATS-friendly resumes, analyze job descriptions, and practice interview questions with AI feedback).',
    },
    {
      q: 'Does SmartGrow AI support Hindi and Hinglish for marketing?',
      a: 'Yes! Indian businesses thrive on conversational messaging. The AI Content Generator natively crafts WhatsApp customer replies, Instagram promotional captions, and festival campaign offers in professional English, pure Hindi (Devanagari), and natural Hinglish (conversational Romanized Hindi/English).',
    },
    {
      q: 'Are the invoices compliant with Indian GST requirements?',
      a: 'Yes. Invoices support HSN/SAC codes, state GSTIN identification, customizable GST rates (0%, 5%, 12%, 18%, 28%), itemized discounts, bank account details for NEFT/UPI, and downloadable or printable PDF output.',
    },
    {
      q: 'How does the Resume Analyzer calculate match scores?',
      a: 'The analyzer uses Google Gemini to semantically compare your resume against the target job description. It identifies exact skill matches, missing critical keywords, and provides actionable bullet rewrites. We do not claim arbitrary guaranteed scores—the rating is a realistic heuristic based on modern recruiter screening criteria.',
    },
    {
      q: 'How do the subscription plans work and what payment methods are supported?',
      a: 'SmartGrow AI offers a Free Tier with monthly generation limits, Pro Plan at ₹199/month, and Business Plan at ₹499/month. Payments are designed for Indian gateways like Razorpay (UPI, Net Banking, Cards) and include a sandbox testing mode for development.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (4-5 Nav Links) - Zone 3 (1 Primary Action) */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              SG
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              SmartGrow AI
            </span>
          </div>

          {/* Zone 2: 4-5 Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#business-assistant" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
              Business Suite
            </a>
            <a href="#job-assistant" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
              Job Suite
            </a>
            <a href="#interactive-demo" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
              Live Preview
            </a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
              Pricing
            </a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
              FAQ
            </a>
          </nav>

          {/* Zone 3: 1 Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <button
                onClick={() => setActivePage('dashboard')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-3 py-1 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Dual-Engine AI for Indian Businesses & Career Builders</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
            Scale your business daily. <br />
            Ace your next job interview.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
            SmartGrow AI provides practical, production-ready tools for small business owners to handle localized marketing and GST billing, and for job seekers to engineer ATS-friendly resumes and master technical interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => (user ? setActivePage('dashboard') : openAuthModal('signup'))}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{user ? 'Open Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-center"
            >
              Explore Live Demo
            </a>
          </div>

          {/* Neutral Trust Signals */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> No credit card required to start
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> English, Hindi & Hinglish AI copy
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> GST-ready invoice & quote PDF export
            </span>
          </div>
        </div>

        {/* Dashboard Product Preview Visual */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900">
          <img
            src={ASSETS.heroDashboard}
            alt="SmartGrow AI Dashboard interface on laptop"
            className="w-full h-auto object-cover max-h-[640px]"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Feature 1: Business Assistant */}
      <section id="business-assistant" className="py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                Module 01 · Business Assistant
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                Automate marketing copy and streamline day-to-day billing.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Designed for retail shop owners, digital agencies, freelancers, and small enterprises across India. Stop spending hours writing ad copies or manually formatting invoices in Word.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Content Generator</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Produce high-converting WhatsApp replies, Instagram captions, festival offers, and Google/Meta ad copy in English, Hindi, and Hinglish.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">GST Invoices & Quotations</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Generate itemized tax invoices with auto-numbering, configurable GST rates, HSN codes, and one-click quotation-to-invoice conversions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Customer CRM & Outstanding Tracking</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Maintain customer contact records, transaction histories, and track pending dues with clear audit records.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActivePage('business-content')}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>Launch Business Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-800">
              <img
                src={ASSETS.businessPreview}
                alt="Modern retail and commercial workspace with digital invoicing"
                className="w-full h-auto object-cover max-h-[500px]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Job Assistant */}
      <section id="job-assistant" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-800">
              <img
                src={ASSETS.jobPreview}
                alt="Professional preparing for software developer interview"
                className="w-full h-auto object-cover max-h-[500px]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="order-1 lg:order-2">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                Module 02 · Job Assistant
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                Tailor your resume, deconstruct JDs, and prepare for interviews.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Engineered for college freshers, software engineers, data analysts, and career changers. Get targeted algorithmic feedback without fake promises.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileUser className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">ATS Resume Builder</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Craft quantifiable, action-oriented bullet points that bypass automated applicant tracking filters, with printable PDF exports.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ScanSearch className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Resume vs JD Matcher</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Compare your resume against any job description to discover missing technical keywords and bullet-level refinement opportunities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquareCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Interview Practice Mode</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Practice role-specific interview questions for Full Stack, Python, ML, and Data roles, with instant scoring and STAR feedback.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActivePage('resume-builder')}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>Launch Job Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Preview */}
      <section id="interactive-demo" className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Interactive Feature Preview
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Test the AI engine logic directly before opening the full dashboard
            </p>

            <div className="inline-flex p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mt-6">
              <button
                onClick={() => setInteractiveTab('business')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  interactiveTab === 'business'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Business Copy Sample
              </button>
              <button
                onClick={() => setInteractiveTab('job')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  interactiveTab === 'job'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                ATS Bullet Transformation
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            {interactiveTab === 'business' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Business Offer / Scenario
                    </label>
                    <input
                      type="text"
                      value={sampleNiche}
                      onChange={(e) => setSampleNiche(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Language Mode
                    </label>
                    <div className="flex gap-2">
                      {(['English', 'Hindi', 'Hinglish'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setSampleLanguage(lang)}
                          className={`flex-1 text-xs py-2 rounded-lg font-medium border ${
                            sampleLanguage === lang
                              ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                    <span>Generated WhatsApp / Instagram Output Preview</span>
                    <span className="text-[10px] text-blue-600 font-mono">Channel: WhatsApp / Social</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {sampleLanguage === 'Hinglish'
                      ? `✨ Festive Season Special: Is festive season par lijiye pure handcrafted sarees with exclusive 25% off! Har piece handloom heritage aur premium silk quality ke saath aata hai. Order on WhatsApp: Click below to view the catalog! 🪔`
                      : sampleLanguage === 'Hindi'
                      ? `✨ इस त्योहार के अवसर पर पाएँ शुद्ध हस्तनिर्मित साड़ियों पर विशेष 25% की छूट! प्रत्येक साड़ी हमारी परंपरा और उच्च गुणवत्ता का प्रतीक है। आज ही व्हाट्सएप पर अपना ऑर्डर बुक करें!`
                      : `✨ Celebrate this festive season with our exclusive collection of authentic handcrafted sarees! Enjoy 25% off on our handloom silk collection. Tap below to chat with us on WhatsApp and claim your festive discount.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                    <div className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">
                      Before (Weak / Passive bullet)
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      "I worked on making the frontend website faster and fixing bugs for our company portal."
                    </p>
                    <div className="mt-3 text-[11px] text-slate-500">
                      Issue: Lacks metrics, action verb, and ATS keyword relevance.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                      After (SmartGrow ATS Polished)
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                      "Architected React & TypeScript frontend performance refactor, decreasing p95 bundle load time by 35% and resolving 40+ critical user-reported issues."
                    </p>
                    <div className="mt-3 text-[11px] text-emerald-700 dark:text-emerald-300">
                      Outcome: Strong action verb, clear percentage impact, technical stack keywords.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
              Transparent, honest pricing.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Start free today with no obligations. Upgrade as your business or job hunt scales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Free Plan */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Free Plan</div>
                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mb-1">₹0</div>
                <div className="text-xs text-slate-500 mb-6">Free forever · No credit card required</div>

                <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span><strong>15 AI Generations</strong> per month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Up to 10 GST Invoices & Quotes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Basic ATS Resume Builder (2 resumes)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Core Interview Prep Questions</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActivePage('dashboard')}
                className="mt-8 w-full py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular
              </div>

              <div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                  Pro Plan
                </div>
                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mb-1">₹199</div>
                <div className="text-xs text-slate-500 mb-6">per month · For active job seekers & freelancers</div>

                <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span><strong>150 AI Generations</strong> per month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>100 GST Invoices & Quotations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Advanced ATS Resume & JD Analyzer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Interactive Interview Practice Mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Print & Clean PDF Exports</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openBillingModal('pro')}
                className="mt-8 w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Upgrade to Pro (₹199)
              </button>
            </div>

            {/* Business Plan */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Business Plan
                </div>
                <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mb-1">₹499</div>
                <div className="text-xs text-slate-500 mb-6">per month · For growing shops & agencies</div>

                <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span><strong>500 AI Generations</strong> per month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span><strong>1,000 Invoices & Quotations</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Unlimited Customer CRM & Ledger</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Multi-format festival & ad campaigns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Priority Server Processing</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openBillingModal('business')}
                className="mt-8 w-full py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Upgrade to Business (₹499)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Straightforward answers about our features, limits, and technology.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              SG
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">SmartGrow AI</span>
            <span>· Business & Job Assistant Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setActivePage('privacy')} className="hover:text-slate-900 dark:hover:text-white">
              Privacy Policy
            </button>
            <button onClick={() => setActivePage('terms')} className="hover:text-slate-900 dark:hover:text-white">
              Terms of Service
            </button>
            <button onClick={() => setActivePage('settings')} className="hover:text-slate-900 dark:hover:text-white">
              Integration Setup
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
