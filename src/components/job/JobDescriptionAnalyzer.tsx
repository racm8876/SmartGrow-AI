import React, { useState } from 'react';
import {
  FileSearch,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Briefcase,
  Layers,
  Tag,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JobDescriptionAnalysisResult } from '../../types';
import * as api from '../../services/api';

export const JobDescriptionAnalyzer: React.FC = () => {
  const { addToast, refreshUserData } = useApp();

  const [rawJd, setRawJd] = useState(
    `Senior Full Stack Developer - Remote India
About the Role:
We are looking for a Senior Full Stack Developer to lead our merchant billing platform. You will build high-throughput microservices in Node.js & TypeScript, integrate payment gateways (Razorpay, Stripe), and build responsive frontends in React 19 and Tailwind CSS.

Requirements:
- 3+ years experience with React, TypeScript, and modern state architecture.
- Strong backend experience with Node.js, Express, PostgreSQL, and Redis caching.
- Experience with Docker, Kubernetes, and AWS deployment pipelines.
- Knowledge of WebSockets and real-time ledger reconciliation.
- Excellent English communication skills.`
  );

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JobDescriptionAnalysisResult | null>(null);
  const [copiedKw, setCopiedKw] = useState(false);

  const handleAnalyzeJd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawJd.trim()) {
      addToast('error', 'Please paste a job description.');
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const res = await api.analyzeJobDescription(rawJd);
      if (res.success && res.data) {
        setAnalysis(res.data);
        await refreshUserData();
        addToast('success', 'Job description deconstructed into structured insights!');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to analyze job description.');
    } finally {
      setLoading(false);
    }
  };

  const copyKeywords = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.importantKeywords.join(', '));
    setCopiedKw(true);
    addToast('info', 'Keywords copied to clipboard!');
    setTimeout(() => setCopiedKw(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-blue-600" />
          <span>Job Description (JD) Deconstructor</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Extract core technical must-haves, nice-to-haves, exact experience thresholds, and high-probability interview topics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <form onSubmit={handleAnalyzeJd} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Paste Job Description Text *
              </label>
              <textarea
                rows={12}
                required
                value={rawJd}
                onChange={(e) => setRawJd(e.target.value)}
                placeholder="Paste the complete text from LinkedIn, Naukri, Indeed, or career portal..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Parsing Requirements...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Deconstruct Job Description</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results View */}
        <div className="lg:col-span-7 space-y-5">
          {loading && (
            <div className="p-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Deconstructing Job Requirements...
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Categorizing hard requirements, extracting resume keywords, and mapping technical topics.
              </p>
            </div>
          )}

          {!loading && !analysis && (
            <div className="p-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Awaiting Job Description</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Paste any job posting on the left to extract structured required skills, keywords for your resume, and likely interview questions.
              </p>
            </div>
          )}

          {analysis && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Header Badge */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{analysis.roleTitle}</h3>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Experience Required: <span className="font-semibold text-blue-600">{analysis.experienceRequirement}</span>
                  </div>
                </div>

                <button
                  onClick={copyKeywords}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                >
                  {copiedKw ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Keywords</span>
                </button>
              </div>

              {/* Skills Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Must-Have Skills ({analysis.requiredSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.requiredSkills.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Preferred / Bonus Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.preferredSkills.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Core Responsibilities */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Core Day-to-Day Responsibilities
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {analysis.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* High Frequency Keywords */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Important Keywords to Embed in Your Resume</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.importantKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60 font-mono"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Likely Interview Topics */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  High-Probability Interview Discussion Topics
                </h4>
                <div className="space-y-3">
                  {analysis.potentialInterviewTopics.map((topic, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-900 dark:text-white">{topic.topic}</div>
                      <div className="text-slate-600 dark:text-slate-400">
                        <strong>Why Interviewers Ask:</strong> {topic.whyImportant}
                      </div>
                      <div className="text-blue-600 dark:text-blue-400">
                        <strong>Suggested Prep:</strong> {topic.suggestedFocus}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
