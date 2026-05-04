import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_QUESTIONS } from "../mockData";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const models = {
  flash: "gemini-3-flash-preview",
  pro: "gemini-3.1-pro-preview",
};

export async function generateQuiz(params: {
  subject: string;
  chapter: string;
  count: number;
  level: string;
  type?: 'MCQ' | 'SHORT' | 'LONG' | 'FILL' | 'BOARD_PATTERN';
  marks?: number;
  weakTopics?: string[];
  askedIds?: string[];
}) {
  const { subject, chapter, count, level, type = 'MCQ', marks, weakTopics = [], askedIds = [] } = params;
  
  const systemInstruction = `You are Akshara-Deepa, a premium AI academic companion for Class 10 Karnataka SSLC students.
Generate ${count} unique ${level} difficulty quiz questions for Chapter: "${chapter}" of Subject: "${subject}".
Align perfectly with Karnataka State Board SSLC 2025-26 syllabus and blueprint for the 2026 board exams.

Question specifications:
- Focus on: ${type === 'BOARD_PATTERN' ? 'Mix of 1M, 2M, 3M, 4M, 5M' : type}
- Target Marks: ${marks || 'As per SSLC standards'}

SSLC Standards:
- 1 Mark: MCQ or One-word (Recall)
- 2 Marks: Short answers (Understanding/Explanation)
- 3 Marks: Medium answers (Analytical/Process)
- 4 Marks: Long answers (Synthesis/Evaluation)
- 5 Marks: Diagrams, Maps, or complex derivations (In Science/Math/Social)

Constraints:
- Return ONLY valid JSON.
- No markdown, no preamble.
- Subject-specific context is mandatory.
- Weak topics to focus on: ${weakTopics.join(', ')}.
- Do NOT repeat these IDs: ${askedIds.join(', ')}.`;

  try {
    const response = await ai.models.generateContent({
      model: models.flash,
      contents: "Generate the quiz questions.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              type: { type: Type.STRING, description: "MCQ|SHORT|LONG|FILL" },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.NUMBER, description: "Index of correct option for MCQ, or 0 otherwise" },
              fillAnswer: { type: Type.STRING, description: "Correct answer string for FILL type" },
              explanation: { type: Type.STRING },
              marks: { type: Type.NUMBER },
              subject: { type: Type.STRING },
              chapter: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              conceptTag: { type: Type.STRING },
              hint: { type: Type.STRING },
              modelAnswer: { type: Type.STRING, description: "For SHORT/LONG types" },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "For LONG types" }
            },
            required: ["id", "question", "type", "explanation", "marks", "subject", "chapter", "difficulty", "conceptTag"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error, falling back to mock data:", error);
    // Fallback logic: filtered mock questions
    const fallback = MOCK_QUESTIONS.filter(q => 
      q.subject.toLowerCase() === subject.toLowerCase() && 
      (q.chapter.toLowerCase() === chapter.toLowerCase() || chapter === "General Awareness")
    );
    
    if (fallback.length > 0) {
      return fallback.slice(0, count);
    }
    
    // If no filtered match, return random ones
    return MOCK_QUESTIONS.sort(() => 0.5 - Math.random()).slice(0, count);
  }
}

export async function validateAnswer(params: {
  subject: string;
  chapter: string;
  question: string;
  marks: number;
  studentAnswer: string;
}) {
  const { subject, chapter, question, marks, studentAnswer } = params;
  
  const systemInstruction = `Evaluate the SSLC Class 10 written answer based on Karnataka SSLC marking scheme.
Subject: ${subject} | Chapter: ${chapter}
Question: ${question} | Max marks: ${marks}
Student's answer: ${studentAnswer}

Feedback TONE:
- NEVER say "wrong".
- Be encouraging.
- Start with what they got right.
- Use examiners standards.`;

  const response = await ai.models.generateContent({
    model: models.flash,
    contents: "Evaluate the answer.",
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          percentage: { type: Type.NUMBER },
          grade: { type: Type.STRING },
          feedback: { type: Type.STRING },
          keyPointsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyPointsMissed: { type: Type.ARRAY, items: { type: Type.STRING } },
          modelAnswer: { type: Type.STRING },
          spellingErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
          diagramRequired: { type: Type.BOOLEAN },
          diagramTip: { type: Type.STRING },
          improvementTip: { type: Type.STRING },
          marksBreakdown: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.NUMBER },
              accuracy: { type: Type.NUMBER },
              presentation: { type: Type.NUMBER }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateStudyPlan(params: {
  name: string;
  school: string;
  days: number;
  hours: number;
  completedList: string[];
  weakList: string[];
  strongList: string[];
  subjectScores: any;
}) {
  const systemInstruction = `Create a high-intensity personalised SSLC study plan for ${params.name} from ${params.school}.
Days remaining: ${params.days}.
Daily hours: ${params.hours}.
Completed: ${params.completedList.join(', ')}.
Weak: ${params.weakList.join(', ')}.
Strong: ${params.strongList.join(', ')}.

Rules:
- RED days for high-priority weak subjects.
- Sunday mandatory mixed revision.
- Last 7 days ONLY revision and mocks.`;

  const response = await ai.models.generateContent({
    model: models.flash,
    contents: "Generate the study plan.",
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          planTitle: { type: Type.STRING },
          totalDays: { type: Type.NUMBER },
          examDate: { type: Type.STRING },
          strategy: { type: Type.STRING },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                date: { type: Type.STRING },
                theme: { type: Type.STRING },
                morning: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    chapter: { type: Type.STRING },
                    task: { type: Type.STRING },
                    duration: { type: Type.STRING }
                  }
                },
                afternoon: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    chapter: { type: Type.STRING },
                    task: { type: Type.STRING },
                    duration: { type: Type.STRING }
                  }
                },
                evening: {
                  type: Type.OBJECT,
                  properties: {
                    task: { type: Type.STRING },
                    count: { type: Type.NUMBER },
                    type: { type: Type.STRING }
                  }
                },
                priority: { type: Type.STRING },
                motivationTip: { type: Type.STRING },
                targetScore: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
}
