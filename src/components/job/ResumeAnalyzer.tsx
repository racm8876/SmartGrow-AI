import React, { useState } from 'react';
import {
  ScanSearch,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  Loader2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ResumeAnalysisResult } from '../../types';
import * as api from '../../services/api';

export const ResumeAnalyzer: React.FC = () => {
  const { addToast, refreshUserData } = useApp();

  const [targetRole, setTargetRole] = useState('Frontend Engineer (React + TypeScript)');
  const [resumeText, setResumeText] = useState(
    `Aarav Sharma
Software Engineer | aarav.sharma@gmail.com | +91 98765 43210
Summary: Software engineer with 2 years of experience in React, JavaScript, and Node.js.
Experience:
- Software Engineer at Krypton Labs (2024 - Present): Worked on merchant dashboard, built UI components, improved page speed by 30%.
- Intern at PixelCraft (2023 - 2024): Built internal dashboards using React and CSS.
Skills: React, JavaScript, TypeScript, Node.js, HTML, CSS, Git, Docker
Education: B.Tech in CSE, Vellore Institute of Technology, 2024.`
  );

  const [jobDescriptionText, setJobDescriptionText] = useState(
    `Role: Frontend Engineer - Razorpay
Requirements:
- 2+ years of hands-on experience building web apps in React, TypeScript, and modern state management (Zustand/Redux).
- Deep knowledge of Web Vitals, browser rendering performance, and bundle optimization.
- Experience with Jest/Playwright for automated testing, CI/CD, and Docker.
- Strong understanding of REST APIs, payment gateways, and accessible semantic HTML.
- Excellent problem-solving skills and clean code practices.`
  );

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim() || !jobDescriptionText.trim()) {
      addToast('error', 'Please provide both your Resume text and the Job Description.');
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const res = await api.analyzeResume({
        resumeText,
        jobDescriptionText,
        targetRole,
      });

      if (res.success && res.data) {
        setAnalysis(res.data);
        await refreshUserData();
        addToast('success', 'Resume analyzed successfully against job description.');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Analysis failed. Check server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ScanSearch className="w-5 h-5 text-blue-600" />
          <span>ATS Resume vs Job Description Analyzer</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Semantically evaluate keyword density, matched technical proficiencies, and missing recruiter qualifiers.
        </p>
      </div>

      {/* Honest Heuristic Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <span className="font-semibold">Algorithmic Heuristic Notice: </span>
          <span>
            Keyword matching scores are estimated guidelines based on automated semantic analysis. Real hiring involves subjective portfolio evaluations and recruiter screenings; scores are not guarantees of interview shortlisting.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Inputs (Left Column) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <form onSubmit={handleAnalyze} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Role / Job Title
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Paste Resume Text *
              </label>
              <textarea
                rows={7}
                required
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the full text of your resume..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Paste Target Job Description (JD) *
              </label>
              <textarea
                rows={7}
                required
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste the complete job description from LinkedIn, Naukri, or Careers page..."
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
                  <span>Evaluating ATS Match...</span>
                </>
              ) : (
                <>
                  <ScanSearch className="w-4 h-4" />
                  <span>Analyze Resume vs JD</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Analysis Stream (Right Column) */}
        <div className="lg:col-span-7 space-y-5">
          {loading && (
            <div className="p-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Auditing Semantic Match & Keyword Density...
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Comparing required vs preferred proficiencies, extracting missing terms, and scoring ATS compatibility.
              </p>
            </div>
          )}

          {!loading && !analysis && (
            <div className="p-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <ScanSearch className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Awaiting Inputs</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Click <strong>"Analyze Resume vs JD"</strong> to see exact skill intersections, missing keywords, and 3 specific bullet rewrites.
              </p>
            </div>
          )}

          {analysis && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Score Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Estimated Match Score
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{analysis.summary}</h3>
                </div>

                <div className="shrink-0 text-center px-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div
                    className={`text-4xl font-extrabold font-mono tabular-nums ${
                      analysis.matchScore >= 75
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : analysis.matchScore >= 50
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {analysis.matchScore}
                    <span className="text-xl text-slate-400">/100</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">Algorithmic Match</div>
                </div>
              </div>

              {/* Matched vs Missing Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Matched Keywords & Skills ({analysis.matchedSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matchedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Missing Keywords ({analysis.missingKeywords.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specific Bullet Rewrites */}
              {analysis.bulletPointImprovements && analysis.bulletPointImprovements.length > 0 && (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Actionable Bullet Point Improvements
                  </h4>
                  <div className="space-y-4">
                    {analysis.bulletPointImprovements.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2"
                      >
                        <div>
                          <div className="text-[11px] font-semibold text-slate-500 mb-0.5">Original (Weak):</div>
                          <div className="text-slate-700 dark:text-slate-300 line-through opacity-70">
                            "{item.original}"
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                            Recommended ATS Rewrite:
                          </div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            "{item.improved}"
                          </div>
                        </div>

                        <div className="text-[11px] text-blue-600 dark:text-blue-400">
                          <strong>Why:</strong> {item.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formatting & Role Specific Advice */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recruiter Tips & Formatting Guidelines
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4">
                  {analysis.formattingSuggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                  {analysis.roleSpecificTips.map((tip, idx) => (
                    <li key={`tip_${idx}`}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
