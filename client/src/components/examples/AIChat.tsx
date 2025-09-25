import AIChat from '../AIChat';

export default function AIChatExample() {
  return (
    <div className="h-96 p-6">
      <AIChat onSuggestEdit={(suggestion) => console.log('AI Suggestion:', suggestion)} />
    </div>
  );
}