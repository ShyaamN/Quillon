import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface FeedbackScore {
  label: string;
  score: number;
  color: string;
}

interface EssayFeedbackProps {
  isVisible: boolean;
  onGenerateFeedback: () => void;
  isLoading?: boolean;
}

export default function EssayFeedback({ isVisible, onGenerateFeedback, isLoading = false }: EssayFeedbackProps) {
  // Mock feedback data - todo: replace with real API data
  const overallScore = 72;
  const scores: FeedbackScore[] = [
    { label: 'flow', score: 65, color: 'bg-orange-500' },
    { label: 'hook', score: 85, color: 'bg-green-500' },
    { label: 'voice', score: 78, color: 'bg-yellow-500' },
    { label: 'uniqueness', score: 72, color: 'bg-yellow-500' }
  ];

  const feedback = "Your essay demonstrates strong personal voice and an engaging hook that immediately draws readers in. The opening story about your grandmother's cooking effectively establishes the cultural context. However, the flow between paragraphs could be smoother - consider adding transitional phrases to connect your ideas more seamlessly. Your unique perspective on cultural identity is compelling, but you could strengthen it by providing more specific examples of how this experience shaped your future goals.";

  if (!isVisible) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Essay Feedback</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onGenerateFeedback}
          disabled={isLoading}
          data-testid="button-refresh-feedback"
          className="hover-elevate"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-2" data-testid="text-overall-score">
            {overallScore}
          </div>
          <Progress value={overallScore} className="w-full mb-2" />
          <div className="text-sm text-muted-foreground">Overall</div>
        </div>

        {/* Individual Scores */}
        <div className="grid grid-cols-2 gap-4">
          {scores.map((score, index) => (
            <div key={score.label} className="space-y-2" data-testid={`score-${score.label}`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{score.label}</span>
                <span className="text-sm font-semibold">{score.score}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${score.color}`}
                  style={{ width: `${score.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Feedback */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Detailed Analysis</h4>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-detailed-feedback">
            {feedback}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}