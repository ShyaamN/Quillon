import { useState } from 'react';
import RichTextEditor from '../RichTextEditor';

export default function RichTextEditorExample() {
  const [content, setContent] = useState('<p>This is a sample essay about overcoming challenges...</p>');

  return (
    <div className="p-6">
      <RichTextEditor 
        content={content}
        onChange={setContent}
        placeholder="Start writing your college essay..."
        maxWords={650}
      />
    </div>
  );
}