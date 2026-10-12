import React, { useState } from 'react';
import {
  MessageSquareCode,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Brain,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InterviewQuestion, InterviewPracticeFeedback } from '../../types';
import * as api from '../../services/api';

const TARGET_ROLES = [
  'Full-stack Developer',
  'Software Developer',
  'Python Developer',
  'Data Analyst',
  'AI / Machine Learning Engineer',
  'Entry-level / College Fresher',
];

export const InterviewPrep: React.FC = () => {
  const { addToast, refreshUserData } = useApp();

  const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]);
  const [difficulty, setDifficulty] = useState<'fresher' | 'intermediate' | 'advanced'>('intermediate');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([
    {
      id: 'q_1',
      roleCategory: 'Full-stack Developer',
      question: 'How do you handle race conditions or idempotency in payment processing on the web?',
      difficulty: 'intermediate',
      sampleAnswer:
        'To prevent double charges or inconsistent state, I use unique idempotency keys generated on the client for each transaction attempt. On the backend, we record the key in Redis or database transactions with a unique constraint. If a duplicate request arrives, we return the cached response rather than processing another charge. Additionally, we use verified webhooks for eventual consistency.',
      starTechniqueGuide:
        'S: Describe an e-commerce checkout. T: Prevent double-tap payments. A: Implemented unique idempotency tokens & database locks. R: Zero duplicate transactions recorded.',
      followUpQuestions: [
        'What happens if the client drops connection before receiving the response?',
        'How do you design database transactions with isolation levels like Serializable?',
      ],
      evaluatorLookout:
        'Looks for understanding of network failures, distributed locks, idempotency keys, and database constraints.',
    },
    {
      id: 'q_2',
      roleCategory: 'Full-stack Developer',
      question: 'Explain how React 19 server components and hydration differ from traditional client-side rendering.',
      difficulty: 'intermediate',
      sampleAnswer:
        'React Server Components execute strictly on the server and stream serialized UI elements (JSX virtual DOM) to the client without shipping their JavaScript code to the bundle. This dramatically shrinks bundle sizes and speeds up initial meaningful paint. Hydration then attaches event listeners only to interactive client components, eliminating waterfall fetches.',
      starTechniqueGuide: 'Focus on performance metrics (LCP, bundle size) and developer ergonomic advantages.',
      followUpQuestions: [
        'How do you handle client state (like useState or browser APIs) inside Server Components?',
        'What is selective hydration in Suspense?',
      ],
      evaluatorLookout:
        'Looks for modern knowledge of React 19 architecture, core web vitals, and separation of client vs server bundles.',
    },
  ]);

  const [expandedQId, setExpandedQId] = useState<string | null>('q_1');

  // Practice Mode State
  const [practicingQuestion, setPracticingQuestion] = useState<InterviewQuestion | null>(null);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [feedback, setFeedback] = useState<InterviewPracticeFeedback | null>(null);

  const handleFetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const diffMap: Record<string, 'fresher' | 'mid' | 'senior'> = {
        fresher: 'fresher',
        intermediate: 'mid',
        advanced: 'senior',
      };
      const res = await api.getInterviewQuestions({
        targetRole: selectedRole,
        difficulty: diffMap[difficulty] || 'mid',
      });

      if (res.success && Array.isArray(res.data)) {
        setQuestions(res.data);
        setExpandedQId(res.data[0]?.id || null);
        await refreshUserData();
        addToast('success', `Generated ${res.data.length} interview questions for ${selectedRole}!`);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Failed to generate questions.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleStartPractice = (q: InterviewQuestion) => {
    setPracticingQuestion(q);
    setCandidateAnswer('');
    setFeedback(null);
  };

  const handleSubmitPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practicingQuestion || !candidateAnswer.trim()) {
      addToast('error', 'Please write your response before submitting.');
      return;
    }

    setSubmittingAnswer(true);
    setFeedback(null);

    try {
      const res = await api.evaluateInterviewAnswer({
        question: practicingQuestion.question,
        userAnswer: candidateAnswer,
        targetRole: selectedRole,
      });

      if (res.success && res.data) {
        setFeedback(res.data);
        await refreshUserData();
        addToast('success', `Answer evaluated! Score: ${res.data.scoreOutOf10}/10`);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Feedback evaluation failed.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <MessageSquareCode className="w-5 h-5 text-blue-600" />
          <span>Interview Preparation & AI Practice Coach</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Study role-targeted technical and STAR behavioral questions, then test yourself in Practice Mode for instant AI coaching.
        </p>
      </div>

      {/* Role & Difficulty Selector */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Engineering Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              {TARGET_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium capitalize"
            >
              <option value="fresher">Fresher / Campus</option>
              <option value="intermediate">Intermediate (2-4 YOE)</option>
              <option value="advanced">Senior / Lead (5+ YOE)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleFetchQuestions}
          disabled={loadingQuestions}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shrink-0"
        >
          {loadingQuestions ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Questions...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Role Questions</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Questions List (Left) + Interactive Practice Mode (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Question Bank (Left Column) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Curated Questions for {selectedRole} ({questions.length})
          </h2>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const isExpanded = expandedQId === q.id;

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                    className="p-4 cursor-pointer flex items-start justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                          {q.question}
                        </h3>
                        <div className="text-[11px] text-slate-400 capitalize mt-1">
                          Level: {q.difficulty}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartPractice(q);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                      >
                        Practice
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Model Answer & STAR Breakdown */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
                      <div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Comprehensive Model Answer
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                          {q.sampleAnswer}
                        </p>
                      </div>

                      {q.starTechniqueGuide && (
                        <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200">
                          <strong>STAR Framework Alignment: </strong>
                          <span>{q.starTechniqueGuide}</span>
                        </div>
                      )}

                      <div>
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Likely Follow-Up Questions from Interviewers
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                          {q.followUpQuestions.map((f, fi) => (
                            <li key={fi}>{f}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                        <strong>What the interviewer evaluates:</strong> {q.evaluatorLookout}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice Mode Coach (Right Column) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 sticky top-24">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Brain className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Live Practice Mode
            </h2>
          </div>

          {!practicingQuestion ? (
            <div className="text-center py-10 space-y-2">
              <Award className="w-8 h-8 text-blue-600 mx-auto" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Select a Question to Practice</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click the <strong>"Practice"</strong> button next to any question to write your answer and receive real-time scoring and constructive critique.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitPractice} className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl">
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                  Practicing Question
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {practicingQuestion.question}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Type Your Spoken Response / Answer
                </label>
                <textarea
                  rows={6}
                  required
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  placeholder="Explain your approach clearly as if you are speaking directly to the hiring manager..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAnswer}
                className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submittingAnswer ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grading & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for AI Critique</span>
                  </>
                )}
              </button>

              {/* Real AI Feedback */}
              {feedback && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white">Coach Assessment</span>
                    <span
                      className={`text-sm font-extrabold font-mono px-2 py-0.5 rounded ${
                        feedback.scoreOutOf10 >= 8
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : feedback.scoreOutOf10 >= 5
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {feedback.scoreOutOf10} / 10
                    </span>
                  </div>

                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{feedback.feedback}</p>

                  {feedback.strongPoints.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                        Strong Points:
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700 dark:text-slate-300">
                        {feedback.strongPoints.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feedback.improvementPoints.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                        Areas to Improve / Missing Nuances:
                      </div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700 dark:text-slate-300">
                        {feedback.improvementPoints.map((ip, i) => (
                          <li key={i}>{ip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feedback.refinedAnswerSuggestion && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1">
                        Refined Response Example:
                      </div>
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-200 italic">
                        "{feedback.refinedAnswerSuggestion}"
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
