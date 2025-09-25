import { useState } from 'react';
import AIEditSuggestion from '../AIEditSuggestion';

export default function AIEditSuggestionExample() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="p-6 relative min-h-96">
      <div className="mb-4">
        <p>This component demonstrates how AI editing suggestions appear:</p>
      </div>
      
      <AIEditSuggestion
        originalText="I learned a lot from this experience and it made me grow as a person."
        suggestedText="This experience taught me resilience and fundamentally shaped my perspective on leadership."
        onKeep={() => {
          console.log('Keeping AI suggestion');
          setIsVisible(false);
        }}
        onUndo={() => {
          console.log('Undoing AI suggestion');
          setIsVisible(false);
        }}
        position={{ top: 100, left: 50 }}
        isVisible={isVisible}
      />
      
      {!isVisible && (
        <button 
          onClick={() => setIsVisible(true)}
          className="mt-4 text-blue-500 underline"
        >
          Show suggestion again
        </button>
      )}
    </div>
  );
}