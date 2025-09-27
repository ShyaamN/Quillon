import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineEditSuggestionProps {
  originalText: string;
  suggestedText: string;
  onKeep: () => void;
  onUndo: () => void;
}

export default function InlineEditSuggestion({ 
  originalText, 
  suggestedText, 
  onKeep, 
  onUndo 
}: InlineEditSuggestionProps) {
  return (
    <div className="relative inline-block">
      {/* Original text with strikethrough */}
      <span className="bg-red-500/20 text-red-700 dark:text-red-400 line-through px-1 rounded">
        {originalText}
      </span>
      
      {/* Suggested text */}
      <span className="bg-green-500/20 text-green-700 dark:text-green-400 px-1 rounded ml-1">
        {suggestedText}
      </span>
      
      {/* Action buttons */}
      <div className="inline-flex ml-2 gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={onKeep}
          className="h-6 px-2 text-xs bg-background hover:bg-green-50 hover:border-green-300"
        >
          <Check className="w-3 h-3 mr-1" />
          Keep
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onUndo}
          className="h-6 px-2 text-xs bg-background hover:bg-red-50 hover:border-red-300"
        >
          <X className="w-3 h-3 mr-1" />
          Undo
        </Button>
      </div>
    </div>
  );
}