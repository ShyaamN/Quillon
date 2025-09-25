import EssayList from '../EssayList';

export default function EssayListExample() {
  // todo: remove mock functionality
  const mockEssays = [
    {
      id: '1',
      title: 'Overcoming Cultural Barriers Through Language',
      collegeTarget: 'Common App',
      essayType: 'Personal Statement',
      wordCount: 487,
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      content: '<p>Growing up in a bilingual household taught me that language is more than just words...</p>'
    },
    {
      id: '2',
      title: 'Why Computer Science at Stanford',
      collegeTarget: 'Stanford University',
      essayType: 'Why Major',
      wordCount: 312,
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      content: '<p>My fascination with artificial intelligence began when I built my first chatbot...</p>'
    },
    {
      id: '3',
      title: 'Leadership in Community Service',
      collegeTarget: 'UC Berkeley',
      essayType: 'Leadership',
      wordCount: 256,
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      content: '<p>When our local food bank faced volunteer shortages during the pandemic...</p>'
    }
  ];

  return (
    <div className="p-6">
      <EssayList
        essays={mockEssays}
        onSelectEssay={(essay) => console.log('Selected essay:', essay.title)}
        onNewEssay={() => console.log('Creating new essay')}
      />
    </div>
  );
}