import ApplicationProgress from "./ApplicationProgress";
import SmartInsights from "./SmartInsights";
import RecentActivity from "./RecentActivity";

interface DashboardProps {
  onNavigateToEssays: () => void;
  onNavigateToExtracurriculars: () => void;
  onNewEssay?: () => void;
  onNewActivity?: () => void;
}

export default function Dashboard({ onNavigateToEssays, onNavigateToExtracurriculars }: DashboardProps) {
  return (
    <div className="min-h-screen gradient-subtle">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 space-y-10">
        {/* Welcome Section */}
        <div className="w-full">
          <ApplicationProgress 
            onNavigateToEssays={onNavigateToEssays}
            onNavigateToExtracurriculars={onNavigateToExtracurriculars}
          />
        </div>

        {/* Insights and Activity Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SmartInsights 
            onNavigateToEssays={onNavigateToEssays}
            onNavigateToExtracurriculars={onNavigateToExtracurriculars}
          />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}