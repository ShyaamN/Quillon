import { useState } from 'react';
import { ArrowLeft, Save, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import RichTextEditor from './RichTextEditor';
import AIChat from './AIChat';
import EssayFeedback from './EssayFeedback';
import AIEditSuggestion from './AIEditSuggestion';

interface Essay {
  id?: string;
  title: string;
  collegeTarget: string;
  essayType: string;
  wordCount: number;
  maxWords: number;
  content: string;
}

interface EssayEditorProps {
  essay?: Essay;
  onBack: () => void;
  onSave: (essay: Essay) => void;
}

export default function EssayEditor({ essay, onBack, onSave }: EssayEditorProps) {
  const [currentEssay, setCurrentEssay] = useState<Essay>(essay || {
    title: '',
    collegeTarget: 'Common App',
    essayType: 'Personal Statement',
    wordCount: 0,
    maxWords: 650,
    content: ''
  });
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    original: string;
    suggested: string;
    position: { top: number; left: number };
  } | null>(null);

  const handleSave = () => {
    onSave(currentEssay);
  };

  const handleContentChange = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
    
    setCurrentEssay(prev => ({ 
      ...prev, 
      content, 
      wordCount 
    }));
  };

  const handleGenerateFeedback = async () => {
    const content = currentEssay.content?.trim();
    if (!content) {
      setFeedbackError('Please add some content to your essay before requesting feedback.');
      setShowFeedback(false);
      return;
    }

    setIsFeedbackLoading(true);
    setFeedbackError(null);
    setFeedbackData(null);
    setShowFeedback(true);
    
    try {
      const response = await apiRequest('POST', `/api/ai/essay-feedback`, {
        content: currentEssay.content,
      });
      const feedback = await response.json();
      setFeedbackData(feedback);
    } catch (error) {
      console.error('Error getting feedback:', error);
      setFeedbackError(error instanceof Error ? error.message : 'Failed to get feedback');
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleAIEdit = async (request: string) => {
    try {
      if (!currentEssay.content?.trim()) {
        setFeedbackError('Add essay content before requesting an edit suggestion.');
        return;
      }

      const response = await apiRequest('POST', '/api/ai/suggest-edit', {
        content: currentEssay.content,
        request,
      });

      const suggestion = await response.json();

      setAiSuggestion({
        original: suggestion.originalText,
        suggested: suggestion.suggestedText,
        position: { top: 180, left: 120 }
      });
    } catch (error) {
      console.error('Error generating edit suggestion:', error);
      setFeedbackError(error instanceof Error ? error.message : 'Failed to generate edit suggestion');
    }
  };

  const handleKeepSuggestion = () => {
    if (aiSuggestion) {
      const newContent = currentEssay.content.replace(
        aiSuggestion.original,
        aiSuggestion.suggested
      );
      handleContentChange(newContent);
      setAiSuggestion(null);
    }
  };

  const handleUndoSuggestion = () => {
    setAiSuggestion(null);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            data-testid="button-back-to-essays"
          >
            Essays
          </Button>
          
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <Input
              value={currentEssay.title}
              onChange={(e) => setCurrentEssay(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Essay Title"
              className="font-medium border-none shadow-none focus-visible:ring-0 px-0 placeholder:italic placeholder:text-muted-foreground/60"
              data-testid="input-essay-title"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Select
              value={currentEssay.collegeTarget}
              onValueChange={(value) => setCurrentEssay(prev => ({ ...prev, collegeTarget: value }))}
            >
              <SelectTrigger className="w-32" data-testid="select-college-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Common App">Common App</SelectItem>
                <SelectItem value="Stanford University">Stanford</SelectItem>
                <SelectItem value="UC Berkeley">UC Berkeley</SelectItem>
                <SelectItem value="Harvard University">Harvard</SelectItem>
                <SelectItem value="MIT">MIT</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={currentEssay.essayType}
              onValueChange={(value) => setCurrentEssay(prev => ({ ...prev, essayType: value }))}
            >
              <SelectTrigger className="w-40" data-testid="select-essay-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Personal Statement">Personal Statement</SelectItem>
                <SelectItem value="Why Major">Why Major</SelectItem>
                <SelectItem value="Why School">Why School</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Diversity">Diversity</SelectItem>
                <SelectItem value="Overcome Challenge">Overcome Challenge</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <label htmlFor="wordLimit" className="text-sm text-muted-foreground">Word Limit:</label>
              <Input
                id="wordLimit"
                type="number"
                value={currentEssay.maxWords}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 1) {
                    setCurrentEssay(prev => ({ ...prev, maxWords: Math.min(2000, Math.max(1, value)) }));
                  }
                }}
                onBlur={(e) => {
                  // Ensure valid value on blur, fallback to previous value or 650
                  const value = parseInt(e.target.value);
                  if (isNaN(value) || value < 1) {
                    setCurrentEssay(prev => ({ ...prev, maxWords: prev.maxWords || 650 }));
                  }
                }}
                className="w-20 text-center"
                min="1"
                max="2000"
                step="50"
                data-testid="input-word-limit"
              />
            </div>
          </div>
          
          <Button onClick={handleSave} data-testid="button-save-essay">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Editor Section */}
        <div className="flex-1 flex flex-col p-6 min-w-0">
          <RichTextEditor
            content={currentEssay.content}
            onChange={handleContentChange}
            placeholder="Start writing your essay here..."
            maxWords={currentEssay.maxWords}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l bg-card/30 flex flex-col min-h-0">
          {/* AI Chat */}
          <div className="flex-1 p-4 min-h-0">
            <AIChat
              onSuggestEdit={handleAIEdit}
              essayContent={currentEssay.content}
              essayId={currentEssay.id}
            />
          </div>
          
          {/* Feedback Button */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={handleGenerateFeedback}
              disabled={!currentEssay.content || isFeedbackLoading}
              data-testid="button-get-feedback"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isFeedbackLoading ? 'Analyzing...' : 'Get Essay Feedback'}
            </Button>
            
            <EssayFeedback
          isVisible={showFeedback || isFeedbackLoading || !!feedbackError}
              onGenerateFeedback={handleGenerateFeedback}
              isLoading={isFeedbackLoading}
              feedbackData={feedbackData}
              error={feedbackError}
            />
          </div>
        </div>
      </div>

      {/* AI Edit Suggestion Overlay */}
      <AIEditSuggestion
        originalText={aiSuggestion?.original || ''}
        suggestedText={aiSuggestion?.suggested || ''}
        onKeep={handleKeepSuggestion}
        onUndo={handleUndoSuggestion}
        position={aiSuggestion?.position || { top: 0, left: 0 }}
        isVisible={!!aiSuggestion}
      />
    </div>
  );
}