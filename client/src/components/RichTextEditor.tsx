import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxWords?: number;
}

export default function RichTextEditor({ content, onChange, placeholder = "Start wr<em>i</em>ting your essay...", maxWords }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);

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
    // Ensure editor has focus before executing command
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
      // Maintain focus after command execution
      editorRef.current.focus();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      const textContent = editorRef.current.textContent || '';
      const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
      setWordCount(words);
      onChange(newContent);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
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

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
      const textContent = editorRef.current.textContent || '';
      const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
      setWordCount(words);
    }
  }, [content]);

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
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          data-testid="button-italic"
          className="hover-elevate"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          data-testid="button-underline"
          className="hover-elevate"
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
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          data-testid="button-more-options"
          className="hover-elevate"
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
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className="min-h-[400px] max-h-[60vh] overflow-y-auto p-4 focus:outline-none text-foreground leading-relaxed"
        data-placeholder={placeholder}
        data-testid="editor-content"
        suppressContentEditableWarning={true}
      />
    </Card>
  );
}