import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Trophy } from 'lucide-react';

interface WelcomeSectionProps {
  onNavigateToEssays: () => void;
  onNavigateToExtracurriculars: () => void;
}

export default function ApplicationProgress({ onNavigateToEssays, onNavigateToExtracurriculars }: WelcomeSectionProps) {
  return (
    <Card className="gradient-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          Get Started
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
            <PlusCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-heading font-semibold mb-2">Welcome to Quillon!</h3>
          <p className="text-muted-foreground mb-6">
            Start building your college application with our AI-powered tools
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Button
              onClick={onNavigateToEssays}
              className="w-full h-12 text-base font-medium flex items-center justify-center gap-2"
              data-testid="button-get-started-essays"
            >
              <FileText className="w-5 h-5" />
              <span>Manage Essays</span>
            </Button>
            
            <Button
              onClick={onNavigateToExtracurriculars}
              className="w-full h-12 text-base font-medium flex items-center justify-center gap-2"
              variant="outline"
              data-testid="button-get-started-activities"
            >
              <Trophy className="w-5 h-5" />
              <span>Manage Activities</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}