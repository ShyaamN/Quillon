import Dashboard from '../Dashboard';

export default function DashboardExample() {
  return (
    <Dashboard 
      onNavigateToEssays={() => console.log('Navigate to Essays')}
      onNavigateToExtracurriculars={() => console.log('Navigate to Extracurriculars')}
    />
  );
}