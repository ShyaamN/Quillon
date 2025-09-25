import { Plus, FileText, Clock, BookOpen, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Essay {
  id: string;
  title: string;
  collegeTarget: string;
  essayType: string;
  wordCount: number;
  lastModified: Date;
  content: string;
}

interface EssayListProps {
  essays: Essay[];
  onSelectEssay: (essay: Essay) => void;
  onNewEssay: () => void;
  onDeleteEssay: (id: string) => void;
}

export default function EssayList({ essays, onSelectEssay, onNewEssay, onDeleteEssay }: EssayListProps) {
  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-heading font-semibold">Your Essays</h2>
        </div>
        <Button onClick={onNewEssay} data-testid="button-new-essay">
          <Plus className="w-4 h-4 mr-2" />
          New Essay
        </Button>
      </div>

      {/* Essays Grid */}
      {essays.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-heading font-medium mb-2">No essays yet</h3>
          <p className="text-muted-foreground mb-4">
            Start writing your first college application essay
          </p>
          <Button onClick={onNewEssay}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Essay
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {essays.map((essay) => (
            <Card 
              key={essay.id} 
              className="hover-elevate cursor-pointer relative"
              onClick={() => onSelectEssay(essay)}
              data-testid={`card-essay-${essay.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight line-clamp-2">
                    {essay.title}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <AlertDialogTrigger className="flex items-center w-full">
                              <Trash2 className="w-4 h-4 mr-2 text-destructive" />
                              Delete Essay
                            </AlertDialogTrigger>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Essay</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{essay.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteEssay(essay.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {essay.collegeTarget}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {essay.essayType}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>{essay.wordCount} words</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(essay.lastModified)}</span>
                    </div>
                  </div>
                </div>
                
                {essay.content && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {essay.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}