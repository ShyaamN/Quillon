import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EditSuggestion {
  originalText: string;
  suggestedText: string;
  explanation: string;
}

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxWords?: number;
  editSuggestion?: EditSuggestion | null;
  editSuggestions?: EditSuggestion[]; // Multiple suggestions
  onKeepSuggestion?: (suggestionIndex?: number) => void;
  onUndoSuggestion?: (suggestionIndex?: number) => void;
  onKeepAllSuggestions?: () => void;
  onRejectAllSuggestions?: () => void;
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing your essay...", 
  maxWords,
  editSuggestion,
  editSuggestions = [],
  onKeepSuggestion,
  onUndoSuggestion,
  onKeepAllSuggestions,
  onRejectAllSuggestions
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);

  // Convert markdown-style formatting to HTML
  const convertMarkdownToHtml = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold** -> <strong>bold</strong>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')              // *italic* -> <em>italic</em>
      .replace(/__(.*?)__/g, '<u>$1</u>')                // __underline__ -> <u>underline</u>
      .replace(/\n/g, '<br>');                           // newlines -> <br>
  };

  const sanitizePastedHtml = (input: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');
    const body = doc.body;

    if (!body) {
      return input;
    }
    const allowedTags = new Set([
      'P',
      'BR',
      'STRONG',
      'EM',
      'B',
      'I',
      'U',
      'UL',
      'OL',
      'LI',
      'BLOCKQUOTE',
      'H1',
      'H2',
      'H3',
      'H4',
      'DIV',
      'SPAN'
    ]);

    const elements = Array.from(body.querySelectorAll('*'));

    elements.forEach((el) => {
      if (!allowedTags.has(el.tagName)) {
        const parent = el.parentNode;
        if (!parent) return;

        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
        return;
      }

      Array.from(el.attributes).forEach((attr) => {
        el.removeAttribute(attr.name);
      });
    });

    return body.innerHTML;
  };

  const escapeHtml = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const convertTextToHtml = (text: string) => {
    const paragraphs = text.split(/\r?\n\r?\n/);
    return paragraphs
      .map((paragraph) => {
        const withBreaks = escapeHtml(paragraph).replace(/\r?\n/g, '<br>');
        return `<p>${withBreaks}</p>`;
      })
      .join('');
  };

  const execCommand = (command: string, value?: string) => {
    if (editorRef.current && !editSuggestion) { // Only allow editing when no suggestion is active
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput();
      editorRef.current.focus();
    }
  };

  const updateWordCount = () => {
    if (editorRef.current) {
      const textContent = editorRef.current.textContent || '';
      const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
      setWordCount(words);
    }
  };

  const handleInput = () => {
    if (editorRef.current && !editSuggestion) { // Only process input when no suggestion is active
      const newContent = editorRef.current.innerHTML;
      updateWordCount();
      onChange(newContent);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (editSuggestion) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    if (!editorRef.current) return;

    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    const filteredHtml = html ? sanitizePastedHtml(html) : convertTextToHtml(text);

    if (filteredHtml) {
      document.execCommand('insertHTML', false, filteredHtml);
    } else {
      document.execCommand('insertText', false, text);
    }

    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        handleInput();
      }
    });
  };

  // Update editor content when content changes (but not when suggestion is active)
  useEffect(() => {
    if (editorRef.current && !editSuggestion) {
      const currentHtml = editorRef.current.innerHTML;
      if (currentHtml !== content) {
        editorRef.current.innerHTML = content;
        updateWordCount();
      }
    }
  }, [content, editSuggestion]);

  // Handle edit suggestions with inline display
  useEffect(() => {
    if (!editorRef.current) return;

    // Handle multiple suggestions
    if (editSuggestions && editSuggestions.length > 0) {
      let contentWithSuggestions = content;
      
      // Apply all suggestions to the content
      editSuggestions.forEach((suggestion, index) => {
        if (suggestion.originalText) {
          const formattedSuggestedText = convertMarkdownToHtml(suggestion.suggestedText);
          
          const suggestionHtml = `<span class="edit-suggestion-container" data-suggestion-index="${index}" style="position: relative; display: inline;">
            <span class="original-text" style="background-color: rgba(239, 68, 68, 0.3); text-decoration: line-through; color: #dc2626; padding: 1px 2px;">${suggestion.originalText}</span><span class="suggested-text" style="background-color: rgba(34, 197, 94, 0.3); color: #16a34a; padding: 1px 2px; margin-left: 2px;">${formattedSuggestedText}</span>
            <span class="suggestion-controls" style="position: absolute; top: -35px; left: 0; z-index: ${1000 + index}; background: white; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 4px; white-space: nowrap;">
              <div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">Suggestion ${index + 1}</div>
              <button class="keep-suggestion-btn" data-index="${index}" style="background: #16a34a; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px; cursor: pointer; font-family: inherit;">Keep</button>
              <button class="reject-suggestion-btn" data-index="${index}" style="background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; font-family: inherit;">Reject</button>
            </span>
          </span>`;
          
          // Try exact HTML match first
          if (contentWithSuggestions.includes(suggestion.originalText)) {
            contentWithSuggestions = contentWithSuggestions.replace(suggestion.originalText, suggestionHtml);
          } else {
            // Try text content matching
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contentWithSuggestions;
            const textContent = tempDiv.textContent || '';
            
            if (textContent.includes(suggestion.originalText)) {
              const regex = new RegExp(suggestion.originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
              contentWithSuggestions = contentWithSuggestions.replace(regex, suggestionHtml);
            }
          }
        }
      });
      
      editorRef.current.innerHTML = contentWithSuggestions;
      editorRef.current.contentEditable = 'false';
      
      // Add event listeners for all suggestions
      const keepButtons = editorRef.current.querySelectorAll('.keep-suggestion-btn');
      const rejectButtons = editorRef.current.querySelectorAll('.reject-suggestion-btn');
      
      keepButtons.forEach(btn => {
        btn.addEventListener('click', (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          const target = e.target as HTMLElement;
          const suggestionIndex = parseInt(target.dataset.index || '0');
          if (onKeepSuggestion) {
            onKeepSuggestion(suggestionIndex);
          }
        });
      });
      
      rejectButtons.forEach(btn => {
        btn.addEventListener('click', (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          const target = e.target as HTMLElement;
          const suggestionIndex = parseInt(target.dataset.index || '0');
          
          // Call the handler with the suggestion index
          if (onUndoSuggestion) {
            onUndoSuggestion(suggestionIndex);
          }
        });
      });
      
      return; // Skip single suggestion handling
    }

    // Handle single suggestion (existing logic)
    if (editSuggestion && editSuggestion.originalText) {
      // Convert markdown in suggested text to HTML
      const formattedSuggestedText = convertMarkdownToHtml(editSuggestion.suggestedText);
      
      // Create inline suggestion HTML
      const suggestionHtml = `<span class="edit-suggestion-container" style="position: relative; display: inline;">
        <span class="original-text" style="background-color: rgba(239, 68, 68, 0.3); text-decoration: line-through; color: #dc2626; padding: 1px 2px;">${editSuggestion.originalText}</span><span class="suggested-text" style="background-color: rgba(34, 197, 94, 0.3); color: #16a34a; padding: 1px 2px; margin-left: 2px;">${formattedSuggestedText}</span>
        <span class="suggestion-controls" style="position: absolute; top: -30px; left: 0; z-index: 1000; background: white; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 4px; white-space: nowrap;">
          <button class="keep-suggestion-btn" style="background: #16a34a; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px; cursor: pointer; font-family: inherit;">Keep</button>
          <button class="undo-suggestion-btn" style="background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; font-family: inherit;">Undo</button>
        </span>
      </span>`;
      
      // Find and replace the original text
      let contentWithSuggestion = content;
      
      // Try exact HTML match first
      if (content.includes(editSuggestion.originalText)) {
        contentWithSuggestion = content.replace(editSuggestion.originalText, suggestionHtml);
      } else {
        // Try text content matching
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || '';
        
        if (textContent.includes(editSuggestion.originalText)) {
          // Find the position in text content and map back to HTML
          const textIndex = textContent.indexOf(editSuggestion.originalText);
          if (textIndex !== -1) {
            // Replace the first occurrence of the text in HTML
            const regex = new RegExp(editSuggestion.originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            contentWithSuggestion = content.replace(regex, suggestionHtml);
          }
        }
      }
      
      editorRef.current.innerHTML = contentWithSuggestion;
      editorRef.current.contentEditable = 'false';
      
      // Add event listeners
      const keepBtn = editorRef.current.querySelector('.keep-suggestion-btn');
      const undoBtn = editorRef.current.querySelector('.undo-suggestion-btn');
      
      const handleKeep = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        if (onKeepSuggestion) {
          onKeepSuggestion();
        }
      };
      
      const handleUndo = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        if (onUndoSuggestion) {
          onUndoSuggestion();
        }
      };
      
      if (keepBtn) {
        keepBtn.addEventListener('click', handleKeep);
      }
      
      if (undoBtn) {
        undoBtn.addEventListener('click', handleUndo);
      }
      
      return () => {
        if (keepBtn) {
          keepBtn.removeEventListener('click', handleKeep);
        }
        if (undoBtn) {
          undoBtn.removeEventListener('click', handleUndo);
        }
      };
    } else {
      // Re-enable editing when no suggestion
      if (editorRef.current.contentEditable === 'false') {
        editorRef.current.contentEditable = 'true';
      }
    }
  }, [editSuggestion, editSuggestions, onKeepSuggestion, onUndoSuggestion]);

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-3 border-b bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          data-testid="button-bold"
          className="hover-elevate"
          disabled={!!editSuggestion || editSuggestions.length > 0}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          data-testid="button-italic"
          className="hover-elevate"
          disabled={!!editSuggestion || editSuggestions.length > 0}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          data-testid="button-underline"
          className="hover-elevate"
          disabled={!!editSuggestion || editSuggestions.length > 0}
        >
          <Underline className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-2" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertUnorderedList')}
          data-testid="button-bullet-list"
          className="hover-elevate"
          disabled={!!editSuggestion || editSuggestions.length > 0}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          data-testid="button-more-options"
          className="hover-elevate"
          disabled={!!editSuggestion}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
        
        {/* Word Count */}
        <div className="ml-auto flex items-center gap-2 text-sm">
          {maxWords ? (
            <span className={`${wordCount > maxWords ? 'text-destructive' : 'text-muted-foreground'}`}>
              {wordCount}/{maxWords} words
            </span>
          ) : (
            <span className="text-muted-foreground">
              {wordCount} words
            </span>
          )}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!editSuggestion && editSuggestions.length === 0}
        onInput={handleInput}
        onPaste={handlePaste}
        className={`min-h-[400px] max-h-[60vh] overflow-y-auto p-4 focus:outline-none text-foreground leading-relaxed ${
          editSuggestion ? 'cursor-default' : 'cursor-text'
        }`}
        data-placeholder={placeholder}
        data-testid="editor-content"
        suppressContentEditableWarning={true}
      />
      
      {editSuggestion && (
        <div className="p-3 border-t bg-blue-50 text-sm text-blue-800">
          <strong>Suggestion:</strong> {editSuggestion.explanation}
        </div>
      )}
    </Card>
  );
}