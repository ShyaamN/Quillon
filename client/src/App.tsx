import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import { LandingPage } from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";
import EssayList from "@/components/EssayList";
import EssayEditor from "@/components/EssayEditor";
import ExtracurricularList from "@/components/ExtracurricularList";
import NotFound from "@/pages/not-found";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [currentView, setCurrentView] = useState<'dashboard' | 'essays' | 'essay-editor' | 'extracurriculars'>('dashboard');
  const [selectedEssay, setSelectedEssay] = useState<any>(null);
  const [essays, setEssays] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

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
  
  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const handleNewEssayFromDashboard = () => {
    setSelectedEssay(null);
    setCurrentView('essay-editor');
  };

  const handleNewActivityFromDashboard = () => {
    setCurrentView('extracurriculars');
    // In the future, this could open a modal or navigate to an activity editor
    console.log('New activity creation triggered from dashboard');
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
            <ExtracurricularList
              activities={activities}
              onAddNew={() => console.log('Add new activity')}
              onEdit={(activity) => console.log('Edit activity:', activity.activityName)}
              onDelete={handleDeleteActivity}
              onAIRefine={(activity) => console.log('AI refine:', activity.activityName)}
            />
          </div>
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
