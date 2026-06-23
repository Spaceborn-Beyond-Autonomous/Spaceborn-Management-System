export const teamLeadData = {
  user: {
    name: 'John Doe',
    role: 'Team Lead',
    team: 'Frontend Core Systems'
  },
  
  sprintMetrics: {
    currentSprint: 'Sprint 24',
    sprintProgress: 65,
    daysRemaining: 3,
    tasksCompleted: 24,
    totalTasks: 37,
    velocity: 78,
    commitment: 85
  },
  
  taskBreakdown: {
    todo: 12,
    inProgress: 8,
    inReview: 5,
    done: 24,
    blocked: 3
  },
  
  sprintTasks: [
    { id: 1, title: 'User authentication flow', assignee: 'Priya', status: 'in-progress', priority: 'high', storyPoints: 8 },
    { id: 2, title: 'API rate limiting', assignee: 'Rahul', status: 'todo', priority: 'medium', storyPoints: 5 },
    { id: 3, title: 'Dashboard widgets', assignee: 'Anjali', status: 'in-review', priority: 'high', storyPoints: 13 }
  ],
  
  teamMembers: [
    { name: 'Priya Sharma', role: 'Senior Dev', capacity: 40, assigned: 35, efficiency: 88 },
    { name: 'Rahul Verma', role: 'Frontend Dev', capacity: 40, assigned: 38, efficiency: 95 },
    { name: 'Anjali Nair', role: 'UI Dev', capacity: 40, assigned: 32, efficiency: 80 }
  ],
  
  dailyStandup: {
    date: '2024-06-06',
    updates: [
      { member: 'Priya', yesterday: 'Completed login module', today: 'Start profile page', blockers: 'None' },
      { member: 'Rahul', yesterday: 'API documentation', today: 'Implement rate limiting', blockers: 'Waiting for API keys' }
    ]
  },
  
  codeQuality: {
    coverage: 82,
    techDebt: '7.2 hours',
    bugs: 12,
    criticalBugs: 2,
    pullRequests: { open: 5, reviewed: 12, merged: 18 }
  },
  
  ceremonies: [
    { name: 'Daily Standup', time: '10:00 AM', attendees: 8 },
    { name: 'Sprint Planning', time: '2:00 PM', date: 'Jun 10' },
    { name: 'Sprint Review', time: '3:00 PM', date: 'Jun 14' }
  ]
};