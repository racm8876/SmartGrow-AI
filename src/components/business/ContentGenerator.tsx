import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Languages,
  MessageSquare,
  ShoppingBag,
  Send,
  Loader2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  BusinessContentType,
  ContentLanguage,
  ContentTone,
  BusinessContentResult,
} from '../../types';
import * as api from '../../services/api';

const CONTENT_TYPES: { type: BusinessContentType; label: string; desc: string; icon: string }[] = [
  { type: 'whatsapp_reply', label: 'WhatsApp Customer Reply', desc: 'Quick professional replies to inquiries & orders', icon: '💬' },
  { type: 'social_caption', label: 'Instagram / Social Caption', desc: 'Engaging captions with hashtags for local brands', icon: '📸' },
  { type: 'festive_offer', label: 'Festival Campaign Offer', desc: 'Diwali, Eid, New Year & seasonal discounts', icon: '🪔' },
  { type: 'product_description', label: 'Product Description', desc: 'Clear catalog & e-commerce product copy', icon: '📦' },
  { type: 'marketing_email', label: 'Marketing Email / Newsletter', desc: 'Customer outreach and service announcements', icon: '✉️' },
  { type: 'ad_copy', label: 'Google / Meta Ad Copy', desc: 'High-CTR headlines & ad body text with CTA', icon: '📢' },
];

export const ContentGenerator: React.FC = () => {
  const { user, addToast, refreshUserData } = useApp();

  const [contentType, setContentType] = useState<BusinessContentType>('whatsapp_reply');
  const [businessType, setBusinessType] = useState(user?.businessProfile?.companyName ? 'Retail / Digital Services' : 'Clothing Store');
  const [productOrService, setProductOrService] = useState('Festive Kurta & Saree Collection');
  const [targetAudience, setTargetAudience] = useState('Local families and young professionals looking for quality ethnic wear');
  const [language, setLanguage] = useState<ContentLanguage>('hinglish');
  const [tone, setTone] = useState<ContentTone>('friendly');
  const [desiredLength, setDesiredLength] = useState<'short' | 'medium' | 'detailed'>('medium');
  const [offerDetails, setOfferDetails] = useState('Flat 20% discount on orders above ₹1,999. Free home delivery in 2 days.');
  const [customerQuery, setCustomerQuery] = useState('Customer asking: "Bhaiya ye size L me available hai kya aur delivery kab tak milegi?"');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BusinessContentResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productOrService.trim()) {
      addToast('error', 'Please specify your product or service name.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await api.generateBusinessContent({
        type: contentType,
        businessType,
        productOrService,
        targetAudience,
        language,
        tone,
        desiredLength,
        offerDetails,
        customerQuery,
      });

      if (res.success && res.data) {
        setResult(res.data);
        await refreshUserData();
        addToast('success', 'Generated 3 high-converting copy variations!');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to generate copy. Check Gemini API status.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    addToast('info', 'Copied to clipboard!');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>AI Business Content Generator</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Generate sales copy, festive offers, and WhatsApp customer replies in English, Hindi, and Hinglish.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs (Left Column) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Content Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Format / Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setContentType(item.type)}
                    className={`p-2.5 text-left rounded-xl border text-xs transition-all flex flex-col justify-between ${
                      contentType === item.type
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-base mb-1">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                <span>Output Language</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'hinglish', label: 'Hinglish', note: 'Casual Romanized' },
                  { id: 'english', label: 'English', note: 'Professional UK/IN' },
                  { id: 'hindi', label: 'हिंदी (Hindi)', note: 'Devanagari Script' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLanguage(l.id as ContentLanguage)}
                    className={`p-2 text-center rounded-lg border text-xs transition-all ${
                      language === l.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div>{l.label}</div>
                    <div className="text-[10px] text-slate-400">{l.note}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Business & Product Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Product / Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={productOrService}
                  onChange={(e) => setProductOrService(e.target.value)}
                  placeholder="e.g. Handmade Leather Wallets, AC Repairing Service"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Business Niche / Category
                </label>
                <input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="e.g. Retail Fashion, Freelance Graphic Designer"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Working women in Tier-1 & Tier-2 cities"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Offer / Campaign / Specific Details
                </label>
                <textarea
                  rows={2}
                  value={offerDetails}
                  onChange={(e) => setOfferDetails(e.target.value)}
                  placeholder="e.g. Buy 1 Get 1 Free till Sunday, Flat ₹500 off on first booking"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {contentType === 'whatsapp_reply' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Customer's Message to Reply to
                  </label>
                  <textarea
                    rows={2}
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    placeholder="Paste the customer's WhatsApp or DM question here"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Tone & Length */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as ContentTone)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="friendly">Friendly & Warm</option>
                  <option value="professional">Professional</option>
                  <option value="festive">Festive & Celebratory</option>
                  <option value="urgent">Urgent (Limited Time)</option>
                  <option value="persuasive">Persuasive / Sales</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Length</label>
                <select
                  value={desiredLength}
                  onChange={(e) => setDesiredLength(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="short">Short (WhatsApp/SMS)</option>
                  <option value="medium">Medium (Instagram/Social)</option>
                  <option value="detailed">Detailed (Email/Article)</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Copy Variations</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Stream (Right Column) */}
        <div className="lg:col-span-7 space-y-6">
          {loading && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Generating copy in {language.toUpperCase()}...
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Analyzing cultural context, festival nuances, and high-converting call-to-actions.
              </p>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ready to Generate</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Select your format, enter your product name, and click <strong>Generate Copy Variations</strong> to receive 3 tailored angles ready to post or send.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Marketing Tip Callout */}
              {result.tip && (
                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-200 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Marketing Strategy Tip: </span>
                    <span>{result.tip}</span>
                  </div>
                </div>
              )}

              {/* Variations */}
              {result.variations.map((v, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        {v.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => copyToClipboard(v.content, idx)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Main Copy */}
                  <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {v.content}
                  </div>

                  {/* Bullet Points / Hashtags */}
                  {v.hashtags && v.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                      {v.hashtags.map((h, i) => (
                        <span key={i}>{h.startsWith('#') ? h : `#${h}`}</span>
                      ))}
                    </div>
                  )}

                  {v.callToAction && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <strong>Recommended CTA:</strong> {v.callToAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
