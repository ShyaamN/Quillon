import { useState } from 'react';
import EssayFeedback from '../EssayFeedback';

export default function EssayFeedbackExample() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateFeedback = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="p-6">
      <EssayFeedback 
        isVisible={true}
        onGenerateFeedback={handleGenerateFeedback}
        isLoading={isLoading}
      />
    </div>
  );
}