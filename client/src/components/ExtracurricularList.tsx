import { useState } from 'react';
import { Plus, Trophy, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ExtracurricularCard from './ExtracurricularCard';

interface ExtracurricularActivity {
  id: string;
  activityName: string;
  description: string;
  role: string;
  duration: string;
  impact: string;
}

interface ExtracurricularListProps {
  activities: ExtracurricularActivity[];
  onAddNew: () => void;
  onEdit: (activity: ExtracurricularActivity) => void;
  onDelete: (id: string) => void;
  onAIRefine: (activity: ExtracurricularActivity) => void;
}

export default function ExtracurricularList({ 
  activities, 
  onAddNew, 
  onEdit, 
  onDelete, 
  onAIRefine 
}: ExtracurricularListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredActivities = activities.filter(activity =>
    activity.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activitiesNeedingRefinement = activities.filter((_, index) => index < 2); // Mock: first 2 need refinement

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Extracurricular Activities</h1>
        </div>
        <Button onClick={onAddNew} data-testid="button-add-activity">
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search activities..."
          className="pl-10"
          data-testid="input-search-activities"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold" data-testid="text-total-activities">
              {activities.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Need AI Refinement
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-amber-500" data-testid="text-need-refinement">
              {activitiesNeedingRefinement.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leadership Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-500" data-testid="text-leadership-count">
              {activities.filter(a => a.role.toLowerCase().includes('captain') || 
                                     a.role.toLowerCase().includes('president') || 
                                     a.role.toLowerCase().includes('leader')).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 && activities.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
            <Trophy className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No activities yet</h3>
          <p className="text-muted-foreground mb-4">
            Start building your extracurricular profile for college applications
          </p>
          <Button onClick={onAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Activity
          </Button>
        </Card>
      ) : filteredActivities.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No activities found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredActivities.map((activity) => (
            <ExtracurricularCard
              key={activity.id}
              activity={activity}
              onEdit={onEdit}
              onDelete={onDelete}
              onAIRefine={onAIRefine}
              needsRefinement={activitiesNeedingRefinement.includes(activity)}
            />
          ))}
        </div>
      )}
    </div>
  );
}