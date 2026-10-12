import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx';
import { ResumeData } from '../types';

export async function generateResumeDocx(resume: ResumeData): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header / Full Name
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.TITLE,
            children: [
              new TextRun({
                text: resume.personal.fullName || 'Candidate Resume',
                bold: true,
                size: 32, // 16pt
                font: 'Calibri',
              }),
            ],
          }),

          // Target Headline
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: resume.personal.headline || '',
                italics: true,
                size: 24, // 12pt
                color: '2B579A',
                font: 'Calibri',
              }),
            ],
          }),

          // Contact Details
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: [
                  resume.personal.email,
                  resume.personal.phone,
                  resume.personal.location,
                  resume.personal.linkedin,
                  resume.personal.github,
                ]
                  .filter(Boolean)
                  .join('  •  '),
                size: 20, // 10pt
                color: '555555',
                font: 'Calibri',
              }),
            ],
          }),

          // Spacing
          new Paragraph({ text: '' }),

          // Executive Summary Section
          ...(resume.personal.summary
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  children: [
                    new TextRun({
                      text: 'PROFESSIONAL SUMMARY',
                      bold: true,
                      size: 22,
                      font: 'Calibri',
                      color: '1F497D',
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: resume.personal.summary,
                      size: 21,
                      font: 'Calibri',
                    }),
                  ],
                }),
                new Paragraph({ text: '' }),
              ]
            : []),

          // Experience Section
          ...(resume.experience.length > 0
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  children: [
                    new TextRun({
                      text: 'WORK EXPERIENCE',
                      bold: true,
                      size: 22,
                      font: 'Calibri',
                      color: '1F497D',
                    }),
                  ],
                }),
                ...resume.experience.flatMap((exp) => [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: exp.role ? `${exp.role} ` : '',
                        bold: true,
                        size: 21,
                        font: 'Calibri',
                      }),
                      new TextRun({
                        text: exp.company ? `| ${exp.company} ` : '',
                        italics: true,
                        size: 21,
                        font: 'Calibri',
                      }),
                      new TextRun({
                        text: `(${exp.startDate} - ${exp.endDate || 'Present'})`,
                        color: '666666',
                        size: 20,
                        font: 'Calibri',
                      }),
                      ...(exp.location
                        ? [
                            new TextRun({
                              text: `  •  ${exp.location}`,
                              color: '666666',
                              size: 20,
                              font: 'Calibri',
                            }),
                          ]
                        : []),
                    ],
                  }),
                  ...exp.bullets
                    .filter(Boolean)
                    .map(
                      (b) =>
                        new Paragraph({
                          bullet: { level: 0 },
                          children: [
                            new TextRun({
                              text: b,
                              size: 21,
                              font: 'Calibri',
                            }),
                          ],
                        })
                    ),
                  new Paragraph({ text: '' }),
                ]),
              ]
            : []),

          // Education Section
          ...(resume.education.length > 0
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  children: [
                    new TextRun({
                      text: 'EDUCATION',
                      bold: true,
                      size: 22,
                      font: 'Calibri',
                      color: '1F497D',
                    }),
                  ],
                }),
                ...resume.education.map(
                  (edu) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${edu.degree} in ${edu.field}`,
                          bold: true,
                          size: 21,
                          font: 'Calibri',
                        }),
                        new TextRun({
                          text: ` — ${edu.institution} `,
                          size: 21,
                          font: 'Calibri',
                        }),
                        new TextRun({
                          text: `(${edu.graduationYear || ''})`,
                          color: '666666',
                          size: 20,
                          font: 'Calibri',
                        }),
                        ...(edu.grade
                          ? [
                              new TextRun({
                                text: `  •  Grade: ${edu.grade}`,
                                color: '666666',
                                size: 20,
                                font: 'Calibri',
                              }),
                            ]
                          : []),
                      ],
                    })
                ),
                new Paragraph({ text: '' }),
              ]
            : []),

          // Technical Skills Section
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: 'SKILLS & COMPETENCIES',
                bold: true,
                size: 22,
                font: 'Calibri',
                color: '1F497D',
              }),
            ],
          }),
          ...(resume.skills.technical.length > 0
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Technical Skills: ', bold: true, size: 21, font: 'Calibri' }),
                    new TextRun({ text: resume.skills.technical.join(', '), size: 21, font: 'Calibri' }),
                  ],
                }),
              ]
            : []),
          ...(resume.skills.tools.length > 0
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Tools & Technologies: ', bold: true, size: 21, font: 'Calibri' }),
                    new TextRun({ text: resume.skills.tools.join(', '), size: 21, font: 'Calibri' }),
                  ],
                }),
              ]
            : []),
          ...(resume.skills.soft.length > 0
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Core Strengths: ', bold: true, size: 21, font: 'Calibri' }),
                    new TextRun({ text: resume.skills.soft.join(', '), size: 21, font: 'Calibri' }),
                  ],
                }),
              ]
            : []),

          // Projects Section (if any)
          ...(resume.projects && resume.projects.length > 0
            ? [
                new Paragraph({ text: '' }),
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  children: [
                    new TextRun({
                      text: 'PROJECTS',
                      bold: true,
                      size: 22,
                      font: 'Calibri',
                      color: '1F497D',
                    }),
                  ],
                }),
                ...resume.projects.flatMap((proj) => [
                  new Paragraph({
                    children: [
                      new TextRun({ text: proj.title, bold: true, size: 21, font: 'Calibri' }),
                      ...(proj.technologies && proj.technologies.length > 0
                        ? [
                            new TextRun({
                              text: `  [${proj.technologies.join(', ')}]`,
                              italics: true,
                              color: '2B579A',
                              size: 20,
                              font: 'Calibri',
                            }),
                          ]
                        : []),
                    ],
                  }),
                  ...(proj.description
                    ? [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: proj.description,
                              size: 21,
                              font: 'Calibri',
                            }),
                          ],
                        }),
                      ]
                    : []),
                  ...(proj.bullets || [])
                    .filter(Boolean)
                    .map(
                      (b) =>
                        new Paragraph({
                          bullet: { level: 0 },
                          children: [new TextRun({ text: b, size: 21, font: 'Calibri' })],
                        })
                    ),
                  new Paragraph({ text: '' }),
                ]),
              ]
            : []),

          // Certifications (if any)
          ...(resume.certifications && resume.certifications.length > 0
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  children: [
                    new TextRun({
                      text: 'CERTIFICATIONS',
                      bold: true,
                      size: 22,
                      font: 'Calibri',
                      color: '1F497D',
                    }),
                  ],
                }),
                ...resume.certifications.map(
                  (cert) =>
                    new Paragraph({
                      bullet: { level: 0 },
                      children: [
                        new TextRun({ text: cert.title, bold: true, size: 21, font: 'Calibri' }),
                        new TextRun({ text: ` — ${cert.issuer} (${cert.date})`, size: 21, font: 'Calibri' }),
                      ],
                    })
                ),
              ]
            : []),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
