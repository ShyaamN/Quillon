import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ExtracurricularActivity {
  id?: string;
  activityName: string;
  description: string;
  role: string;
  duration: string;
  impact: string;
}

interface ActivityEditorProps {
  activity?: ExtracurricularActivity;
  onBack: () => void;
  onSave: (activity: ExtracurricularActivity) => void;
}

export default function ActivityEditor({ activity, onBack, onSave }: ActivityEditorProps) {
  const [currentActivity, setCurrentActivity] = useState<ExtracurricularActivity>(
    activity || {
      activityName: '',
      description: '',
      role: '',
      duration: '',
      impact: ''
    }
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!currentActivity.activityName.trim()) {
      newErrors.activityName = 'Activity name is required';
    }

    if (!currentActivity.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!currentActivity.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (!currentActivity.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    if (!currentActivity.impact.trim()) {
      newErrors.impact = 'Impact is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(currentActivity);
    }
  };

  const handleChange = (field: keyof ExtracurricularActivity, value: string) => {
    setCurrentActivity(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            data-testid="button-back-to-activities"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Activities
          </Button>
          
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold">
              {activity ? 'Edit Activity' : 'Add New Activity'}
            </h1>
          </div>
        </div>
        
        <Button onClick={handleSave} data-testid="button-save-activity">
          <Save className="w-4 h-4 mr-2" />
          Save Activity
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Activity Name */}
              <div>
                <Label htmlFor="activityName">Activity Name *</Label>
                <Input
                  id="activityName"
                  value={currentActivity.activityName}
                  onChange={(e) => handleChange('activityName', e.target.value)}
                  placeholder="e.g., Student Government, Soccer Team, Debate Club"
                  className={errors.activityName ? 'border-destructive' : ''}
                  data-testid="input-activity-name"
                />
                {errors.activityName && (
                  <p className="text-sm text-destructive mt-1">{errors.activityName}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <Label htmlFor="role">Your Role *</Label>
                <Input
                  id="role"
                  value={currentActivity.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  placeholder="e.g., President, Team Captain, Member"
                  className={errors.role ? 'border-destructive' : ''}
                  data-testid="input-role"
                />
                {errors.role && (
                  <p className="text-sm text-destructive mt-1">{errors.role}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={currentActivity.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder="e.g., 9th-12th grade, 3 years, Fall 2023"
                  className={errors.duration ? 'border-destructive' : ''}
                  data-testid="input-duration"
                />
                {errors.duration && (
                  <p className="text-sm text-destructive mt-1">{errors.duration}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description & Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={currentActivity.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe what this activity involves, your responsibilities, and what you've learned..."
                  rows={4}
                  className={errors.description ? 'border-destructive' : ''}
                  data-testid="textarea-description"
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
              </div>

              {/* Impact */}
              <div>
                <Label htmlFor="impact">Impact & Achievements *</Label>
                <Textarea
                  id="impact"
                  value={currentActivity.impact}
                  onChange={(e) => handleChange('impact', e.target.value)}
                  placeholder="What impact did you have? What did you accomplish? Include specific achievements, awards, or measurable results..."
                  rows={4}
                  className={errors.impact ? 'border-destructive' : ''}
                  data-testid="textarea-impact"
                />
                {errors.impact && (
                  <p className="text-sm text-destructive mt-1">{errors.impact}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200">Tips for Great Activities</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 dark:text-blue-300">
              <ul className="space-y-1 text-sm">
                <li>• Be specific about your role and responsibilities</li>
                <li>• Quantify your impact with numbers when possible</li>
                <li>• Show leadership, initiative, and growth</li>
                <li>• Explain what you learned and how it shaped you</li>
                <li>• Connect to your academic or career interests when relevant</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}