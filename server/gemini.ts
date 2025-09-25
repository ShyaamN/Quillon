// DON'T DELETE THIS COMMENT - Using javascript_gemini integration
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// 🔑 TO ADD YOUR GEMINI API KEY:
// 1. Get your API key from https://makersuite.google.com/app/apikey
// 2. Set it as an environment variable: $env:GEMINI_API_KEY="your_api_key_here"
// 3. Or create a .env file in the root directory with: GEMINI_API_KEY=your_api_key_here

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface EssayFeedback {
  overallScore: number;
  metrics: {
    flow: number;
    hook: number;
    voice: number;
    uniqueness: number;
    conciseness: number;
    authenticity: number;
  };
  insights: {
    summary: string;
    improvementSuggestion: string;
    strengths: string[];
    improvementAreas: string[];
  };
}

export async function analyzeEssayFeedback(essayContent: string): Promise<EssayFeedback> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  
  try {
    // Limit essay content length to prevent excessive API costs
    const limitedContent = essayContent.substring(0, 3000);
    
    const systemPrompt = `You are a college admissions reader creating a structured rubric for college application essays.

    Evaluate the essay and provide:
    1. An overall score from 0-100.
    2. Category scores (0-100) for: flow, hook, voice, uniqueness, conciseness, authenticity.
    3. Insight fields including:
       - summary: two sentences synthesizing core strengths.
       - improvementSuggestion: one concise paragraph starting with "Improvement suggestion:" that offers the most impactful revision guidance.
       - strengths: array of 2-3 short bullet strings.
       - improvementAreas: array of 2-3 actionable bullet strings.

    Respond with strict JSON in this format:
    {
      "overallScore": number,
      "metrics": {
        "flow": number,
        "hook": number,
        "voice": number,
        "uniqueness": number,
        "conciseness": number,
        "authenticity": number
      },
      "insights": {
        "summary": "...",
        "improvementSuggestion": "Improvement suggestion: ...",
        "strengths": ["..."],
        "improvementAreas": ["..."]
      }
    }`;

    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              overallScore: { type: "number" },
              metrics: {
                type: "object",
                properties: {
                  flow: { type: "number" },
                  hook: { type: "number" },
                  voice: { type: "number" },
                  uniqueness: { type: "number" },
                  conciseness: { type: "number" },
                  authenticity: { type: "number" }
                },
                required: ["flow", "hook", "voice", "uniqueness", "conciseness", "authenticity"]
              },
              insights: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  improvementSuggestion: { type: "string" },
                  strengths: {
                    type: "array",
                    items: { type: "string" }
                  },
                  improvementAreas: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["summary", "improvementSuggestion", "strengths", "improvementAreas"]
              }
            },
            required: ["overallScore", "metrics", "insights"]
          }
        },
        contents: `Please analyze this college application essay:\n\n${limitedContent}`,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 30000))
    ]);

    const rawText = getResponseText(response);
    console.log(`Essay analysis response: ${rawText}`);

    if (!rawText) {
      throw new Error("Empty response from Gemini model");
    }

    const parsed = safelyParseEssayFeedback(rawText);
    return normalizeEssayFeedback(parsed);
  } catch (error) {
    console.error("Error analyzing essay:", error);
    throw new Error(`Failed to analyze essay: ${error}`);
  }
}

const getResponseText = (result: any): string | undefined => {
  if (!result) return undefined;
  if (typeof result.text === "function") {
    return result.text();
  }
  if (typeof result.text === "string") {
    return result.text;
  }
  if (result.response?.text) {
    return result.response.text();
  }
  if (result.response?.candidates?.[0]?.content?.parts) {
    return result.response.candidates[0].content.parts
      .map((part: any) => part.text)
      .join("");
  }
  return undefined;
};

const safelyParseEssayFeedback = (raw: string): Partial<EssayFeedback> => {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        console.warn("Essay feedback JSON parse retry failed", innerError);
      }
    }
    console.warn("Essay feedback parse failed, returning fallback", error);
    return {};
  }
};

const normalizeEssayFeedback = (input: Partial<EssayFeedback>): EssayFeedback => {
  const clamp = (value?: number) => Math.max(0, Math.min(100, Math.round(value ?? 0)));

  const metrics = (input.metrics ?? {}) as Partial<EssayFeedback["metrics"]>;
  const normalized: EssayFeedback = {
    overallScore: clamp(input.overallScore),
    metrics: {
      flow: clamp(metrics.flow),
      hook: clamp(metrics.hook),
      voice: clamp(metrics.voice),
      uniqueness: clamp(metrics.uniqueness),
      conciseness: clamp(metrics.conciseness),
      authenticity: clamp(metrics.authenticity)
    },
    insights: {
      summary: input.insights?.summary?.trim() || "Engaging narrative highlights personal motivation and impact.",
      improvementSuggestion:
        input.insights?.improvementSuggestion?.trim() ||
        "Improvement suggestion: Tighten transitions and emphasize one signature outcome for greater cohesion.",
      strengths: input.insights?.strengths?.length
        ? input.insights.strengths
        : [
            "Compelling hook that draws readers in immediately.",
            "Authentic voice that showcases personal growth.",
            "Concrete example illustrating leadership impact."
          ],
      improvementAreas: input.insights?.improvementAreas?.length
        ? input.insights.improvementAreas
        : [
            "Clarify the throughline between each anecdote.",
            "Quantify results to strengthen credibility.",
            "Trim repetitive phrases to sharpen conciseness."
          ]
    }
  };

  if (!normalized.insights.improvementSuggestion.startsWith("Improvement suggestion")) {
    normalized.insights.improvementSuggestion = `Improvement suggestion: ${normalized.insights.improvementSuggestion}`;
  }

  if (!normalized.overallScore) {
    normalized.overallScore = clamp(
      (normalized.metrics.flow +
        normalized.metrics.hook +
        normalized.metrics.voice +
        normalized.metrics.uniqueness +
        normalized.metrics.conciseness +
        normalized.metrics.authenticity) /
        6
    );
  }

  return normalized;
};

export async function generateChatResponse(message: string, essayContext?: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  
  try {
    let systemInstruction = `You are a helpful college application writing assistant. You provide guidance on essay writing, brainstorming, and application strategies. Keep responses conversational but informative. If asked about specific essay improvements, provide concrete, actionable advice.`;
    
    let fullMessage = message;
    if (essayContext) {
      systemInstruction += ` The user is working on this essay: "${essayContext.substring(0, 500)}..."`;
      fullMessage = `Context: I'm working on a college essay. Here's my question: ${message}`;
    }

    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction
        },
        contents: fullMessage,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 20000))
    ]);

    return (response as any).text || "I'm sorry, I couldn't generate a response at the moment. Please try again.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error(`Failed to generate chat response: ${error}`);
  }
}

export async function refineExtracurricularActivity(activity: {
  activityName: string;
  description: string;
  role: string;
  duration: string;
  impact: string;
}): Promise<{
  refinedDescription: string;
  refinedImpact: string;
  suggestions: string[];
  strengthScore: number;
}> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  
  try {
    const systemPrompt = `You are a college admissions expert specializing in extracurricular activities. Help students optimize their activity descriptions to make them more compelling for college applications.

    Analyze the provided extracurricular activity and provide:
    1. A refined description that highlights leadership, initiative, and concrete achievements
    2. A refined impact statement that quantifies results and shows meaningful contribution
    3. 3-4 specific suggestions for improvement
    4. A strength score (0-100) rating how compelling this activity is for admissions

    Guidelines:
    - Use active voice and strong action verbs
    - Include specific numbers, metrics, and outcomes when possible
    - Highlight leadership roles, initiative taken, and problems solved
    - Show growth, learning, and impact on others/community
    - Keep descriptions concise but impactful
    - Avoid generic or vague language

    Respond with JSON in this exact format:
    {
      "refinedDescription": "improved activity description",
      "refinedImpact": "improved impact statement", 
      "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"],
      "strengthScore": number
    }`;

    const activityText = `Activity: ${activity.activityName}
Role: ${activity.role}
Duration: ${activity.duration}
Current Description: ${activity.description}
Current Impact: ${activity.impact}`;

    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              refinedDescription: { type: "string" },
              refinedImpact: { type: "string" },
              suggestions: {
                type: "array",
                items: { type: "string" }
              },
              strengthScore: { type: "number" }
            },
            required: ["refinedDescription", "refinedImpact", "suggestions", "strengthScore"]
          }
        },
        contents: `Please analyze and refine this extracurricular activity:\n\n${activityText}`,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 30000))
    ]);

    const rawJson = (response as any).text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return {
        refinedDescription: data.refinedDescription || activity.description,
        refinedImpact: data.refinedImpact || activity.impact,
        suggestions: data.suggestions || ["Consider adding more specific details"],
        strengthScore: Math.max(0, Math.min(100, Math.round(data.strengthScore || 50)))
      };
    } else {
      throw new Error("Empty response from Gemini model");
    }
  } catch (error) {
    console.error("Error refining extracurricular activity:", error);
    throw new Error(`Failed to refine extracurricular activity: ${error}`);
  }
}

export async function suggestEssayEdit(essayContent: string, userRequest: string): Promise<{
  originalText: string;
  suggestedText: string;
  explanation: string;
}> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  
  try {
    // Limit essay content length to prevent excessive API costs
    const limitedContent = essayContent.substring(0, 3000);
    
    const systemPrompt = `You are an expert college essay editor. The user will provide an essay and a specific edit request. 
    
    Find a specific section of the essay that matches the user's request and suggest an improved version.
    
    Respond with JSON in this exact format:
    {
      "originalText": "exact text from the essay to be replaced",
      "suggestedText": "your improved version",
      "explanation": "brief explanation of why this change improves the essay"
    }
    
    Guidelines:
    - Keep the original meaning and voice intact
    - Make suggestions that improve clarity, impact, or flow
    - Choose sections that are 1-3 sentences long for manageable edits
    - Only suggest changes that directly address the user's request`;

    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              originalText: { type: "string" },
              suggestedText: { type: "string" },
              explanation: { type: "string" }
            },
            required: ["originalText", "suggestedText", "explanation"]
          }
        },
        contents: `Essay content:\n${limitedContent}\n\nEdit request: ${userRequest}`,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 30000))
    ]);

    const rawJson = (response as any).text;
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return {
        originalText: data.originalText || "No specific text identified",
        suggestedText: data.suggestedText || "No suggestion available",
        explanation: data.explanation || "General improvement suggested"
      };
    } else {
      throw new Error("Empty response from Gemini model");
    }
  } catch (error) {
    console.error("Error generating essay edit:", error);
    throw new Error(`Failed to generate edit suggestion: ${error}`);
  }
}