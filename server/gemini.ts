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
    
    const systemPrompt = `You are a highly experienced college admissions reader with a reputation for rigorous, honest feedback. You've read thousands of essays and know exactly what separates compelling applications from mediocre ones.

BE CRITICAL AND SPECIFIC. Most essays have significant room for improvement. Avoid generic praise.
Be nonchalant and direct - students need real help, not just encouragement.
Be cold, be real, chill, tough, but fair. Judge like a Harvard, Stanford, MIT admissions officer who has to make hard decisions.

Evaluate the essay harshly but fairly:
1. Overall score (0-100): Be tough. Most essays score 60-75. Only truly exceptional essays earn 85+.
2. Category scores (0-100): Look for specific flaws in each area:
   - flow: Are transitions awkward? Do paragraphs connect logically?
   - hook: Does the opening actually grab attention or is it generic?
   - voice: Is this authentically the student's voice or does it sound artificial?
   - uniqueness: Have you read this story/angle 100 times before? Check for cliche examples!
   - conciseness: Is every word necessary? Are there verbose, pretentious phrases?
   - authenticity: Does this feel genuine or performative?

3. Insight fields:
   - summary: Identify 2-3 genuine strengths, but be specific about what works. DO NOT OVER-PRAISE unless the essay is REALLY that good.
   - improvementSuggestion: START WITH "Improvement suggestion:" then provide SPECIFIC, actionable criticism. Point out exact phrases to cut, concepts to deepen, transitions to fix. Be direct about weaknesses.
   - strengths: 2-3 bullets highlighting what genuinely works (not generic praise).
   - improvementAreas: 2-3 bullets with SPECIFIC editing tasks, not vague suggestions.

Ensure you quote specific parts of the essay when making references.

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

  const rawText = await getResponseText(response);
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

const resolveMaybePromise = async <T>(value: T | Promise<T>): Promise<T> => {
  if (value && typeof (value as any).then === "function") {
    return await (value as Promise<T>);
  }
  return value as T;
};

const getResponseText = async (result: any): Promise<string | undefined> => {
  if (!result) return undefined;
  if (typeof result.text === "function") {
    const value = await resolveMaybePromise(result.text());
    return typeof value === "string" ? value : undefined;
  }
  if (typeof result.text === "string") {
    return result.text;
  }
  if (result.response?.text) {
    const value = await resolveMaybePromise(result.response.text());
    return typeof value === "string" ? value : undefined;
  }
  if (result.response?.candidates?.[0]?.content?.parts) {
    const parts = result.response.candidates[0].content.parts;
    return parts
      .map((part: any) => (typeof part === "string" ? part : part?.text ?? ""))
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
    // PROMPT ENGINEERING COMMENT: Adjust tone here - change "tough love" to "encouraging" for gentler responses
    let systemInstruction = `You are Quillius, a college application writing assistant known for giving students honest, actionable feedback. You provide specific guidance on essay writing, brainstorming, and application strategies. Be conversational but direct - students need real help, not just encouragement.

    When discussing essays, point out specific issues: awkward transitions, weak word choices, clichéd openings, unclear connections between ideas. Help students see exactly what needs fixing.

    // PROMPT ENGINEERING COMMENT: Add "Be more encouraging and supportive" here to soften the tone
    // PROMPT ENGINEERING COMMENT: Add "Focus on grammar and mechanics" to emphasize technical writing issues
    // PROMPT ENGINEERING COMMENT: Add "Emphasize storytelling techniques" to focus on narrative structure`;
    
    let fullMessage = message;
    if (essayContext) {
      systemInstruction += ` The student is working on this essay: "${essayContext.substring(0, 500)}..."`;
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

// EDIT SUGGESTION PROMPT ENGINEERING CONFIG
// Modify these settings to change how the AI makes edit suggestions:

interface EditSuggestionConfig {
  editingStyle: 'conservative' | 'aggressive' | 'balanced';
  tone: 'maintain_voice' | 'more_academic' | 'more_conversational' | 'add_emotion';
  technicalFocus: 'grammar_only' | 'structure' | 'vocabulary' | 'comprehensive';
  priorityFocus: string[];
}

const EDIT_CONFIG: EditSuggestionConfig = {
  // CHANGE THESE TO CUSTOMIZE EDIT BEHAVIOR:
  editingStyle: 'conservative',        // 'conservative' | 'aggressive' | 'balanced'
  tone: 'maintain_voice',              // 'maintain_voice' | 'more_academic' | 'more_conversational' | 'add_emotion'
  technicalFocus: 'comprehensive',     // 'grammar_only' | 'structure' | 'vocabulary' | 'comprehensive'
  priorityFocus: [                     // Add/remove focuses as needed:
    'eliminate unnecessary words',
    'replace weak verbs', 
    'fix awkward transitions',
    'remove redundancy',
    'improve clarity'
  ]
};

function buildEditSystemPrompt(config: EditSuggestionConfig): string {
  const styleInstructions = {
    conservative: "Be conservative with changes, maintain student voice, make minimal surgical edits only.",
    aggressive: "Be aggressive with rewrites, make major structural improvements when needed.",
    balanced: "Balance significant improvements with preserving the student's original voice and style."
  };

  const toneInstructions = {
    maintain_voice: "Maintain the student's original voice and personality throughout.",
    more_academic: "Shift toward a more formal, scholarly tone while keeping it authentic.",
    more_conversational: "Make the writing more casual and approachable while maintaining professionalism.",
    add_emotion: "Add emotional depth and personal reflection to make it more engaging."
  };

  const focusInstructions = {
    grammar_only: "Focus primarily on grammar, punctuation, and basic syntax fixes.",
    structure: "Emphasize sentence structure improvements, flow, and readability.",
    vocabulary: "Prioritize stronger, more precise word choices and vocabulary enhancement.",
    comprehensive: "Address all aspects: grammar, structure, vocabulary, and clarity."
  };

  return `You are an expert college essay editor with a sharp eye for writing improvements.

EDITING APPROACH: ${styleInstructions[config.editingStyle]}
TONE GUIDANCE: ${toneInstructions[config.tone]}
TECHNICAL FOCUS: ${focusInstructions[config.technicalFocus]}

PRIORITY AREAS: ${config.priorityFocus.join(', ')}

The user will provide an essay and a specific edit request. Find a problematic section and suggest a concrete improvement.

Respond with JSON in this exact format:
{
  "originalText": "exact text from the essay to be replaced (1-3 sentences max)",
  "suggestedText": "your improved version following the guidance above",
  "explanation": "brief explanation focusing on what specific writing problem this fixes"
}

Guidelines:
- Choose sections that have clear writing problems (wordiness, vagueness, weak verbs)
- Make suggestions that improve clarity and impact without changing the student's voice
- Focus on 1-3 sentences for manageable, surgical edits
- Be specific about what writing issue you're addressing`;
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
    
    const systemPrompt = buildEditSystemPrompt(EDIT_CONFIG);

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

export async function generateMultipleEditSuggestions(
  feedbackMessage: string, 
  essayContent: string
): Promise<Array<{ originalText: string; suggestedText: string; explanation: string }>> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const limitedContent = essayContent.substring(0, 2000);
    
    const prompt = `${feedbackMessage}

Essay content:
${limitedContent}

Generate exactly 3-5 specific edit suggestions to improve this essay based on the feedback provided. Each suggestion should target a different weakness identified in the feedback.

Respond with a JSON array where each object has:
- "originalText": the exact text from the essay to be replaced (must be verbatim from the essay)
- "suggestedText": the improved replacement text
- "explanation": why this change addresses the feedback

Example format:
[
  {
    "originalText": "I have always been passionate about helping others",
    "suggestedText": "Watching my grandmother struggle with isolation during the pandemic sparked my desire to bridge gaps between generations",
    "explanation": "Creates a specific, memorable opening that shows rather than tells about your passion for helping others"
  },
  {
    "originalText": "This experience taught me a lot",
    "suggestedText": "This experience revealed the power of small gestures to transform someone's entire outlook",
    "explanation": "Replaces vague language with specific insight that demonstrates deeper reflection"
  }
]

Make sure each "originalText" appears exactly as written in the essay. Focus on the most impactful improvements that address the feedback points.`;

    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: "You are an expert college essay editor. Always respond with valid JSON in the exact format requested. Find exact text matches from the essay content."
        },
        contents: prompt,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 30000))
    ]);

    const responseText = (response as any).text;
    if (!responseText) {
      throw new Error("Empty response from Gemini model");
    }

    // Parse the JSON response
    try {
      // Clean the response text - remove markdown code blocks if present
      const cleanedText = responseText.replace(/```json\s*|\s*```/g, '').trim();
      const suggestions = JSON.parse(cleanedText);
      
      if (!Array.isArray(suggestions)) {
        throw new Error("Response is not an array");
      }

      // Validate each suggestion has required fields
      return suggestions.filter(suggestion => 
        suggestion.originalText && 
        suggestion.suggestedText && 
        suggestion.explanation &&
        essayContent.includes(suggestion.originalText.trim())
      );
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, "Response:", responseText);
      
      // Fallback: generate a single suggestion using the existing function
      const singleSuggestion = await suggestEssayEdit(essayContent, "Improve this essay based on the feedback provided");
      return [singleSuggestion];
    }
  } catch (error) {
    console.error("Error generating multiple edit suggestions:", error);
    throw new Error(`Failed to generate multiple edit suggestions: ${error}`);
  }
}