import { Edit2, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExtracurricularActivity {
  id: string;
  activityName: string;
  description: string;
  role: string;
  duration: string;
  impact: string;
}

interface ExtracurricularCardProps {
  activity: ExtracurricularActivity;
  onEdit: (activity: ExtracurricularActivity) => void;
  onDelete: (id: string) => void;
  onAIRefine: (activity: ExtracurricularActivity) => void;
  needsRefinement?: boolean;
}

export default function ExtracurricularCard({ 
  activity, 
  onEdit, 
  onDelete, 
  onAIRefine,
  needsRefinement = false 
}: ExtracurricularCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-activity-${activity.id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg leading-none">{activity.activityName}</CardTitle>
            {needsRefinement && (
              <Badge variant="outline" className="text-xs">
                Needs AI Refinement
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium">{activity.role}</span>
            <span>{activity.duration}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAIRefine(activity)}
            data-testid={`button-ai-refine-${activity.id}`}
            className="hover-elevate"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(activity)}
            data-testid={`button-edit-${activity.id}`}
            className="hover-elevate"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(activity.id)}
            data-testid={`button-delete-${activity.id}`}
            className="hover-elevate text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
          <p className="text-sm leading-relaxed" data-testid={`text-description-${activity.id}`}>
            {activity.description}
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Impact</h4>
          <p className="text-sm leading-relaxed" data-testid={`text-impact-${activity.id}`}>
            {activity.impact}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}