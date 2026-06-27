export const ceoData = {
  user: {
    name: 'John Doe',
    role: 'CEO',
    avatar: null,
    email: 'john.doe@spaceborn.com'
  },
  
  companyMetrics: {
    totalMembers: 142,
    departments: 8,
    sprintVelocity: 78,
    activeProjects: 24,
    tasksThisWeek: 78,
    overdueTasks: 1,
    resourceUtilization: 86,
    pendingApprovals: 2,
    revenue: 28400000,
    profit: 5680000
  },
  
  departmentProgress: [
    { name: 'Core Systems', members: 48, progress: 82, color: '#3b82f6' },
    { name: 'Hardware & Integration', members: 12, progress: 65, color: '#8b5cf6' },
    { name: 'AI/LLM & Perception', members: 18, progress: 91, color: '#10b981' },
    { name: 'Platform and DevOps', members: 30, progress: 54, color: '#f59e0b' },
    { name: 'HR', members: 10, progress: 78, color: '#ef4444' }
  ],
  
  atRiskProjects: [
    { name: 'Project Beta — Hardware & Integration', completion: 45, status: 'at-risk', owner: 'Hardware & Integration Team', dueDate: 'Jun 15' },
    { name: 'Project Delta — Ops', completion: 30, status: 'delayed', owner: 'Platform and DevOps', dueDate: 'Jun 20' }
  ],
  
  topPerformers: [
    { name: 'Priya Sharma', role: 'Core Systems', tasks: 28, initials: 'PS', productivity: 94 },
    { name: 'Sita Krishnan', role: 'AI/LLM & Perception', tasks: 31, initials: 'SK', productivity: 96 },
    { name: 'Anil Mehta', role: 'Hardware & Integration', tasks: 22, initials: 'AM', productivity: 88 }
  ],
  
  upcomingMeetings: [
    { date: '5Jun', title: 'Q2 Sprint Planning', dept: 'Core Systems', time: '10:00 AM', location: 'Conference Room A' },
    { date: '6Jun', title: 'Hardware & Integration System Review', dept: 'Hardware & Integration', time: '2:00 PM', location: 'Hardware & Integration Studio' },
    { date: '10Jun', title: 'All-Hands Q2', dept: 'All', time: '9:00 AM', location: 'Main Hall' }
  ],
  
  resourceRequests: [
    { id: 1, item: 'MacBook Pro M3', requester: 'Ravi Das', status: 'pending', priority: 'high', department: 'Core Systems' },
    { id: 2, item: 'AWS Dev Credits', requester: 'Nisha Kumar', status: 'pending', priority: 'medium', department: 'Cloud' },
    { id: 3, item: 'Figma Pro License', requester: 'Pooja B', status: 'approved', priority: 'low', department: 'Hardware & Integration' }
  ],
  
  actionItems: [
    { id: 1, title: 'Review Beta project risk plan', priority: 'High', due: 'Today', category: 'Risk Management' },
    { id: 2, title: 'Approve resource requests (2)', priority: 'High', due: 'Today', category: 'Approvals' },
    { id: 3, title: 'Sign off on Q2 sprint goals', priority: 'Medium', due: 'Jun 5', category: 'Planning' },
    { id: 4, title: 'Performance review — Ravi Das', priority: 'Medium', due: 'Jun 7', category: 'HR' },
    { id: 5, title: 'Confirm all-hands agenda', priority: 'Low', due: 'Jun 9', category: 'Communication' }
  ],
  
  recentActivity: [
    { action: 'Priya Sharma completed Alpha milestone', time: '2h ago', type: 'milestone' },
    { action: 'Beta project marked at risk', time: '6h ago', type: 'alert' },
    { action: 'New member joined Core Systems team', time: '4h ago', type: 'onboarding' },
    { action: 'Resource conflict resolved by Manager', time: '1d ago', type: 'resolution' },
    { action: 'Hardware & Integration sprint review completed', time: '8h ago', type: 'review' },
    { action: 'AI/LLM & Perception campaign exceeded targets', time: '1d ago', type: 'achievement' }
  ]
};