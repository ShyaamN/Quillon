import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export interface ExtracurricularActivity {
  id: string;
  activityName: string;
  description: string;
  role: string;
  duration: string;
  impact: string;
  lastModified: string;
}

export interface CreateActivityData {
  activityName: string;
  description: string;
  role: string;
  duration: string;
  impact: string;
}

export function useActivities() {
  const [activities, setActivities] = useState<ExtracurricularActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiRequest('GET', '/api/extracurriculars');
      const data = await response.json();
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      console.error('Error fetching activities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createActivity = async (activityData: CreateActivityData): Promise<ExtracurricularActivity> => {
    try {
      const response = await apiRequest('POST', '/api/extracurriculars', activityData);
      if (!response.ok) {
        throw new Error(`Failed to create activity: ${response.statusText}`);
      }
      const newActivity = await response.json();
      setActivities(prev => [...prev, newActivity]);
      return newActivity;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create activity';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateActivity = async (id: string, activityData: Partial<CreateActivityData>): Promise<ExtracurricularActivity> => {
    try {
      const response = await apiRequest('PUT', `/api/extracurriculars/${id}`, activityData);
      if (!response.ok) {
        throw new Error(`Failed to update activity: ${response.statusText}`);
      }
      const updatedActivity = await response.json();
      setActivities(prev => prev.map(activity => 
        activity.id === id ? updatedActivity : activity
      ));
      return updatedActivity;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update activity';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteActivity = async (id: string): Promise<void> => {
    try {
      const response = await apiRequest('DELETE', `/api/extracurriculars/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to delete activity: ${response.statusText}`);
      }
      setActivities(prev => prev.filter(activity => activity.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete activity';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refineActivity = async (activity: ExtracurricularActivity): Promise<ExtracurricularActivity> => {
    try {
      console.log('Refining activity:', activity);
      
      // Ensure the activity exists and has required fields
      if (!activity.id || !activity.activityName || !activity.description || !activity.impact) {
        throw new Error('Activity must have all required fields to be refined');
      }
      
      const response = await apiRequest('POST', `/api/extracurriculars/${activity.id}/refine`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Failed to refine activity: ${response.statusText} - ${errorData.error || ''}`);
      }
      const refinementData = await response.json();
      console.log('Refinement response:', refinementData);
      
      // Map the refinement response to activity fields
      const refinedActivity = {
        description: refinementData.refinedDescription,
        impact: refinementData.refinedImpact,
        // Keep other fields unchanged
        activityName: activity.activityName,
        role: activity.role,
        duration: activity.duration
      };
      
      // Update the activity with refined content
      const updatedActivity = await updateActivity(activity.id, refinedActivity);
      console.log('Activity refined successfully:', updatedActivity);
      return updatedActivity;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refine activity';
      console.error('Error in refineActivity:', errorMessage, err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    isLoading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
    refineActivity,
    refetch: fetchActivities
  };
}