import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface ApplicationStatus {
  college: string;
  progress: number;
  essays: { completed: number; total: number };
  activities: { completed: number; total: number };
  deadline: string;
  status: 'on-track' | 'needs-attention' | 'completed';
}

const mockApplications: ApplicationStatus[] = [
  {
    college: 'Stanford University',
    progress: 75,
    essays: { completed: 2, total: 3 },
    activities: { completed: 5, total: 5 },
    deadline: 'Jan 5, 2025',
    status: 'on-track'
  },
  {
    college: 'Harvard University',
    progress: 45,
    essays: { completed: 1, total: 4 },
    activities: { completed: 3, total: 5 },
    deadline: 'Jan 1, 2025',
    status: 'needs-attention'
  },
  {
    college: 'UC Berkeley',
    progress: 90,
    essays: { completed: 3, total: 4 },
    activities: { completed: 5, total: 5 },
    deadline: 'Dec 15, 2024',
    status: 'on-track'
  }
];

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'needs-attention':
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    default:
      return <Clock className="w-4 h-4 text-blue-500" />;
  }
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'completed':
      return 'default';
    case 'needs-attention':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default function ApplicationProgress() {
  return (
    <Card className="gradient-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          Application Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockApplications.map((app) => (
          <div key={app.college} className="space-y-3 p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{app.college}</h4>
                {getStatusIcon(app.status)}
              </div>
              <Badge variant={getStatusVariant(app.status)} className="text-xs">
                {app.status === 'needs-attention' ? 'Needs Attention' : 
                 app.status === 'completed' ? 'Complete' : 'On Track'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{app.progress}%</span>
              </div>
              <Progress value={app.progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Essays</span>
                <span className={`font-medium ${app.essays.completed === app.essays.total ? 'text-green-600' : 'text-orange-600'}`}>
                  {app.essays.completed}/{app.essays.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Activities</span>
                <span className={`font-medium ${app.activities.completed === app.activities.total ? 'text-green-600' : 'text-orange-600'}`}>
                  {app.activities.completed}/{app.activities.total}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-2">
              <span>Deadline: {app.deadline}</span>
              <span className={`${new Date(app.deadline) < new Date() ? 'text-red-500' : 'text-muted-foreground'}`}>
                {(() => {
                  const daysLeft = Math.ceil((new Date(app.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return daysLeft < 0 ? 'Deadline passed' : `${daysLeft} days left`;
                })()}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}