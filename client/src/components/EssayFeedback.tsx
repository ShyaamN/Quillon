import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface EssayFeedbackProps {
  isVisible: boolean;
  onGenerateFeedback: () => void;
  isLoading?: boolean;
  feedbackData?: any;
  error?: string | null;
}

export default function EssayFeedback({ isVisible, onGenerateFeedback, isLoading = false, feedbackData, error }: EssayFeedbackProps) {
  const shouldRender = isVisible || isLoading || !!error;
  if (!shouldRender) return null;

  const metricOrder: Array<{ label: string; key: string }> = [
    { label: 'flow', key: 'flow' },
    { label: 'hook', key: 'hook' },
    { label: 'voice', key: 'voice' },
    { label: 'uniqueness', key: 'uniqueness' },
    { label: 'conciseness', key: 'conciseness' },
    { label: 'authenticity', key: 'authenticity' }
  ];

  const defaultMetrics: Record<string, number> = {
    flow: 65,
    hook: 85,
    voice: 78,
    uniqueness: 72,
    conciseness: 60,
    authenticity: 70
  };

  const metricsSource = feedbackData?.metrics || defaultMetrics;
  const metrics = metricOrder.map(({ label, key }) => {
    const score = metricsSource?.[key] ?? defaultMetrics[key];
    return {
      label,
      score,
      color: getScoreColor(score)
    };
  });

  const overallScore = feedbackData?.overallScore ?? 72;
  const summary = feedbackData?.insights?.summary || "Engaging narrative voice and a confident opening set a strong tone. The essay conveys personal motivation and leadership impact with specific, memorable details.";
  const improvementSuggestion = feedbackData?.insights?.improvementSuggestion || "Improvement suggestion: Tighten transitions between sections and trim repeated phrases to keep momentum while highlighting one or two signature accomplishments in more depth.";
  const improvementAreas: string[] = feedbackData?.insights?.improvementAreas || [
    "Smooth transitions between anecdotes to support overall flow.",
    "Showcase quantifiable outcomes tied to leadership moments.",
    "Trim jargon and repeated phrases to sharpen clarity."
  ];
  const strengths: string[] = feedbackData?.insights?.strengths || [
    "Compelling hook that immediately captures attention.",
    "Distinct personal voice that feels authentic and reflective.",
    "Specific scenario that illustrates initiative and impact."
  ];

  function getScoreColor(score: number): string {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  }

  return (
    <Card className="w-full max-h-[calc(60vh-8rem)] overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-heading font-semibold">Essay Feedback</CardTitle>
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
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm">Analyzing your essay...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center p-4 bg-destructive/10 text-destructive rounded-lg">
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onGenerateFeedback}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}
        
        {!isLoading && !error && (
          <>
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
              {metrics.map((metric) => (
                <div key={metric.label} className="space-y-2" data-testid={`score-${metric.label}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">{metric.label}</span>
                    <span className="text-sm font-semibold">{metric.score}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${metric.color}`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Feedback */}
            <div className="pt-4 border-t">
              <h4 className="font-heading font-medium mb-2">Detailed analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-detailed-feedback">
                {summary}
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed mt-3" data-testid="text-improvement-suggestion">
                {improvementSuggestion}
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <h5 className="font-medium mb-2 text-sm">Key strengths</h5>
                  <ul className="space-y-1">
                    {strengths.map((item, index) => (
                      <li key={`strength-${index}`} className="text-xs text-muted-foreground flex items-start">
                        <span className="mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2 text-sm">Next draft priorities</h5>
                  <ul className="space-y-1">
                    {improvementAreas.map((item, index) => (
                      <li key={`improve-${index}`} className="text-xs text-muted-foreground flex items-start">
                        <span className="mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}