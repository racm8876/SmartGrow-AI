import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ResumeData, WorkExperience, Education, Project, Certification } from '../../types';
import * as api from '../../services/api';

export const ResumeBuilder: React.FC = () => {
  const { resumes, saveResumeDoc, addToast, user } = useApp();

  const currentResume = resumes[0] || {
    id: 'res_new',
    title: 'Software Engineer Resume',
    personal: {
      fullName: user?.jobSeekerProfile?.fullName || 'Aarav Sharma',
      email: user?.jobSeekerProfile?.email || 'aarav.sharma@gmail.com',
      phone: user?.jobSeekerProfile?.phone || '+91 98765 43210',
      location: user?.jobSeekerProfile?.location || 'Bengaluru, India',
      headline: user?.jobSeekerProfile?.targetRole || 'Full Stack Engineer',
      summary:
        'Software engineer with experience building web applications and API workflows. Focused on clean code, automated tests, and responsive frontends.',
      linkedin: user?.jobSeekerProfile?.linkedinUrl || 'https://linkedin.com/in/aarav-sharma-dev',
      github: user?.jobSeekerProfile?.githubUrl || 'https://github.com/aarav-sharma',
      portfolio: user?.jobSeekerProfile?.portfolioUrl || '',
    },
    experience: [],
    education: [],
    skills: {
      technical: user?.jobSeekerProfile?.primarySkills || ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
      soft: ['Problem Solving', 'Team Collaboration', 'Agile Communication'],
      tools: ['Git', 'Docker', 'Postman'],
    },
    projects: [],
    certifications: [],
    template: 'modern',
    updatedAt: new Date().toISOString(),
  };

  const [resume, setResume] = useState<ResumeData>(currentResume);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'technical'>('modern');
  const [polishingId, setPolishingId] = useState<string | null>(null);

  // Quick AI Bullet Polish
  const handlePolishBullet = async (targetId: string, currentText: string) => {
    if (!currentText.trim()) {
      addToast('error', 'Please enter some text in the bullet point first.');
      return;
    }

    setPolishingId(targetId);
    try {
      const res = await api.polishResumeBullet({
        rawBullet: currentText,
        targetRole: resume.personal.headline,
      });

      if (res.success && res.data?.enhanced) {
        const enhanced = res.data.enhanced;
        // Update experience bullet
        setResume((prev) => ({
          ...prev,
          experience: prev.experience.map((exp) => ({
            ...exp,
            bullets: exp.bullets.map((b, i) => (`${exp.id}_${i}` === targetId ? enhanced : b)),
          })),
        }));
        addToast('success', 'Bullet point polished with ATS action verbs!');
      }
    } catch (err: any) {
      addToast('error', err.message || 'AI bullet enhancement failed.');
    } finally {
      setPolishingId(null);
    }
  };

  const handleSaveResume = async () => {
    try {
      await saveResumeDoc(resume);
      addToast('success', 'Resume saved to Firestore successfully!');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to save resume.');
    }
  };

  // Sub-item adders
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `exp_${Date.now()}`,
      company: '',
      role: '',
      location: '',
      startDate: '2024-01',
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
      grade: '8.5 CGPA',
    };
    setResume((prev) => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const addProject = () => {
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      title: '',
      description: '',
      technologies: ['React', 'TypeScript'],
      bullets: [''],
    };
    setResume((prev) => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileUser className="w-5 h-5 text-blue-600" />
            <span>AI Resume Builder (ATS Optimized)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build clean, recruiter-friendly resumes without invented credentials. Enhance bullet points with action verbs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex gap-1">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'edit'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              PDF & Print Preview
            </button>
          </div>

          <button
            onClick={handleSaveResume}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        /* EDITOR MODE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Personal Details Card */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Personal & Contact Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resume.personal.fullName}
                    onChange={(e) =>
                      setResume({ ...resume, personal: { ...resume.personal, fullName: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Headline</label>
                  <input
                    type="text"
                    value={resume.personal.headline}
                    onChange={(e) =>
                      setResume({ ...resume, personal: { ...resume.personal, headline: e.target.value } })
                    }
                    placeholder="e.g. Senior Frontend Engineer | React & TypeScript"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={resume.personal.email}
                    onChange={(e) =>
                      setResume({ ...resume, personal: { ...resume.personal, email: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={resume.personal.phone}
                    onChange={(e) =>
                      setResume({ ...resume, personal: { ...resume.personal, phone: e.target.value } })
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
                      setResume({ ...resume, personal: { ...resume.personal, location: e.target.value } })
                    }
                    placeholder="City, State"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={resume.personal.linkedin}
                    onChange={(e) =>
                      setResume({ ...resume, personal: { ...resume.personal, linkedin: e.target.value } })
                    }
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 text-xs">
                  Executive Summary
                </label>
                <textarea
                  rows={3}
                  value={resume.personal.summary}
                  onChange={(e) =>
                    setResume({ ...resume, personal: { ...resume.personal, summary: e.target.value } })
                  }
                  placeholder="2-3 concise sentences detailing your core strengths and measurable impact"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Work Experience */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Work Experience
                </h3>
                <button
                  type="button"
                  onClick={addExperience}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              <div className="space-y-5">
                {resume.experience.map((exp, expIdx) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">Role #{expIdx + 1}</span>
                      <button
                        onClick={() =>
                          setResume({
                            ...resume,
                            experience: resume.experience.filter((x) => x.id !== exp.id),
                          })
                        }
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              experience: prev.experience.map((x) => (x.id === exp.id ? { ...x, company: val } : x)),
                            }));
                          }}
                          placeholder="e.g. Swiggy India"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              experience: prev.experience.map((x) => (x.id === exp.id ? { ...x, role: val } : x)),
                            }));
                          }}
                          placeholder="e.g. Frontend Engineer"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Duration</label>
                        <input
                          type="text"
                          value={`${exp.startDate} - ${exp.endDate}`}
                          onChange={(e) => {
                            const parts = e.target.value.split('-');
                            setResume((prev) => ({
                              ...prev,
                              experience: prev.experience.map((x) =>
                                x.id === exp.id
                                  ? { ...x, startDate: parts[0]?.trim() || '', endDate: parts[1]?.trim() || '' }
                                  : x
                              ),
                            }));
                          }}
                          placeholder="2023-06 - Present"
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
                              experience: prev.experience.map((x) => (x.id === exp.id ? { ...x, location: val } : x)),
                            }));
                          }}
                          placeholder="Bengaluru, India"
                          className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Achievements & Bullet Points (Click AI Enhance to optimize for ATS):
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
                              placeholder="e.g. Optimized database query performance, decreasing latency by 30%."
                              className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => handlePolishBullet(bulletKey, b)}
                              disabled={isPolishing}
                              className="px-2 py-1.5 text-[10px] font-semibold rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 flex items-center gap-1 shrink-0"
                              title="Polish this bullet with ATS action verbs and impact metrics"
                            >
                              {isPolishing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3" />
                              )}
                              <span>AI Enhance</span>
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
                              <Trash2 className="w-3 h-3" />
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
                        + Add Bullet Point
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education & Technical Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Education */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Education
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
                  {resume.education.map((edu, eduIdx) => (
                    <div
                      key={edu.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2"
                    >
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResume((prev) => ({
                            ...prev,
                            education: prev.education.map((ed) => (ed.id === edu.id ? { ...ed, institution: val } : ed)),
                          }));
                        }}
                        placeholder="College / University Name"
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
                              education: prev.education.map((ed) => (ed.id === edu.id ? { ...ed, degree: val } : ed)),
                            }));
                          }}
                          placeholder="Degree (e.g. B.Tech, BCA)"
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
                          placeholder="Grad Year"
                          className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Technical Stack & Skills
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Technical Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      value={resume.skills.technical.join(', ')}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          skills: {
                            ...resume.skills,
                            technical: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Tools & Platforms (comma separated)
                    </label>
                    <input
                      type="text"
                      value={resume.skills.tools.join(', ')}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          skills: {
                            ...resume.skills,
                            tools: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Template Switcher & Quick Tips (Right Column) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                ATS Layout Template
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'modern', name: 'Modern Clean', desc: 'Standard single-column, highest ATS readability' },
                  { id: 'classic', name: 'Classic Executive', desc: 'Serif headings, traditional corporate format' },
                  { id: 'technical', name: 'Technical / Developer', desc: 'Emphasizes technical stack & GitHub links' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id as any)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                      selectedTemplate === tpl.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>{tpl.name}</div>
                    <div className="text-[11px] text-slate-500 font-normal mt-0.5">{tpl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl text-xs text-blue-900 dark:text-blue-200 space-y-2">
              <h4 className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>ATS Resume Writing Rules</span>
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                <li>Never use multi-column tables or text boxes; ATS parsers read linearly.</li>
                <li>Avoid vague verbs like "Assisted" or "Worked on"; use "Architected", "Engineered", "Reduced".</li>
                <li>Include numerical outcomes: % bundle reduction, latency drops, user counts.</li>
                <li>Do not invent fake companies or titles—ATS background verification will reject them.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* PRINT & PDF PREVIEW MODE */
        <div className="bg-white text-slate-900 rounded-2xl max-w-4xl mx-auto p-10 border border-slate-200 shadow-xl print-break-inside-avoid">
          {/* Resume Document Header */}
          <div className="text-center pb-6 border-b border-slate-200 space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{resume.personal.fullName}</h1>
            <div className="text-sm font-semibold text-blue-700">{resume.personal.headline}</div>
            <div className="text-xs text-slate-600 flex flex-wrap justify-center gap-3 pt-1">
              <span>{resume.personal.email}</span>
              <span>•</span>
              <span>{resume.personal.phone}</span>
              <span>•</span>
              <span>{resume.personal.location}</span>
              {resume.personal.linkedin && (
                <>
                  <span>•</span>
                  <span>{resume.personal.linkedin}</span>
                </>
              )}
            </div>
          </div>

          {/* Summary */}
          {resume.personal.summary && (
            <div className="py-4 border-b border-slate-200">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Professional Summary
              </h2>
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
                      {exp.role} <span className="text-slate-500 font-normal">at {exp.company}</span>
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  {exp.location && <div className="text-[11px] text-slate-500">{exp.location}</div>}
                  <ul className="list-disc pl-4 space-y-1 text-slate-800 mt-1">
                    {exp.bullets.filter(Boolean).map((bullet, bi) => (
                      <li key={bi}>{bullet}</li>
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
                  </div>
                  <div className="font-mono text-slate-500 text-[11px]">{edu.graduationYear}</div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          <div className="py-4 space-y-2 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Technical Skills</h2>
            <div className="text-slate-800">
              <strong>Languages & Frameworks: </strong>
              <span>{resume.skills.technical.join(', ')}</span>
            </div>
            {resume.skills.tools.length > 0 && (
              <div className="text-slate-800">
                <strong>Tools & Infrastructure: </strong>
                <span>{resume.skills.tools.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
