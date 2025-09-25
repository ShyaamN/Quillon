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
  scores: {
    flow: number;
    hook: number;
    voice: number;
    uniqueness: number;
  };
  feedback: string;
  suggestions: string[];
}

export async function analyzeEssayFeedback(essayContent: string): Promise<EssayFeedback> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  
  try {
    // Limit essay content length to prevent excessive API costs
    const limitedContent = essayContent.substring(0, 3000);
    
    const systemPrompt = `You are a college admissions expert analyzing college application essays. 
    
    Analyze the provided essay and provide feedback in the following areas:
    1. Flow (0-100): How well the essay transitions between ideas and maintains coherence
    2. Hook (0-100): How effectively the opening grabs the reader's attention
    3. Voice (0-100): How authentic and personal the writing voice sounds
    4. Uniqueness (0-100): How distinctive and memorable the essay is
    
    Also provide:
    - An overall score (0-100) that weighs all factors
    - Detailed written feedback (2-3 sentences) highlighting strengths and areas for improvement
    - 2-3 specific actionable suggestions
    
    Respond with JSON in this exact format:
    {
      "overallScore": number,
      "scores": {
        "flow": number,
        "hook": number,
        "voice": number,
        "uniqueness": number
      },
      "feedback": "detailed feedback text",
      "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
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
              scores: {
                type: "object",
                properties: {
                  flow: { type: "number" },
                  hook: { type: "number" },
                  voice: { type: "number" },
                  uniqueness: { type: "number" }
                },
                required: ["flow", "hook", "voice", "uniqueness"]
              },
              feedback: { type: "string" },
              suggestions: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["overallScore", "scores", "feedback", "suggestions"]
          }
        },
        contents: `Please analyze this college application essay:\n\n${limitedContent}`,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 30000))
    ]);

    const rawJson = (response as any).text;
    console.log(`Essay analysis response: ${rawJson}`);

    if (rawJson) {
      const data: EssayFeedback = JSON.parse(rawJson);
      // Ensure scores are within valid range
      data.overallScore = Math.max(0, Math.min(100, Math.round(data.overallScore || 0)));
      data.scores.flow = Math.max(0, Math.min(100, Math.round(data.scores.flow || 0)));
      data.scores.hook = Math.max(0, Math.min(100, Math.round(data.scores.hook || 0)));
      data.scores.voice = Math.max(0, Math.min(100, Math.round(data.scores.voice || 0)));
      data.scores.uniqueness = Math.max(0, Math.min(100, Math.round(data.scores.uniqueness || 0)));
      
      return data;
    } else {
      throw new Error("Empty response from Gemini model");
    }
  } catch (error) {
    console.error("Error analyzing essay:", error);
    throw new Error(`Failed to analyze essay: ${error}`);
  }
}

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