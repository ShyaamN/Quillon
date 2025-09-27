import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Edit3, AlertTriangle, Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  hasEditSuggestion?: boolean;
  editSuggestion?: {
    originalText: string;
    suggestedText: string;
    explanation: string;
  };
}

interface AIChatProps {
  onSuggestEdit?: (suggestion: { originalText: string; suggestedText: string; explanation: string }) => void;
  onSuggestMultipleEdits?: (suggestions: Array<{ originalText: string; suggestedText: string; explanation: string }>) => void;
  essayContent?: string;
  essayId?: string;
  onGenerateFeedbackEdits?: () => Promise<void>;
  isGeneratingFeedbackEdits?: boolean;
  feedbackSuggestions?: Array<{
    originalText: string;
    suggestedText: string;
    explanation: string;
  }>;
  onAcceptAllSuggestions?: () => void;
  onRejectAllSuggestions?: () => void;
}

export default function AIChat({ 
  onSuggestEdit, 
  onSuggestMultipleEdits,
  essayContent, 
  essayId,
  onGenerateFeedbackEdits,
  isGeneratingFeedbackEdits: isLoadingFeedbackEdits = false,
  feedbackSuggestions = [],
  onAcceptAllSuggestions,
  onRejectAllSuggestions
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm Quillius, your AI writing partner in Agent Mode. I automatically provide edit suggestions when I can help improve your essay. Ask me anything about your writing and I'll suggest specific improvements!",
      role: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [multipleSuggestions, setMultipleSuggestions] = useState<Array<{
    originalText: string;
    suggestedText: string;
    explanation: string;
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect if user is asking for edits
  const detectEditRequest = (message: string): boolean => {
    const editKeywords = [
      'fix', 'improve', 'rewrite', 'edit', 'change', 'revise', 'rephrase',
      'make this better', 'help me with', 'suggestions for', 'how can I improve'
    ];
    const lowerMessage = message.toLowerCase();
    return editKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const handleApplyEdit = async (editSuggestion: Message['editSuggestion']) => {
    if (editSuggestion && onSuggestEdit) {
      onSuggestEdit(editSuggestion);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update local suggestions when feedback suggestions change
  useEffect(() => {
    if (feedbackSuggestions && feedbackSuggestions.length > 0) {
      setMultipleSuggestions(feedbackSuggestions);
      
      // Add a message about the generated suggestions
      const suggestionMessage: Message = {
        id: `feedback-suggestions-${Date.now()}`,
        content: `🎯 I've analyzed your essay and generated ${feedbackSuggestions.length} targeted improvements based on the feedback. You can apply each suggestion individually:`,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, suggestionMessage]);
    }
  }, [feedbackSuggestions]);

  const handleGenerateFeedbackEdits = async () => {
    if (onGenerateFeedbackEdits) {
      setMultipleSuggestions([]); // Clear previous suggestions
      await onGenerateFeedbackEdits();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const isEditRequest = detectEditRequest(newMessage.content);
      const payload: Record<string, string> = {
        message: newMessage.content.trim(),
        mode: 'agent'
      };

      if (essayId) {
        payload.essayId = essayId;
      } else if (essayContent) {
        payload.essayContent = essayContent;
      }

      let assistantMessage: Message;

      // Always try to provide edit suggestions in agent mode if essay content exists
      if (essayContent) {
        try {
          const editResponse = await apiRequest('POST', '/api/ai/suggest-edit', {
            content: essayContent,
            request: newMessage.content
          });
          const editData = await editResponse.json();

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            content: `I found a section to improve. Here's my suggestion:\n\n**Original:** "${editData.originalText}"\n\n**Improved:** "${editData.suggestedText}"\n\n**Why:** ${editData.explanation}`,
            role: 'assistant',
            timestamp: new Date(),
            hasEditSuggestion: true,
            editSuggestion: {
              originalText: editData.originalText,
              suggestedText: editData.suggestedText,
              explanation: editData.explanation
            }
          };

          // Auto-suggest the edit
          if (onSuggestEdit) {
            onSuggestEdit({
              originalText: editData.originalText,
              suggestedText: editData.suggestedText,
              explanation: editData.explanation
            });
          }
        } catch (editError) {
          // Fallback to regular chat if edit fails
          const response = await apiRequest('POST', '/api/chat', payload);
          const data = await response.json();

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            content: data.response || "I'm not sure how to help with that right now.",
            role: 'assistant',
            timestamp: new Date()
          };
        }
      } else {
        // Regular chat response when no essay content
        const response = await apiRequest('POST', '/api/chat', payload);
        const data = await response.json();

        assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response || "I'm not sure how to help with that right now.",
          role: 'assistant',
          timestamp: new Date()
        };
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setErrorMessage(message.includes('503') ? 'AI service is currently unavailable. Please verify your Gemini API key.' : message);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0"></div>
            Quillius
          </CardTitle>
          <Badge variant="default" className="text-xs">
            <Bot className="w-3 h-3 mr-1" />
            Agent Mode
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Automatic suggestions and proactive editing
        </div>
        
        {/* AI Feedback Edits Button */}
        {essayContent && essayContent.trim().length > 50 && (
          <div className="mt-3">
            <Button
              onClick={handleGenerateFeedbackEdits}
              disabled={isLoadingFeedbackEdits}
              size="sm"
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isLoadingFeedbackEdits ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate AI Improvements
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2" data-testid="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className={message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-r from-primary to-accent'}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full bg-white/20"></div>}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted text-muted-foreground'
                  }`}
                      style={{ whiteSpace: 'pre-wrap' }}
                  data-testid={`message-${message.role}-${message.id}`}
                >
                  {message.content}
                </div>
                
                {/* Edit suggestion button */}
                {message.hasEditSuggestion && message.editSuggestion && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplyEdit(message.editSuggestion)}
                      className="text-xs"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Apply Edit to Essay
                    </Button>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-r from-primary to-accent">
                  <div className="w-4 h-4 rounded-full bg-white/20"></div>
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Accept All Edits Button - only show if there are multiple suggestions */}
        {multipleSuggestions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {multipleSuggestions.length} AI improvements ready
            </div>
            <Button
              size="sm"
              onClick={() => onAcceptAllSuggestions?.()}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-3 h-3 mr-1" />
              Accept All Edits
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRejectAllSuggestions?.()}
              className="w-full"
            >
              <X className="w-3 h-3 mr-1" />
              Reject All Edits
            </Button>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your essay..."
            disabled={isLoading}
            data-testid="input-chat-message"
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="w-3 h-3" />
            <span>{errorMessage}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}