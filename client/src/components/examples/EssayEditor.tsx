import { useState } from 'react';
import EssayEditor from '../EssayEditor';

export default function EssayEditorExample() {
  const [currentView, setCurrentView] = useState<'editor' | 'back'>('editor');

  const mockEssay = {
    id: '1',
    title: 'Overcoming Cultural Barriers Through Language',
    collegeTarget: 'Common App',
    essayType: 'Personal Statement',
    wordCount: 287,
    content: '<p>Growing up in a bilingual household taught me that language is more than just words—it\'s a bridge between worlds...</p>'
  };

  if (currentView === 'back') {
    return (
      <div className="p-6">
        <p>Navigated back to essays list</p>
        <button 
          onClick={() => setCurrentView('editor')}
          className="mt-4 text-blue-500 underline"
        >
          Return to editor
        </button>
      </div>
    );
  }

  return (
    <EssayEditor
      essay={mockEssay}
      onBack={() => setCurrentView('back')}
      onSave={(essay) => console.log('Saving essay:', essay.title)}
    />
  );
}