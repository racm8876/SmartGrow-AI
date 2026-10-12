import React, { useState, useRef } from 'react';
import {
  FileUser,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  Save,
  Check,
  RotateCcw,
  Layout,
  ExternalLink,
  ChevronRight,
  Loader2,
  Upload,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Split,
  Eye,
  SlidersHorizontal,
  FolderOpen,
  Copy,
  ScanSearch,
  BookOpen,
  Award,
  Briefcase,
  GraduationCap,
  Wrench,
  HelpCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ResumeData, WorkExperience, Education, Project, Certification, ResumeAnalysisResult } from '../../types';
import * as api from '../../services/api';
import { generateResumeDocx } from '../../utils/docxExport';

type ViewMode = 'edit' | 'preview' | 'compare';
type TemplateId = 'modern' | 'classic' | 'technical' | 'compact';

export const ResumeBuilder: React.FC = () => {
  const { resumes, saveResumeDoc, removeResumeDoc, addToast, user, openAuthModal } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize clean blank/profile resume
  const createDefaultResume = (): ResumeData => ({
    id: `res_${Date.now()}`,
    title: 'Professional Resume',
    personal: {
      fullName: user?.name || user?.jobSeekerProfile?.fullName || '',
      email: user?.email || user?.jobSeekerProfile?.email || '',
      phone: user?.jobSeekerProfile?.phone || '',
      location: user?.jobSeekerProfile?.location || '',
      headline: user?.jobSeekerProfile?.targetRole || '',
      summary: '',
      linkedin: user?.jobSeekerProfile?.linkedinUrl || '',
      github: user?.jobSeekerProfile?.githubUrl || '',
      portfolio: user?.jobSeekerProfile?.portfolioUrl || '',
    },
    experience: [],
    education: [],
    skills: {
      technical: user?.jobSeekerProfile?.primarySkills || [],
      soft: [],
      tools: [],
    },
    projects: [],
    certifications: [],
    template: 'modern',
    updatedAt: new Date().toISOString(),
  });

  // Current active resume state
  const [resume, setResume] = useState<ResumeData>(() => resumes[0] || createDefaultResume());

  // Original snapshot for comparison
  const [originalResume, setOriginalResume] = useState<ResumeData | null>(() => resumes[0] || null);

  const [activeTab, setActiveTab] = useState<ViewMode>('edit');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');

  // Loaders
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [polishingId, setPolishingId] = useState<string | null>(null);
  const [isAuditingGrammar, setIsAuditingGrammar] = useState(false);
  const [grammarReport, setGrammarReport] = useState<{
    overallGrade: string;
    grammarScore: number;
    issuesFound: { type: string; originalText: string; improvedText: string; explanation: string }[];
    recommendedSummary?: string;
    generalAdvice: string[];
  } | null>(null);

  // ATS JD Check State
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [targetJobDescription, setTargetJobDescription] = useState('');
  const [targetRoleInput, setTargetRoleInput] = useState(resume.personal.headline || '');
  const [isAnalyzingAts, setIsAnalyzingAts] = useState(false);
  const [atsResult, setAtsResult] = useState<ResumeAnalysisResult | null>(null);

  // Quick technical skill input state
  const [skillInput, setSkillInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [softInput, setSoftInput] = useState('');

  // ==========================================
  // FILE UPLOAD & PARSER (PDF, DOCX, TXT)
  // ==========================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];

    const fileName = file.name.toLowerCase();
    const isAllowedExt =
      fileName.endsWith('.pdf') ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc') ||
      fileName.endsWith('.txt');

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      addToast('error', 'Please upload a PDF (.pdf), Word (.docx), or Text (.txt) file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('error', 'File size exceeds 10MB limit. Please upload a smaller resume file.');
      return;
    }

    setIsUploading(true);
    setUploadStatusText('Reading document bytes...');

    try {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string) || '';
          setUploadStatusText('Extracting real qualifications with Gemini AI...');

          const res = await api.parseResumeFile({
            fileBase64: base64Data,
            fileName: file.name,
            fileMimeType: file.type || 'application/pdf',
          });

          if (res.success && res.data) {
            const parsed = res.data;
            const updatedResume: ResumeData = {
              ...resume,
              title: parsed.title || `${file.name.replace(/\.[^/.]+$/, '')} (Imported)`,
              personal: {
                fullName: parsed.personal?.fullName || resume.personal.fullName,
                email: parsed.personal?.email || resume.personal.email,
                phone: parsed.personal?.phone || resume.personal.phone,
                location: parsed.personal?.location || resume.personal.location,
                headline: parsed.personal?.headline || resume.personal.headline,
                summary: parsed.personal?.summary || resume.personal.summary,
                linkedin: parsed.personal?.linkedin || resume.personal.linkedin,
                github: parsed.personal?.github || resume.personal.github,
                portfolio: parsed.personal?.portfolio || resume.personal.portfolio,
              },
              experience: parsed.experience || [],
              education: parsed.education || [],
              skills: {
                technical: parsed.skills?.technical || [],
                soft: parsed.skills?.soft || [],
                tools: parsed.skills?.tools || [],
              },
              projects: parsed.projects || [],
              certifications: parsed.certifications || [],
              updatedAt: new Date().toISOString(),
            };

            // Store original snapshot for comparison
            setOriginalResume(JSON.parse(JSON.stringify(updatedResume)));
            setResume(updatedResume);

            addToast(
              'success',
              `Successfully extracted ${updatedResume.experience.length} roles and ${updatedResume.skills.technical.length} skills!`
            );
            setActiveTab('edit');
          } else {
            throw new Error('Failed to parse resume structured data.');
          }
        } catch (parseErr: any) {
          addToast('error', parseErr.message || 'Failed to extract resume content.');
        } finally {
          setIsUploading(false);
          setUploadStatusText('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };

      reader.onerror = () => {
        addToast('error', 'Error reading uploaded file.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      addToast('error', err.message || 'File upload error.');
      setIsUploading(false);
    }
  };

  // ==========================================
  // AI POLISH INDIVIDUAL BULLET
  // ==========================================
  const handlePolishBullet = async (targetKey: string, currentText: string) => {
    if (!currentText.trim()) {
      addToast('error', 'Please enter some text in the bullet point first.');
      return;
    }

    setPolishingId(targetKey);
    try {
      const res = await api.polishResumeBullet({
        rawBullet: currentText,
        targetRole: resume.personal.headline || 'Professional',
      });

      if (res.success && res.data) {
        const enhanced = res.data.enhanced || (res.data as any).polishedBullets?.[0]?.text;
        if (enhanced) {
          // Update in experience
          setResume((prev) => ({
            ...prev,
            experience: prev.experience.map((exp) => ({
              ...exp,
              bullets: exp.bullets.map((b, i) => (`${exp.id}_${i}` === targetKey ? enhanced : b)),
            })),
          }));
          addToast('success', 'Bullet point rewritten with high-impact action verbs!');
        }
      }
    } catch (err: any) {
      addToast('error', err.message || 'AI bullet enhancement failed.');
    } finally {
      setPolishingId(null);
    }
  };

  // ==========================================
  // AI POLISH EXECUTIVE SUMMARY
  // ==========================================
  const handlePolishSummary = async () => {
    if (!resume.personal.summary.trim()) {
      addToast('error', 'Please write a brief summary draft first.');
      return;
    }

    setPolishingId('summary');
    try {
      const res = await api.polishResumeBullet({
        rawBullet: resume.personal.summary,
        targetRole: resume.personal.headline || 'Professional',
        actionVerbTone: 'Executive Summary',
      });

      if (res.success && res.data) {
        const enhanced =
          (res.data as any).executiveSummarySuggestion ||
          res.data.enhanced ||
          (res.data as any).polishedBullets?.[0]?.text;

        if (enhanced) {
          setResume((prev) => ({
            ...prev,
            personal: { ...prev.personal, summary: enhanced },
          }));
          addToast('success', 'Executive summary refined for recruiter ATS!');
        }
      }
    } catch (err: any) {
      addToast('error', err.message || 'AI summary enhancement failed.');
    } finally {
      setPolishingId(null);
    }
  };

  // ==========================================
  // AUDIT GRAMMAR & FORMATTING
  // ==========================================
  const handleAuditGrammar = async () => {
    setIsAuditingGrammar(true);
    setGrammarReport(null);

    try {
      const res = await api.auditResumeGrammar({ resume });
      if (res.success && res.data) {
        setGrammarReport(res.data);
        addToast('success', `Grammar audit complete. Score: ${res.data.grammarScore}/100`);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Grammar audit failed.');
    } finally {
      setIsAuditingGrammar(false);
    }
  };

  const applyGrammarFix = (issue: { originalText: string; improvedText: string }) => {
    // Replace in summary
    if (resume.personal.summary.includes(issue.originalText)) {
      setResume((prev) => ({
        ...prev,
        personal: {
          ...prev.personal,
          summary: prev.personal.summary.replace(issue.originalText, issue.improvedText),
        },
      }));
      addToast('success', 'Applied fix to summary.');
      return;
    }

    // Replace in experience bullets
    let found = false;
    const newExp = resume.experience.map((exp) => ({
      ...exp,
      bullets: exp.bullets.map((b) => {
        if (b.includes(issue.originalText)) {
          found = true;
          return b.replace(issue.originalText, issue.improvedText);
        }
        return b;
      }),
    }));

    if (found) {
      setResume((prev) => ({ ...prev, experience: newExp }));
      addToast('success', 'Applied fix to experience bullet.');
      return;
    }

    addToast('info', 'Suggestion noted. You can paste it into the relevant field.');
  };

  // ==========================================
  // RUN ATS JD CHECK
  // ==========================================
  const handleRunAtsCheck = async () => {
    if (!targetJobDescription.trim()) {
      addToast('error', 'Please paste the target Job Description.');
      return;
    }

    setIsAnalyzingAts(true);
    setAtsResult(null);

    try {
      // Build plain text representation of resume
      const plainResume = `
Name: ${resume.personal.fullName}
Headline: ${resume.personal.headline}
Summary: ${resume.personal.summary}

Experience:
${resume.experience
  .map(
    (exp) => `
- ${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate}):
  ${exp.bullets.join('\n  ')}
`
  )
  .join('\n')}

Education:
${resume.education.map((edu) => `- ${edu.degree} in ${edu.field}, ${edu.institution} (${edu.graduationYear})`).join('\n')}

Skills:
- Technical: ${resume.skills.technical.join(', ')}
- Tools: ${resume.skills.tools.join(', ')}
- Soft Skills: ${resume.skills.soft.join(', ')}

Projects:
${resume.projects.map((p) => `- ${p.title}: ${p.description} (${p.technologies.join(', ')})`).join('\n')}
      `.trim();

      const res = await api.analyzeResume({
        resumeText: plainResume,
        jobDescriptionText: targetJobDescription,
        targetRole: targetRoleInput || resume.personal.headline,
      });

      if (res.success && res.data) {
        setAtsResult(res.data);
        addToast('success', `ATS Evaluation Complete: ${res.data.matchScore}% Match Score`);
      }
    } catch (err: any) {
      addToast('error', err.message || 'ATS Analysis failed.');
    } finally {
      setIsAnalyzingAts(false);
    }
  };

  const handleAddMissingKeyword = (keyword: string) => {
    if (resume.skills.technical.includes(keyword) || resume.skills.tools.includes(keyword)) {
      addToast('info', `Keyword "${keyword}" is already in your skills.`);
      return;
    }

    setResume((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: [...prev.skills.technical, keyword],
      },
    }));
    addToast('success', `Added "${keyword}" to Technical Skills.`);
  };

  // ==========================================
  // FIRESTORE SAVE & MANAGEMENT
  // ==========================================
  const handleSaveResume = async () => {
    if (!user) {
      addToast('info', 'Please sign in to save resumes to your cloud account.');
      openAuthModal('signup');
      return;
    }

    setIsSaving(true);
    try {
      await saveResumeDoc(resume);
      addToast('success', 'Resume saved securely to Firebase Firestore!');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to save resume.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewResume = () => {
    const blank = createDefaultResume();
    setResume(blank);
    setOriginalResume(blank);
    setActiveTab('edit');
    addToast('info', 'Created a new blank resume template.');
  };

  // ==========================================
  // DOCX DOWNLOAD
  // ==========================================
  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      const blob = await generateResumeDocx(resume);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = (resume.personal.fullName || 'Candidate').trim().replace(/\s+/g, '_');
      link.href = url;
      link.download = `${safeName}_ATS_Resume.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('success', 'Downloaded formatted Microsoft Word (.docx) resume!');
    } catch (err: any) {
      addToast('error', err.message || 'DOCX export failed.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // ==========================================
  // SUB-ITEM MUTATORS
  // ==========================================
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `exp_${Date.now()}`,
      company: '',
      role: '',
      location: '',
      startDate: '2023-01',
      endDate: 'Present',
      current: true,
      bullets: [''],
    };
    setResume((prev) => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: `edu_${Date.now()}`,
      institution: '',
      degree: 'B.Tech',
      field: 'Computer Science',
      location: '',
      graduationYear: '2024',
      grade: '',
    };
    setResume((prev) => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const addProject = () => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      title: '',
      description: '',
      technologies: [],
      bullets: [''],
    };
    setResume((prev) => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const addCertification = () => {
    const newCert: Certification = {
      id: `cert_${Date.now()}`,
      title: '',
      issuer: '',
      date: '2024',
    };
    setResume((prev) => ({ ...prev, certifications: [...prev.certifications, newCert] }));
  };

  const addTechnicalSkill = () => {
    if (!skillInput.trim()) return;
    if (!resume.skills.technical.includes(skillInput.trim())) {
      setResume((prev) => ({
        ...prev,
        skills: { ...prev.skills, technical: [...prev.skills.technical, skillInput.trim()] },
      }));
    }
    setSkillInput('');
  };

  const addToolSkill = () => {
    if (!toolInput.trim()) return;
    if (!resume.skills.tools.includes(toolInput.trim())) {
      setResume((prev) => ({
        ...prev,
        skills: { ...prev.skills, tools: [...prev.skills.tools, toolInput.trim()] },
      }));
    }
    setToolInput('');
  };

  const addSoftSkill = () => {
    if (!softInput.trim()) return;
    if (!resume.skills.soft.includes(softInput.trim())) {
      setResume((prev) => ({
        ...prev,
        skills: { ...prev.skills, soft: [...prev.skills.soft, softInput.trim()] },
      }));
    }
    setSoftInput('');
  };

  // ==========================================
  // RENDER TEMPLATES FOR LIVE PREVIEW
  // ==========================================
  const renderResumeDocument = () => {
    if (selectedTemplate === 'classic') {
      return (
        <div className="bg-white text-slate-900 rounded-2xl max-w-4xl mx-auto p-12 border border-slate-200 shadow-xl font-serif print:border-none print:shadow-none print:p-0">
          {/* Classic Executive Header */}
          <div className="text-center pb-5 border-b-2 border-slate-900 space-y-1">
            <h1 className="text-2xl font-bold tracking-wider uppercase text-slate-900">
              {resume.personal.fullName || 'Candidate Name'}
            </h1>
            <div className="text-sm font-semibold tracking-wide text-slate-700 italic">
              {resume.personal.headline}
            </div>
            <div className="text-xs text-slate-600 flex flex-wrap justify-center gap-2 pt-1 font-sans">
              <span>{resume.personal.email}</span>
              {resume.personal.phone && <span>• {resume.personal.phone}</span>}
              {resume.personal.location && <span>• {resume.personal.location}</span>}
              {resume.personal.linkedin && <span>• {resume.personal.linkedin}</span>}
              {resume.personal.github && <span>• {resume.personal.github}</span>}
            </div>
          </div>

          {/* Summary */}
          {resume.personal.summary && (
            <div className="py-4 border-b border-slate-300">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-1 font-sans">
                Professional Profile
              </h2>
              <p className="text-xs text-slate-800 leading-relaxed text-justify">{resume.personal.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resume.experience.length > 0 && (
            <div className="py-4 border-b border-slate-300 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">
                Professional Experience
              </h2>
              {resume.experience.map((exp) => (
                <div key={exp.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>
                      {exp.role} <span className="font-normal italic">| {exp.company}</span>
                    </span>
                    <span className="font-sans text-[11px] text-slate-600 font-normal">
                      {exp.startDate} – {exp.endDate} {exp.location ? `• ${exp.location}` : ''}
                    </span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-800 mt-1">
                    {exp.bullets.filter(Boolean).map((bullet, bi) => (
                      <li key={bi} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <div className="py-4 border-b border-slate-300 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">Education</h2>
              {resume.education.map((edu) => (
                <div key={edu.id} className="flex justify-between text-xs text-slate-900">
                  <div>
                    <span className="font-bold">{edu.institution}</span> — {edu.degree} in {edu.field}
                    {edu.grade && <span className="text-slate-600"> (Grade: {edu.grade})</span>}
                  </div>
                  <div className="font-sans text-slate-600 text-[11px]">{edu.graduationYear}</div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          <div className="py-4 space-y-1.5 text-xs font-sans">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-2">Key Competencies</h2>
            {resume.skills.technical.length > 0 && (
              <div className="text-slate-800">
                <strong className="text-slate-900">Technical Skills: </strong>
                {resume.skills.technical.join(', ')}
              </div>
            )}
            {resume.skills.tools.length > 0 && (
              <div className="text-slate-800">
                <strong className="text-slate-900">Tools & Frameworks: </strong>
                {resume.skills.tools.join(', ')}
              </div>
            )}
            {resume.skills.soft.length > 0 && (
              <div className="text-slate-800">
                <strong className="text-slate-900">Professional Traits: </strong>
                {resume.skills.soft.join(', ')}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (selectedTemplate === 'technical') {
      return (
        <div className="bg-slate-950 text-slate-100 rounded-2xl max-w-4xl mx-auto p-10 border border-slate-800 shadow-xl print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
          {/* Technical Developer Header */}
          <div className="pb-6 border-b border-slate-800 print:border-slate-300 space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h1 className="text-2xl font-bold font-mono text-emerald-400 print:text-slate-900">
                  {resume.personal.fullName || 'Candidate Name'}
                </h1>
                <div className="text-sm font-semibold text-slate-300 print:text-slate-700">
                  {resume.personal.headline}
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 print:text-slate-600 font-mono space-y-0.5">
                <div>{resume.personal.email}</div>
                <div>{resume.personal.phone}</div>
                <div>{resume.personal.location}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono pt-2">
              {resume.personal.github && (
                <span className="px-2 py-0.5 bg-slate-800 print:bg-slate-100 rounded text-emerald-400 print:text-emerald-700">
                  gh: {resume.personal.github}
                </span>
              )}
              {resume.personal.linkedin && (
                <span className="px-2 py-0.5 bg-slate-800 print:bg-slate-100 rounded text-blue-400 print:text-blue-700">
                  in: {resume.personal.linkedin}
                </span>
              )}
              {resume.personal.portfolio && (
                <span className="px-2 py-0.5 bg-slate-800 print:bg-slate-100 rounded text-amber-400 print:text-amber-700">
                  web: {resume.personal.portfolio}
                </span>
              )}
            </div>
          </div>

          {/* Technical Stack Badges */}
          <div className="py-4 border-b border-slate-800 print:border-slate-300 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-slate-900 font-mono">
              // TECHNICAL STACK
            </h2>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {resume.skills.technical.map((s, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-emerald-950/60 print:bg-slate-100 border border-emerald-800/40 print:border-slate-300 text-emerald-300 print:text-slate-800 rounded"
                >
                  {s}
                </span>
              ))}
              {resume.skills.tools.map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-blue-950/60 print:bg-slate-100 border border-blue-800/40 print:border-slate-300 text-blue-300 print:text-slate-800 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Summary */}
          {resume.personal.summary && (
            <div className="py-4 border-b border-slate-800 print:border-slate-300 text-xs text-slate-300 print:text-slate-800 leading-relaxed font-sans">
              {resume.personal.summary}
            </div>
          )}

          {/* Experience */}
          {resume.experience.length > 0 && (
            <div className="py-4 border-b border-slate-800 print:border-slate-300 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-slate-900 font-mono">
                // WORK EXPERIENCE
              </h2>
              {resume.experience.map((exp) => (
                <div key={exp.id} className="space-y-1 text-xs">
                  <div className="flex justify-between items-baseline font-mono">
                    <span className="font-bold text-slate-100 print:text-slate-900 text-sm">
                      {exp.role} <span className="text-emerald-400 print:text-blue-700">@{exp.company}</span>
                    </span>
                    <span className="text-slate-400 print:text-slate-600 text-[11px]">
                      [{exp.startDate} - {exp.endDate}]
                    </span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 print:text-slate-800 mt-1 font-sans">
                    {exp.bullets.filter(Boolean).map((bullet, bi) => (
                      <li key={bi}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {resume.projects.length > 0 && (
            <div className="py-4 border-b border-slate-800 print:border-slate-300 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-slate-900 font-mono">
                // PROJECTS & OPEN SOURCE
              </h2>
              {resume.projects.map((proj) => (
                <div key={proj.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="font-bold text-slate-100 print:text-slate-900">{proj.title}</span>
                    <span className="text-slate-400 print:text-slate-600">[{proj.technologies.join(', ')}]</span>
                  </div>
                  {proj.description && (
                    <p className="text-slate-300 print:text-slate-800 font-sans">{proj.description}</p>
                  )}
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-400 print:text-slate-700 font-sans">
                    {proj.bullets.filter(Boolean).map((b, bi) => (
                      <li key={bi}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <div className="py-4 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-slate-900 font-mono">
                // EDUCATION
              </h2>
              {resume.education.map((edu) => (
                <div key={edu.id} className="flex justify-between text-xs text-slate-300 print:text-slate-800">
                  <div>
                    <span className="font-bold text-slate-100 print:text-slate-900">{edu.institution}</span> —{' '}
                    {edu.degree} in {edu.field}
                  </div>
                  <div className="font-mono text-slate-400 print:text-slate-600">{edu.graduationYear}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (selectedTemplate === 'compact') {
      return (
        <div className="bg-white text-slate-900 rounded-2xl max-w-4xl mx-auto p-8 border border-slate-200 shadow-xl print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="pb-4 border-b border-slate-300 mb-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{resume.personal.fullName}</h1>
            <div className="text-sm font-semibold text-blue-700">{resume.personal.headline}</div>
          </div>

          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left Column (35%) */}
            <div className="col-span-4 border-r border-slate-200 pr-4 space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Contact</h3>
                <div className="space-y-1 text-slate-700 text-[11px]">
                  <div>{resume.personal.email}</div>
                  <div>{resume.personal.phone}</div>
                  <div>{resume.personal.location}</div>
                  {resume.personal.linkedin && <div className="truncate">{resume.personal.linkedin}</div>}
                  {resume.personal.github && <div className="truncate">{resume.personal.github}</div>}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Skills</h3>
                <div className="space-y-2 text-slate-800 text-[11px]">
                  <div>
                    <span className="font-semibold block text-slate-500">Tech:</span>
                    {resume.skills.technical.join(', ')}
                  </div>
                  {resume.skills.tools.length > 0 && (
                    <div>
                      <span className="font-semibold block text-slate-500">Tools:</span>
                      {resume.skills.tools.join(', ')}
                    </div>
                  )}
                  {resume.skills.soft.length > 0 && (
                    <div>
                      <span className="font-semibold block text-slate-500">Traits:</span>
                      {resume.skills.soft.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Education</h3>
                <div className="space-y-2 text-[11px]">
                  {resume.education.map((edu) => (
                    <div key={edu.id}>
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-slate-600">{edu.institution}</div>
                      <div className="text-slate-500 font-mono text-[10px]">{edu.graduationYear}</div>
                    </div>
                  ))}
                </div>
              </div>

              {resume.certifications.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Certifications</h3>
                  <div className="space-y-1.5 text-[11px]">
                    {resume.certifications.map((cert) => (
                      <div key={cert.id}>
                        <div className="font-semibold text-slate-800">{cert.title}</div>
                        <div className="text-slate-500 text-[10px]">
                          {cert.issuer} • {cert.date}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (65%) */}
            <div className="col-span-8 space-y-4 text-xs">
              {resume.personal.summary && (
                <div>
                  <h3 className="font-bold text-slate-900 uppercase text-[11px] mb-1">Summary</h3>
                  <p className="text-slate-700 leading-relaxed text-[11px]">{resume.personal.summary}</p>
                </div>
              )}

              {resume.experience.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 uppercase text-[11px] mb-2">Experience</h3>
                  <div className="space-y-3">
                    {resume.experience.map((exp) => (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                          <span>
                            {exp.role} <span className="text-blue-700 font-normal">at {exp.company}</span>
                          </span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            {exp.startDate} - {exp.endDate}
                          </span>
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                          {exp.bullets.filter(Boolean).map((bullet, bi) => (
                            <li key={bi}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resume.projects.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 uppercase text-[11px] mb-2">Projects</h3>
                  <div className="space-y-2">
                    {resume.projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="font-bold text-slate-900 text-xs">{proj.title}</div>
                        <p className="text-slate-700 text-[11px]">{proj.description}</p>
                        <ul className="list-disc pl-4 text-slate-600 text-[10px]">
                          {proj.bullets.filter(Boolean).map((b, bi) => (
                            <li key={bi}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default: Modern Clean
    return (
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl mx-auto p-10 border border-slate-200 shadow-xl print:border-none print:shadow-none print:p-0">
        <div className="h-1.5 w-full bg-blue-600 rounded-t-lg mb-6 print:hidden" />

        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-200 space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {resume.personal.fullName || 'Candidate Full Name'}
          </h1>
          <div className="text-sm font-semibold text-blue-700">{resume.personal.headline}</div>
          <div className="text-xs text-slate-600 flex flex-wrap justify-center gap-3 pt-1">
            <span>{resume.personal.email}</span>
            {resume.personal.phone && (
              <>
                <span>•</span>
                <span>{resume.personal.phone}</span>
              </>
            )}
            {resume.personal.location && (
              <>
                <span>•</span>
                <span>{resume.personal.location}</span>
              </>
            )}
            {resume.personal.linkedin && (
              <>
                <span>•</span>
                <span>{resume.personal.linkedin}</span>
              </>
            )}
            {resume.personal.github && (
              <>
                <span>•</span>
                <span>{resume.personal.github}</span>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        {resume.personal.summary && (
          <div className="py-4 border-b border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Professional Summary</h2>
            <p className="text-xs text-slate-800 leading-relaxed">{resume.personal.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div className="py-4 border-b border-slate-200 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Work Experience</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>
                    {exp.role} <span className="text-blue-700 font-normal">at {exp.company}</span>
                  </span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                {exp.location && <div className="text-[11px] text-slate-500">{exp.location}</div>}
                <ul className="list-disc pl-4 space-y-1 text-slate-800 mt-1">
                  {exp.bullets.filter(Boolean).map((bullet, bi) => (
                    <li key={bi} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div className="py-4 border-b border-slate-200 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Education</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="flex justify-between text-xs text-slate-800">
                <div>
                  <span className="font-bold text-slate-900">{edu.institution}</span> — {edu.degree} in {edu.field}
                  {edu.grade && <span className="text-slate-500"> (CGPA: {edu.grade})</span>}
                </div>
                <div className="font-mono text-slate-500 text-[11px]">{edu.graduationYear}</div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        <div className="py-4 border-b border-slate-200 space-y-2 text-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Technical Skills & Tools</h2>
          {resume.skills.technical.length > 0 && (
            <div className="text-slate-800">
              <strong>Core Technologies: </strong>
              <span>{resume.skills.technical.join(', ')}</span>
            </div>
          )}
          {resume.skills.tools.length > 0 && (
            <div className="text-slate-800">
              <strong>Tools & Platforms: </strong>
              <span>{resume.skills.tools.join(', ')}</span>
            </div>
          )}
          {resume.skills.soft.length > 0 && (
            <div className="text-slate-800">
              <strong>Professional Traits: </strong>
              <span>{resume.skills.soft.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Projects */}
        {resume.projects.length > 0 && (
          <div className="py-4 space-y-2 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Projects</h2>
            {resume.projects.map((proj) => (
              <div key={proj.id} className="space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{proj.title}</span>
                  <span className="text-blue-600 font-mono text-[11px]">{proj.technologies.join(', ')}</span>
                </div>
                {proj.description && <p className="text-slate-700">{proj.description}</p>}
                <ul className="list-disc pl-4 space-y-0.5 text-slate-800">
                  {proj.bullets.filter(Boolean).map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hidden File Input for PDF/DOCX */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileUser className="w-5 h-5 text-blue-600" />
              <span>AI Resume Builder (ATS Optimized)</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800">
              Zero Hallucination
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build and optimize resumes from authentic experience. Upload PDF/DOCX, test ATS match, polish bullets, and export clean DOCX or PDF.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Import authentic credentials from your existing PDF or DOCX file"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Upload className="w-4 h-4" />}
            <span>{isUploading ? 'Parsing...' : 'Upload PDF/DOCX'}</span>
          </button>

          {/* ATS JD Check Button */}
          <button
            onClick={() => setIsAtsModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <ScanSearch className="w-4 h-4 text-blue-600" />
            <span>ATS Match vs JD</span>
          </button>

          {/* Grammar & Clarity Audit Button */}
          <button
            onClick={handleAuditGrammar}
            disabled={isAuditingGrammar}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isAuditingGrammar ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-500" />
            )}
            <span>Audit Grammar</span>
          </button>

          {/* Save to Firestore */}
          <button
            onClick={handleSaveResume}
            disabled={isSaving}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-emerald-600" />}
            <span>Save</span>
          </button>

          {/* Export Word (.docx) */}
          <button
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="px-3 py-2 text-xs font-semibold text-blue-600 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-800 hover:bg-blue-50 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Download editable Microsoft Word DOCX"
          >
            {isExportingDocx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>DOCX</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            title="Print or export to PDF"
          >
            <Printer className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Uploading progress notification banner */}
      {isUploading && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-3 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin shrink-0 text-blue-600" />
          <div>
            <div className="font-semibold">{uploadStatusText}</div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
              Gemini AI is parsing headings, experiences, and metrics into editable fields. Your authentic credentials are strictly preserved.
            </div>
          </div>
        </div>
      )}

      {/* Saved Resumes Selector & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        {/* Saved documents switcher */}
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Resume:</span>
          <select
            value={resume.id}
            onChange={(e) => {
              const selected = resumes.find((r) => r.id === e.target.value);
              if (selected) {
                setResume(selected);
                setOriginalResume(JSON.parse(JSON.stringify(selected)));
              }
            }}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value={resume.id}>{resume.title || 'Current Resume'}</option>
            {resumes
              .filter((r) => r.id !== resume.id)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({new Date(r.updatedAt).toLocaleDateString()})
                </option>
              ))}
          </select>

          <button
            onClick={handleCreateNewResume}
            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Create new blank resume"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* View Switcher Tabs: Editor / Compare / Live Preview */}
        <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Interactive Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Original vs Optimized</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview & Print</span>
          </button>
        </div>
      </div>

      {/* Grammar Audit Report Drawer (if active) */}
      {grammarReport && (
        <div className="p-5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Grammar, Clarity & ATS Tone Audit (Grade: {grammarReport.overallGrade} | Score: {grammarReport.grammarScore}/100)
              </h3>
            </div>
            <button
              onClick={() => setGrammarReport(null)}
              className="text-amber-700 hover:text-amber-900 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {grammarReport.issuesFound.map((issue, idx) => (
              <div
                key={idx}
                className="p-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase text-[10px] text-amber-700 dark:text-amber-400">
                    {issue.type.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => applyGrammarFix(issue)}
                    className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Apply Fix</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-slate-500 line-through text-[11px]">{issue.originalText}</div>
                <div className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                  {issue.improvedText}
                </div>
                <div className="text-[10px] text-slate-500">{issue.explanation}</div>
              </div>
            ))}
          </div>

          {grammarReport.generalAdvice.length > 0 && (
            <div className="pt-2 text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Recruiter Advice: </span>
              <span>{grammarReport.generalAdvice.join(' • ')}</span>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* 1. EDITOR TAB */}
      {/* ========================================== */}
      {activeTab === 'edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Resume Title & Role Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Resume Identification</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Resume Document Title</label>
                  <input
                    type="text"
                    value={resume.title}
                    onChange={(e) => setResume({ ...resume, title: e.target.value })}
                    placeholder="e.g. Senior Full Stack Engineer - 2026"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Role / Headline *</label>
                  <input
                    type="text"
                    value={resume.personal.headline}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personal: { ...resume.personal, headline: e.target.value },
                      })
                    }
                    placeholder="e.g. Full Stack Engineer | React & Node.js"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Personal Details Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileUser className="w-4 h-4 text-blue-600" />
                <span>Personal & Contact Info</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={resume.personal.fullName}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personal: { ...resume.personal, fullName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={resume.personal.email}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personal: { ...resume.personal, email: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={resume.personal.phone}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personal: { ...resume.personal, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={resume.personal.location}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personal: { ...resume.personal, location: e.target.value },
                      })
                    }
                    placeholder="City, Country"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={resume.personal.linkedin}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personal: { ...resume.personal, linkedin: e.target.value },
                      })
                    }
                    placeholder="linkedin.com/in/username"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub Profile</label>
                  <input
                    type="text"
                    value={resume.personal.github}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        personal: { ...resume.personal, github: e.target.value },
                      })
                    }
                    placeholder="github.com/username"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-slate-700 dark:text-slate-300 text-xs">
                    Executive Summary
                  </label>
                  <button
                    type="button"
                    onClick={handlePolishSummary}
                    disabled={polishingId === 'summary'}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    {polishingId === 'summary' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    )}
                    <span>AI Polish Summary</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={resume.personal.summary}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personal: { ...resume.personal, summary: e.target.value },
                    })
                  }
                  placeholder="2-3 concise sentences detailing your core strengths, years of experience, and quantifiable achievements."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Work Experience */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>Work Experience</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Recruiters look for action verbs + metrics (e.g., "Architected payment system, reducing failures by 24%").
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addExperience}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              <div className="space-y-6">
                {resume.experience.map((exp, expIdx) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Position #{expIdx + 1}: {exp.role || 'Job Role'} {exp.company ? `@ ${exp.company}` : ''}
                      </span>
                      <button
                        onClick={() =>
                          setResume({
                            ...resume,
                            experience: resume.experience.filter((x) => x.id !== exp.id),
                          })
                        }
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Remove role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Company / Organization *</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              experience: prev.experience.map((x) =>
                                x.id === exp.id ? { ...x, company: val } : x
                              ),
                            }));
                          }}
                          placeholder="e.g. Razorpay, Swiggy, Google"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Job Title / Role *</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              experience: prev.experience.map((x) =>
                                x.id === exp.id ? { ...x, role: val } : x
                              ),
                            }));
                          }}
                          placeholder="e.g. Senior Frontend Engineer"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Start Date - End Date</label>
                        <input
                          type="text"
                          value={`${exp.startDate} - ${exp.endDate}`}
                          onChange={(e) => {
                            const parts = e.target.value.split('-');
                            setResume((prev) => ({
                              ...prev,
                              experience: prev.experience.map((x) =>
                                x.id === exp.id
                                  ? {
                                      ...x,
                                      startDate: parts[0]?.trim() || '',
                                      endDate: parts[1]?.trim() || '',
                                    }
                                  : x
                              ),
                            }));
                          }}
                          placeholder="2023-01 - Present"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              experience: prev.experience.map((x) =>
                                x.id === exp.id ? { ...x, location: val } : x
                              ),
                            }));
                          }}
                          placeholder="Bengaluru, India (or Remote)"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Responsibilities & Measurable Achievements:
                      </div>
                      {exp.bullets.map((b, bulletIdx) => {
                        const bulletKey = `${exp.id}_${bulletIdx}`;
                        const isPolishing = polishingId === bulletKey;

                        return (
                          <div key={bulletIdx} className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono text-[10px]">•</span>
                            <input
                              type="text"
                              value={b}
                              onChange={(e) => {
                                const val = e.target.value;
                                setResume((prev) => ({
                                  ...prev,
                                  experience: prev.experience.map((x) =>
                                    x.id === exp.id
                                      ? {
                                          ...x,
                                          bullets: x.bullets.map((bx, bi) => (bi === bulletIdx ? val : bx)),
                                        }
                                      : x
                                  ),
                                }));
                              }}
                              placeholder="e.g. Spearheaded microservice migration, reducing API latency by 35%."
                              className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => handlePolishBullet(bulletKey, b)}
                              disabled={isPolishing}
                              className="px-2 py-1.5 text-[10px] font-semibold rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 flex items-center gap-1 shrink-0"
                              title="Polish bullet with ATS action verbs & metric impact"
                            >
                              {isPolishing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3 text-amber-500" />
                              )}
                              <span>AI Polish</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setResume((prev) => ({
                                  ...prev,
                                  experience: prev.experience.map((x) =>
                                    x.id === exp.id
                                      ? { ...x, bullets: x.bullets.filter((_, bi) => bi !== bulletIdx) }
                                      : x
                                  ),
                                }));
                              }}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => {
                          setResume((prev) => ({
                            ...prev,
                            experience: prev.experience.map((x) =>
                              x.id === exp.id ? { ...x, bullets: [...x.bullets, ''] } : x
                            ),
                          }));
                        }}
                        className="text-[11px] text-blue-600 hover:underline pt-1 block"
                      >
                        + Add Achievement Bullet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Competencies */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>Skills & ATS Keywords</span>
              </h3>

              {/* Technical Skills */}
              <div className="space-y-2 text-xs">
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Technical Skills & Languages:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {resume.skills.technical.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px]"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setResume({
                            ...resume,
                            skills: {
                              ...resume.skills,
                              technical: resume.skills.technical.filter((_, i) => i !== idx),
                            },
                          })
                        }
                        className="text-blue-400 hover:text-red-600 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnicalSkill())}
                    placeholder="Type technical skill (e.g. React, Docker, Python) and press Enter"
                    className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={addTechnicalSkill}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Tools & Frameworks */}
              <div className="space-y-2 text-xs pt-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Tools, Cloud & Platforms:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {resume.skills.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px]"
                    >
                      <span>{tool}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setResume({
                            ...resume,
                            skills: {
                              ...resume.skills,
                              tools: resume.skills.tools.filter((_, i) => i !== idx),
                            },
                          })
                        }
                        className="text-slate-400 hover:text-red-600 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToolSkill())}
                    placeholder="Type tool (e.g. AWS, Git, Postman, Jest) and press Enter"
                    className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={addToolSkill}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Education & Projects (2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Education</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="text-xs text-blue-600 font-semibold"
                  >
                    + Add Degree
                  </button>
                </div>

                <div className="space-y-3">
                  {resume.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Degree</span>
                        <button
                          onClick={() =>
                            setResume({
                              ...resume,
                              education: resume.education.filter((x) => x.id !== edu.id),
                            })
                          }
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResume((prev) => ({
                            ...prev,
                            education: prev.education.map((ed) =>
                              ed.id === edu.id ? { ...ed, institution: val } : ed
                            ),
                          }));
                        }}
                        placeholder="Institution / College Name"
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              education: prev.education.map((ed) =>
                                ed.id === edu.id ? { ...ed, degree: val } : ed
                              ),
                            }));
                          }}
                          placeholder="Degree (e.g. B.Tech)"
                          className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                        <input
                          type="text"
                          value={edu.graduationYear}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              education: prev.education.map((ed) =>
                                ed.id === edu.id ? { ...ed, graduationYear: val } : ed
                              ),
                            }));
                          }}
                          placeholder="Year (e.g. 2024)"
                          className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>Projects</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addProject}
                    className="text-xs text-blue-600 font-semibold"
                  >
                    + Add Project
                  </button>
                </div>

                <div className="space-y-3">
                  {resume.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              projects: prev.projects.map((p) =>
                                p.id === proj.id ? { ...p, title: val } : p
                              ),
                            }));
                          }}
                          placeholder="Project Title"
                          className="flex-1 font-semibold px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                        <button
                          onClick={() =>
                            setResume({
                              ...resume,
                              projects: resume.projects.filter((x) => x.id !== proj.id),
                            })
                          }
                          className="text-slate-400 hover:text-red-600 ml-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={proj.technologies.join(', ')}
                        onChange={(e) => {
                          const val = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setResume((prev) => ({
                            ...prev,
                            projects: prev.projects.map((p) =>
                              p.id === proj.id ? { ...p, technologies: val } : p
                            ),
                          }));
                        }}
                        placeholder="Tech used: React, TypeScript, Tailwind"
                        className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Template Switcher & Guidelines) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-blue-600" />
                <span>Professional ATS Templates</span>
              </h3>
              <div className="space-y-2">
                {[
                  {
                    id: 'modern',
                    name: 'Modern Clean',
                    desc: 'Crisp sans-serif, top blue rule, highest ATS parser compatibility across Workday & Greenhouse.',
                  },
                  {
                    id: 'classic',
                    name: 'Classic Executive',
                    desc: 'Traditional serif typography, formal corporate rules favored by finance, law, & consulting.',
                  },
                  {
                    id: 'technical',
                    name: 'Technical / Developer',
                    desc: 'Monospace badges, prominent GitHub links, dense high-information engineering layout.',
                  },
                  {
                    id: 'compact',
                    name: 'Creative Compact',
                    desc: 'Two-column sidebar structure, ideal for 1-page resumes with extensive skills and projects.',
                  },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id as any)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                      selectedTemplate === tpl.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{tpl.name}</span>
                      {selectedTemplate === tpl.id && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">{tpl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ATS Compliance Rules Card */}
            <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl text-xs text-blue-900 dark:text-blue-200 space-y-3">
              <h4 className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Zero Hallucination Rules</span>
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                <li>Your uploaded employers, degrees, and employment dates are strictly locked to factual history.</li>
                <li>AI rewrites optimize phrasing with action verbs (e.g. Spearheaded, Accelerated, Automated).</li>
                <li>Never insert fake qualifications; background verification systems disqualify candidates with fabricated data.</li>
                <li>Single-column linear sections parse cleanly into recruiter ATS databases.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 2. ORIGINAL VS OPTIMIZED COMPARISON TAB */}
      {/* ========================================== */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Original Submission vs. ATS-Optimized Phrasing: </span>
                <span>
                  Compare how your raw inputs were upgraded with active voice and measurable metrics while preserving 100% of your real employers and qualifications.
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('preview')}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 shrink-0 ml-4"
            >
              View Document Preview
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Original */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">
                  Original Raw Resume
                </h3>
                <span className="px-2 py-0.5 text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                  Raw / Input
                </span>
              </div>

              {/* Original Summary */}
              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-slate-500 uppercase text-[10px]">Raw Summary</div>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  {originalResume?.personal.summary || resume.personal.summary || 'No summary provided.'}
                </p>
              </div>

              {/* Original Experience Bullets */}
              <div className="space-y-4 text-xs">
                <div className="font-semibold text-slate-500 uppercase text-[10px]">Experience Bullets</div>
                {(originalResume?.experience || resume.experience).map((exp, i) => (
                  <div key={i} className="p-3 bg-white dark:bg-slate-800 rounded-lg space-y-1.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {exp.role} @ {exp.company}
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                      {exp.bullets.filter(Boolean).map((b, bi) => (
                        <li key={bi}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Original Skills */}
              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-slate-500 uppercase text-[10px]">Original Skills</div>
                <div className="text-slate-700 dark:text-slate-300">
                  {(originalResume?.skills.technical || resume.skills.technical).join(', ')}
                </div>
              </div>
            </div>

            {/* Right Column: Optimized */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500/40 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-blue-100 dark:border-blue-900/40 pb-3">
                <h3 className="font-bold text-blue-600 dark:text-blue-400 text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>ATS-Optimized Version</span>
                </h3>
                <span className="px-2 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold rounded">
                  Action Verbs & Impact
                </span>
              </div>

              {/* Optimized Summary */}
              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-blue-600 uppercase text-[10px]">Optimized Executive Summary</div>
                <p className="text-slate-900 dark:text-white font-medium leading-relaxed">
                  {resume.personal.summary || 'Summary polished for ATS readability.'}
                </p>
              </div>

              {/* Optimized Bullets */}
              <div className="space-y-4 text-xs">
                <div className="font-semibold text-blue-600 uppercase text-[10px]">
                  Optimized Achievement Bullets
                </div>
                {resume.experience.map((exp, i) => (
                  <div
                    key={i}
                    className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-lg space-y-1.5"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">
                      {exp.role} @ {exp.company}
                    </div>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-900 dark:text-slate-200 text-[11px]">
                      {exp.bullets.filter(Boolean).map((b, bi) => (
                        <li key={bi} className="leading-relaxed">
                          <span className="font-medium">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Enriched Skills */}
              <div className="space-y-1.5 text-xs">
                <div className="font-semibold text-blue-600 uppercase text-[10px]">
                  Target ATS Keyword Density ({resume.skills.technical.length} Skills)
                </div>
                <div className="flex flex-wrap gap-1">
                  {resume.skills.technical.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. LIVE PREVIEW & PRINT TAB */}
      {/* ========================================== */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs print:hidden">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Current Layout: </span>
              <span className="font-bold uppercase text-blue-600">{selectedTemplate}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTemplate('modern')}
                className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                  selectedTemplate === 'modern' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Modern
              </button>
              <button
                onClick={() => setSelectedTemplate('classic')}
                className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                  selectedTemplate === 'classic' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Classic
              </button>
              <button
                onClick={() => setSelectedTemplate('technical')}
                className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                  selectedTemplate === 'technical' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Technical
              </button>
              <button
                onClick={() => setSelectedTemplate('compact')}
                className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                  selectedTemplate === 'compact' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Compact
              </button>

              <button
                onClick={handleDownloadDocx}
                disabled={isExportingDocx}
                className="ml-2 px-3 py-1 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Word .docx</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1 bg-blue-600 text-white rounded font-semibold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          {/* Render selected resume document layout */}
          {renderResumeDocument()}
        </div>
      )}

      {/* ========================================== */}
      {/* ATS MATCH VS JD MODAL */}
      {/* ========================================== */}
      {isAtsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <ScanSearch className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  ATS Match & Keyword Evaluation
                </h3>
              </div>
              <button
                onClick={() => setIsAtsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={targetRoleInput}
                  onChange={(e) => setTargetRoleInput(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer - React/TypeScript"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Job Description (Paste from LinkedIn, Naukri, or Careers page)
                </label>
                <textarea
                  rows={6}
                  value={targetJobDescription}
                  onChange={(e) => setTargetJobDescription(e.target.value)}
                  placeholder="Paste the full job requirements, skills, and qualifications..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <button
                onClick={handleRunAtsCheck}
                disabled={isAnalyzingAts}
                className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isAnalyzingAts ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating Against ATS Filters...</span>
                  </>
                ) : (
                  <>
                    <ScanSearch className="w-4 h-4" />
                    <span>Evaluate ATS Compatibility Score</span>
                  </>
                )}
              </button>
            </div>

            {/* ATS Result Display */}
            {atsResult && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                {/* Score Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase font-semibold">Estimated ATS Compatibility</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {atsResult.matchScore}/100{' '}
                      <span className="text-xs font-medium text-emerald-600">
                        {atsResult.matchScore >= 75
                          ? '• Strong Match'
                          : atsResult.matchScore >= 50
                          ? '• Moderate Match'
                          : '• Low Match'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{atsResult.summary}</p>

                {/* Missing Keywords with 1-click Add */}
                {atsResult.missingKeywords.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="font-semibold text-red-600 dark:text-red-400">
                      Missing ATS Keywords (Click to add to your skills):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {atsResult.missingKeywords.map((kw, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddMissingKeyword(kw)}
                          className="px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-[11px] font-medium hover:bg-red-100 flex items-center gap-1"
                        >
                          <span>+ {kw}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Skills */}
                {atsResult.matchedSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Matched Recruiter Skills:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {atsResult.matchedSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px]"
                        >
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bullet Point Improvements */}
                {atsResult.bulletPointImprovements && atsResult.bulletPointImprovements.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Recommended Bullet Point Rewrites:
                    </div>
                    {atsResult.bulletPointImprovements.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg space-y-1"
                      >
                        <div className="text-slate-400 line-through text-[11px]">{item.original}</div>
                        <div className="text-blue-600 dark:text-blue-400 font-medium text-[11px]">
                          {item.improved}
                        </div>
                        <div className="text-[10px] text-slate-500">{item.reason}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
