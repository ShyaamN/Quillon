import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useActivities } from "@/hooks/useActivities";
import { AuthModal } from "@/components/AuthModal";
import { LandingPage } from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";
import EssayList from "@/components/EssayList";
import EssayEditor from "@/components/EssayEditor";
import ExtracurricularList from "@/components/ExtracurricularList";
import ActivityEditor from "@/components/ActivityEditor";
import NotFound from "@/pages/not-found";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExtracurricularActivity } from "@/hooks/useActivities";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <LandingPage />
      </div>
    );
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AuthenticatedApp user={user} />
    </div>
  );
}

function AuthenticatedApp({ user }: { user: any }) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'essays' | 'essay-editor' | 'extracurriculars' | 'activity-editor'>('dashboard');
  const [selectedEssay, setSelectedEssay] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<ExtracurricularActivity | null>(null);
  const [essays, setEssays] = useState<any[]>([]);
  
  // Use the activities hook
  const { 
    activities, 
    isLoading: activitiesLoading, 
    error: activitiesError,
    createActivity,
    updateActivity,
    deleteActivity,
    refineActivity
  } = useActivities();

  const handleNavigateToEssays = () => setCurrentView('essays');
  const handleNavigateToExtracurriculars = () => setCurrentView('extracurriculars');
  const handleBackToDashboard = () => setCurrentView('dashboard');
  
  const handleSelectEssay = (essay: any) => {
    setSelectedEssay(essay);
    setCurrentView('essay-editor');
  };
  
  const handleNewEssay = () => {
    setSelectedEssay(null);
    setCurrentView('essay-editor');
  };
  
  const handleSaveEssay = (essay: any) => {
    if (essay.id) {
      setEssays(prev => prev.map(e => e.id === essay.id ? essay : e));
    } else {
      const newEssay = { ...essay, id: Date.now().toString(), lastModified: new Date() };
      setEssays(prev => [...prev, newEssay]);
    }
    setCurrentView('essays');
  };

  const handleNewEssayFromDashboard = () => {
    setSelectedEssay(null);
    setCurrentView('essay-editor');
  };

  const handleNewActivityFromDashboard = () => {
    setSelectedActivity(null);
    setCurrentView('activity-editor');
  };

  const handleAddNewActivity = () => {
    setSelectedActivity(null);
    setCurrentView('activity-editor');
  };

  const handleEditActivity = (activity: ExtracurricularActivity) => {
    setSelectedActivity(activity);
    setCurrentView('activity-editor');
  };

  const handleSaveActivity = async (activityData: any) => {
    try {
      console.log('Saving activity:', activityData, 'Selected activity:', selectedActivity);
      
      if (selectedActivity) {
        // Update existing activity
        await updateActivity(selectedActivity.id, activityData);
        console.log('Activity updated successfully');
      } else {
        // Create new activity
        const newActivity = await createActivity(activityData);
        console.log('Activity created successfully:', newActivity);
      }
      
      // Clear the selected activity and navigate back
      setSelectedActivity(null);
      setCurrentView('extracurriculars');
    } catch (error) {
      console.error('Error saving activity:', error);
      // You might want to show a toast notification here
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await deleteActivity(id);
    } catch (error) {
      console.error('Error deleting activity:', error);
      // You might want to show a toast notification here
    }
  };

  const handleAIRefineActivity = async (activity: ExtracurricularActivity) => {
    try {
      await refineActivity(activity);
      // You might want to show a success toast here
    } catch (error) {
      console.error('Error refining activity:', error);
      // You might want to show an error toast here
    }
  };

  const handleDeleteEssay = (id: string) => {
    setEssays(prev => prev.filter(e => e.id !== id));
  };

  return (
    <Switch>
      <Route path="/">
        {currentView === 'dashboard' && (
          <Dashboard
            onNavigateToEssays={handleNavigateToEssays}
            onNavigateToExtracurriculars={handleNavigateToExtracurriculars}
            onNewEssay={handleNewEssayFromDashboard}
            onNewActivity={handleNewActivityFromDashboard}
          />
        )}
        
        {currentView === 'essays' && (
          <div className="min-h-screen bg-background">
            <div className="p-6">
              <Button 
                onClick={handleBackToDashboard}
                variant="ghost"
                size="sm"
                className="mb-4"
              >
                Dashboard
              </Button>
              <EssayList
                essays={essays}
                onSelectEssay={handleSelectEssay}
                onNewEssay={handleNewEssay}
                onDeleteEssay={handleDeleteEssay}
              />
            </div>
          </div>
        )}
        
        {currentView === 'essay-editor' && (
          <EssayEditor
            essay={selectedEssay}
            onBack={() => setCurrentView('essays')}
            onSave={handleSaveEssay}
          />
        )}
        
        {currentView === 'extracurriculars' && (
          <div className="min-h-screen bg-background">
            <div className="p-6 pb-0">
              <Button 
                onClick={handleBackToDashboard}
                variant="ghost"
                size="sm"
                className="mb-4"
              >
                Dashboard
              </Button>
            </div>
            {activitiesLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading activities...</p>
                </div>
              </div>
            ) : activitiesError ? (
              <div className="flex items-center justify-center h-64">
                <Card className="w-96">
                  <CardHeader>
                    <CardTitle className="text-destructive">Error Loading Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{activitiesError}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <ExtracurricularList
                activities={activities}
                onAddNew={handleAddNewActivity}
                onEdit={handleEditActivity}
                onDelete={handleDeleteActivity}
                onAIRefine={handleAIRefineActivity}
              />
            )}
          </div>
        )}
        
        {currentView === 'activity-editor' && (
          <ActivityEditor
            activity={selectedActivity || undefined}
            onBack={() => setCurrentView('extracurriculars')}
            onSave={handleSaveActivity}
          />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
