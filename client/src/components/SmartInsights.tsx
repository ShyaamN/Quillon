import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Target, Zap } from 'lucide-react';

interface Insight {
  id: string;
  type: 'recommendation' | 'improvement' | 'achievement' | 'urgent';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'urgent',
    title: 'Harvard Essay Deadline Approaching',
    description: 'Complete your "Why Harvard" essay within 3 days to stay on track.',
    action: 'Start Essay',
    priority: 'high'
  },
  {
    id: '2',
    type: 'improvement',
    title: 'Enhance Your Personal Statement',
    description: 'Your essay flow score is 65%. Consider adding smoother transitions between paragraphs.',
    action: 'Review Essay',
    priority: 'medium'
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Strong Activity Portfolio',
    description: 'Your extracurricular activities show excellent leadership and commitment.',
    priority: 'low'
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'AI Enhancement Suggestion',
    description: 'Consider using AI refinement for 2 activities that could be strengthened.',
    action: 'Refine Activities',
    priority: 'medium'
  }
];

function getInsightIcon(type: string) {
  switch (type) {
    case 'urgent':
      return <Zap className="w-4 h-4 text-red-500" />;
    case 'improvement':
      return <TrendingUp className="w-4 h-4 text-orange-500" />;
    case 'achievement':
      return <Target className="w-4 h-4 text-green-500" />;
    default:
      return <Lightbulb className="w-4 h-4 text-blue-500" />;
  }
}

function getPriorityVariant(priority: string): "default" | "secondary" | "destructive" | "outline" {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'outline';
    default:
      return 'secondary';
  }
}

interface SmartInsightsProps {
  onNavigateToEssays?: () => void;
  onNavigateToExtracurriculars?: () => void;
}

export default function SmartInsights({ onNavigateToEssays, onNavigateToExtracurriculars }: SmartInsightsProps) {
  const handleInsightAction = (action: string) => {
    switch (action) {
      case 'Start Essay':
      case 'Review Essay':
        onNavigateToEssays?.();
        break;
      case 'Refine Activities':
        onNavigateToExtracurriculars?.();
        break;
      default:
        console.log(`Action triggered: ${action}`);
    }
  };

  return (
    <Card className="gradient-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockInsights.map((insight) => (
          <div key={insight.id} className="p-4 rounded-lg bg-card/50 border border-border/50 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {getInsightIcon(insight.type)}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <Badge variant={getPriorityVariant(insight.priority)} className="text-xs px-2 py-1">
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
            
            {insight.action && (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant={insight.priority === 'high' ? 'default' : 'outline'}
                  onClick={() => handleInsightAction(insight.action!)}
                  className="text-xs"
                  data-testid={`button-insight-${insight.id}`}
                >
                  {insight.action}
                </Button>
              </div>
            )}
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs text-muted-foreground"
            data-testid="button-view-all-recommendations"
          >
            View All Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}