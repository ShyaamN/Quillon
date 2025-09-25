import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Target, FileText } from 'lucide-react';

interface SmartInsightsProps {
  onNavigateToEssays?: () => void;
  onNavigateToExtracurriculars?: () => void;
}

export default function SmartInsights({ onNavigateToEssays, onNavigateToExtracurriculars }: SmartInsightsProps) {
  return (
    <Card className="gradient-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-6">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-heading font-medium mb-2">Smart Insights Coming Soon</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start creating content and get AI-powered insights to improve your application
          </p>
          
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onNavigateToEssays}
              className="w-full"
              data-testid="button-start-writing"
            >
              <FileText className="w-4 h-4 mr-2" />
              Start Writing Essays
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onNavigateToExtracurriculars}
              className="w-full"
              data-testid="button-add-activities"
            >
              <Target className="w-4 h-4 mr-2" />
              Add Activities
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}