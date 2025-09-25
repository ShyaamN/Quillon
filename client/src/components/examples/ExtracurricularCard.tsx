import ExtracurricularCard from '../ExtracurricularCard';

export default function ExtracurricularCardExample() {
  const mockActivity = {
    id: '1',
    activityName: 'Debate Team Captain',
    description: 'Led a team of 12 students in competitive debate tournaments, organizing practice sessions and developing argument strategies.',
    role: 'Captain',
    duration: '2022-2024',
    impact: 'Improved team ranking from regional to state level, won 3 major tournaments, and mentored junior members in public speaking skills.'
  };

  return (
    <div className="p-6 max-w-md">
      <ExtracurricularCard
        activity={mockActivity}
        onEdit={(activity) => console.log('Edit activity:', activity.activityName)}
        onDelete={(id) => console.log('Delete activity:', id)}
        onAIRefine={(activity) => console.log('AI refine:', activity.activityName)}
        needsRefinement={true}
      />
    </div>
  );
}