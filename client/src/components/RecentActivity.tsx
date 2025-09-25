import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, Trophy } from 'lucide-react';

export default function RecentActivity() {
  return (
    <Card className="gradient-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-6">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-heading font-medium mb-2">No Activity Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your recent work and progress will appear here
          </p>
          
          <div className="space-y-2">
            <Button
              size="sm" 
              variant="outline"
              className="w-full"
              data-testid="button-create-first-essay"
            >
              <FileText className="w-4 h-4 mr-2" />
              Create Your First Essay
            </Button>
            <Button
              size="sm"
              variant="outline" 
              className="w-full"
              data-testid="button-add-first-activity"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Add Your First Activity
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}