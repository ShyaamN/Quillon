import { Check, X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AIEditSuggestionProps {
  originalText: string;
  suggestedText: string;
  explanation: string;
  onKeep: () => void;
  onUndo: () => void;
  position: { top: number; left: number };
  isVisible: boolean;
}

export default function AIEditSuggestion({ 
  originalText, 
  suggestedText, 
  explanation,
  onKeep, 
  onUndo,
  position,
  isVisible 
}: AIEditSuggestionProps) {
  if (!isVisible) return null;

  return (
    <Card 
      className="absolute z-50 p-4 shadow-lg border max-w-sm"
      style={{ 
        top: position.top + 10, 
        left: position.left
      }}
      data-testid="ai-edit-suggestion"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI Suggestion</span>
        </div>

        {/* Original vs Suggested Text */}
        <div className="space-y-2 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Original:</div>
            <div className="bg-destructive/10 p-2 rounded border line-through text-destructive/70">
              {originalText}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground mb-1">Suggested:</div>
            <div className="bg-green-500/10 p-2 rounded border text-green-700 dark:text-green-400">
              {suggestedText}
            </div>
          </div>

          {explanation && (
            <div>
              <div className="text-muted-foreground mb-1">Why this improves:</div>
              <div className="bg-blue-500/10 p-2 rounded border text-blue-700 dark:text-blue-400 text-xs">
                {explanation}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={onKeep}
            data-testid="button-keep-suggestion"
            className="flex-1"
          >
            <Check className="w-3 h-3 mr-1" />
            Keep
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onUndo}
            data-testid="button-undo-suggestion"
            className="flex-1"
          >
            <X className="w-3 h-3 mr-1" />
            Undo
          </Button>
        </div>
      </div>

    </Card>
  );
}