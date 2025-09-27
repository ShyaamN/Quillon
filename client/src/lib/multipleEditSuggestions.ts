import { apiRequest } from './queryClient';

export interface EditSuggestion {
  originalText: string;
  suggestedText: string;
  explanation: string;
}

export async function generateMultipleEditSuggestionsFromFeedback(
  feedbackData: any,
  essayContent: string
): Promise<EditSuggestion[]> {
  try {
    // Create a comprehensive prompt based on the feedback
    const improvementAreas = feedbackData.insights?.improvementAreas || [];
    
    const feedbackPrompt = `Based on this essay feedback:

Overall Score: ${feedbackData.overallScore}
Summary: ${feedbackData.insights?.summary || 'No summary available'}

Improvement Areas:
${improvementAreas.map((area: string, index: number) => `${index + 1}. ${area}`).join('\n')}

Essay content:
${essayContent.replace(/<[^>]*>/g, '').trim()}

Generate 3-5 specific edit suggestions to improve this essay based on the feedback provided.`;

    // Use the existing chat endpoint with special formatting for multiple suggestions
    const response = await apiRequest('POST', '/api/ai/chat', {
      message: `Based on this essay feedback, generate multiple targeted edit suggestions:\n\n${feedbackPrompt}`,
      essayContent: essayContent
    });

    const data = await response.json();

    if (data.suggestions && Array.isArray(data.suggestions)) {
      return data.suggestions;
    }
    
    // Fallback: parse response content if it's not in the expected format
    if (data.response) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = data.response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const suggestions = JSON.parse(jsonMatch[0]);
          if (Array.isArray(suggestions)) {
            return suggestions.filter(s => s.originalText && s.suggestedText && s.explanation);
          }
        }
      } catch (parseError) {
        console.error('Error parsing multiple suggestions response:', parseError);
      }
    }

    // If all else fails, return an empty array
    console.warn('No valid suggestions found in response');
    return [];
  } catch (error) {
    console.error('Error generating multiple edit suggestions:', error);
    throw new Error('Failed to generate multiple edit suggestions');
  }
}