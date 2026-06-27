export const managerData = {
  user: {
    name: 'John Doe',
    role: 'Manager',
    department: 'Core Systems'
  },
  
  teamMetrics: {
    totalMembers: 48,
    activeProjects: 8,
    completedSprints: 12,
    teamVelocity: 82,
    onTimeDelivery: 85,
    qualityScore: 4.6,
    pendingApprovals: 5
  },
  
  subTeams: [
    { name: 'Frontend', members: 18, progress: 85, lead: 'Priya Sharma' },
    { name: 'Backend', members: 20, progress: 78, lead: 'Rahul Verma' },
    { name: 'DevOps', members: 10, progress: 92, lead: 'Anjali Nair' }
  ],
  
  teamMembers: [
    { name: 'Priya Sharma', role: 'Senior Developer', tasks: 28, productivity: 94, status: 'active' },
    { name: 'Rahul Verma', role: 'Frontend Lead', tasks: 24, productivity: 88, status: 'active' },
    { name: 'Anjali Nair', role: 'Backend Dev', tasks: 26, productivity: 92, status: 'active' },
    { name: 'Vikram Singh', role: 'QA Engineer', tasks: 22, productivity: 86, status: 'active' }
  ],
  
  departmentProjects: [
    { name: 'API Gateway', progress: 75, status: 'on-track', deadline: 'Jun 20', team: 'Backend' },
    { name: 'Dashboard Redesign', progress: 45, status: 'at-risk', deadline: 'Jun 25', team: 'Frontend' },
    { name: 'Performance Optimization', progress: 90, status: 'on-track', deadline: 'Jun 15', team: 'DevOps' }
  ],
  
  pendingApprovals: [
    { id: 1, type: 'Leave Request', requester: 'Priya Sharma', dates: 'Jun 10-15', priority: 'medium' },
    { id: 2, type: 'Budget Request', requester: 'Hardware & Integration Team', amount: '$5,000', priority: 'high' },
    { id: 3, type: 'Resource Request', requester: 'AI/LLM & Perception', item: 'AWS Credits', priority: 'medium' }
  ],
  
  resourceAllocation: {
    budget: { allocated: 250000, spent: 180000, remaining: 70000 },
    equipment: { allocated: 35, used: 28, remaining: 7 },
    cloud: { allocated: 50000, spent: 32000, remaining: 18000 }
  },
  
  departmentMeetings: [
    { title: 'Core Systems Sync', time: '11:00 AM', attendees: 48, recurring: true },
    { title: 'Architecture Review', time: '2:00 PM', attendees: 12, date: 'Jun 7' },
    { title: 'Sprint Retrospective', time: '3:00 PM', attendees: 48, date: 'Jun 14' }
  ]
};