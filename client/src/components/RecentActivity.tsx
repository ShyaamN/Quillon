import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Trophy, MessageSquare, Clock, Calendar } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'essay' | 'activity' | 'feedback' | 'deadline';
  title: string;
  description: string;
  time: string;
  status?: 'completed' | 'in-progress' | 'upcoming';
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'essay',
    title: 'Personal Statement Updated',
    description: 'Revised introduction and conclusion paragraphs',
    time: '2 hours ago',
    status: 'completed'
  },
  {
    id: '2',
    type: 'feedback',
    title: 'AI Feedback Generated',
    description: 'Stanford supplemental essay analysis completed',
    time: '4 hours ago',
    status: 'completed'
  },
  {
    id: '3',
    type: 'activity',
    title: 'Debate Team Activity Added',
    description: 'Added leadership role and impact description',
    time: '1 day ago',
    status: 'completed'
  },
  {
    id: '4',
    type: 'deadline',
    title: 'Harvard Application Due',
    description: 'Complete remaining essays and review',
    time: '3 days',
    status: 'upcoming'
  },
  {
    id: '5',
    type: 'essay',
    title: 'Why Major Essay Draft',
    description: 'Started MIT engineering essay',
    time: '2 days ago',
    status: 'in-progress'
  }
];

function getActivityIcon(type: string) {
  switch (type) {
    case 'essay':
      return <FileText className="w-4 h-4 text-blue-500" />;
    case 'activity':
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    case 'feedback':
      return <MessageSquare className="w-4 h-4 text-green-500" />;
    case 'deadline':
      return <Calendar className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
}

function getStatusVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'completed':
      return 'secondary';
    case 'in-progress':
      return 'outline';
    case 'upcoming':
      return 'destructive';
    default:
      return 'default';
  }
}

export default function RecentActivity() {
  return (
    <Card className="gradient-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"></div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border/30 hover:bg-card/50 transition-colors">
            <div className="mt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{activity.title}</h4>
                {activity.status && (
                  <Badge variant={getStatusVariant(activity.status)} className="text-xs px-2 py-0.5">
                    {activity.status === 'in-progress' ? 'In Progress' : 
                     activity.status === 'upcoming' ? 'Upcoming' : 'Done'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground/80">
                {activity.status === 'upcoming' ? `Due in ${activity.time}` : activity.time}
              </p>
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs text-muted-foreground"
            data-testid="button-view-all-activity"
          >
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}