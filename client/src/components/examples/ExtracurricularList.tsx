import ExtracurricularList from '../ExtracurricularList';

export default function ExtracurricularListExample() {
  // todo: remove mock functionality
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
    }
  ];

  return (
    <ExtracurricularList
      activities={mockActivities}
      onAddNew={() => console.log('Adding new activity')}
      onEdit={(activity) => console.log('Editing activity:', activity.activityName)}
      onDelete={(id) => console.log('Deleting activity:', id)}
      onAIRefine={(activity) => console.log('AI refining activity:', activity.activityName)}
    />
  );
}