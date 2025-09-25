import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/components/Dashboard";
import EssayList from "@/components/EssayList";
import EssayEditor from "@/components/EssayEditor";
import ExtracurricularList from "@/components/ExtracurricularList";
import NotFound from "@/pages/not-found";

// Mock data - todo: replace with real data
const mockEssays = [
  {
    id: '1',
    title: 'Overcoming Cultural Barriers Through Language',
    collegeTarget: 'Common App',
    essayType: 'Personal Statement',
    wordCount: 487,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    content: '<p>Growing up in a bilingual household taught me that language is more than just words—it\'s a bridge between worlds. When my family immigrated from Vietnam, I became the translator for my parents, navigating not just words but entire cultural contexts...</p>'
  },
  {
    id: '2',
    title: 'Why Computer Science at Stanford',
    collegeTarget: 'Stanford University',
    essayType: 'Why Major',
    wordCount: 312,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 12),
    content: '<p>My fascination with artificial intelligence began when I built my first chatbot during freshman year. What started as a simple project evolved into a deep appreciation for the intersection of technology and human behavior...</p>'
  },
  {
    id: '3',
    title: 'Leadership in Community Service',
    collegeTarget: 'UC Berkeley',
    essayType: 'Leadership',
    wordCount: 256,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 6),
    content: '<p>When our local food bank faced volunteer shortages during the pandemic, I knew I had to act. Rather than simply volunteering myself, I organized a student volunteer network that ultimately served over 500 families...</p>'
  }
];

const mockActivities = [
  {
    id: '1',
    activityName: 'Debate Team Captain',
    description: 'Led a team of 12 students in competitive debate tournaments, organizing practice sessions and developing argument strategies.',
    role: 'Captain',
    duration: '2022-2024',
    impact: 'Improved team ranking from regional to state level, won 3 major tournaments, and mentored junior members in public speaking skills.'
  },
  {
    id: '2',
    activityName: 'Volunteer Math Tutor',
    description: 'Provided free tutoring services to underprivileged students in algebra and geometry through local community center.',
    role: 'Tutor',
    duration: '2021-2024',
    impact: 'Helped 25+ students improve their grades by an average of one letter grade, with 90% passing their final exams.'
  },
  {
    id: '3',
    activityName: 'Environmental Club President',
    description: 'Founded and led school environmental awareness club, organizing campus sustainability initiatives and community outreach programs.',
    role: 'President & Founder',
    duration: '2020-2024',
    impact: 'Reduced school waste by 30% through recycling program, planted 200+ trees, and engaged 150+ students in environmental activities.'
  },
  {
    id: '4',
    activityName: 'Hospital Volunteer',
    description: 'Assisted medical staff and provided comfort to patients and families in the pediatric ward.',
    role: 'Volunteer',
    duration: '2021-2023',
    impact: 'Completed 200+ volunteer hours, supported 50+ families during difficult times, and gained valuable healthcare experience.'
  },
  {
    id: '5',
    activityName: 'Student Government Treasurer',
    description: 'Managed student body budget and organized fundraising events for school programs and activities.',
    role: 'Treasurer',
    duration: '2023-2024',
    impact: 'Successfully managed $15,000 annual budget, increased fundraising by 40%, and funded 8 new student programs.'
  }
];

function Router() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'essays' | 'essay-editor' | 'extracurriculars'>('dashboard');
  const [selectedEssay, setSelectedEssay] = useState<any>(null);
  const [essays, setEssays] = useState(mockEssays);
  const [activities, setActivities] = useState(mockActivities);

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

  return (
    <Switch>
      <Route path="/">
        {currentView === 'dashboard' && (
          <Dashboard
            onNavigateToEssays={handleNavigateToEssays}
            onNavigateToExtracurriculars={handleNavigateToExtracurriculars}
          />
        )}
        
        {currentView === 'essays' && (
          <div className="min-h-screen bg-background">
            <div className="p-6">
              <button 
                onClick={handleBackToDashboard}
                className="mb-4 text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Dashboard
              </button>
              <EssayList
                essays={essays}
                onSelectEssay={handleSelectEssay}
                onNewEssay={handleNewEssay}
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
            <button 
              onClick={handleBackToDashboard}
              className="p-6 pb-0 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Dashboard
            </button>
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
