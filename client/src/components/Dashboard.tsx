import { BookOpen, Trophy, PlusCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardProps {
  onNavigateToEssays: () => void;
  onNavigateToExtracurriculars: () => void;
}

export default function Dashboard({ onNavigateToEssays, onNavigateToExtracurriculars }: DashboardProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Quillon</h1>
        <p className="text-muted-foreground">Your AI-powered college application assistant</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Essays Section */}
        <Card className="hover-elevate cursor-pointer" onClick={onNavigateToEssays} data-testid="card-essays">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Essays</CardTitle>
            <CardDescription>
              Write and manage your college application essays with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Common App Essay: In Progress</span>
              <span>3 College Essays</span>
            </div>
            <Button 
              className="w-full" 
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToEssays();
              }}
              data-testid="button-manage-essays"
            >
              <FileText className="w-4 h-4 mr-2" />
              Manage Essays
            </Button>
          </CardContent>
        </Card>

        {/* Extracurriculars Section */}
        <Card className="hover-elevate cursor-pointer" onClick={onNavigateToExtracurriculars} data-testid="card-extracurriculars">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-accent-foreground" />
            </div>
            <CardTitle className="text-xl">Extracurriculars</CardTitle>
            <CardDescription>
              Organize and optimize your extracurricular activities with AI guidance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>5 Activities Listed</span>
              <span>2 Need Refinement</span>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToExtracurriculars();
              }}
              data-testid="button-manage-extracurriculars"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Manage Activities
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Button variant="outline" size="sm" data-testid="button-new-essay">
          <PlusCircle className="w-4 h-4 mr-2" />
          New Essay
        </Button>
        <Button variant="outline" size="sm" data-testid="button-new-activity">
          <PlusCircle className="w-4 h-4 mr-2" />
          New Activity
        </Button>
      </div>
    </div>
  );
}