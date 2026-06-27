export const permissions = {
  CEO: {
    level: 5,
    name: 'Chief Executive Officer',
    access: [
      'view_all_departments',
      'view_company_metrics',
      'view_financials',
      'approve_strategic_initiatives',
      'view_all_projects',
      'view_all_teams',
      'view_all_members',
      'approve_budget',
      'view_risks',
      'make_executive_decisions'
    ],
    restrictedFrom: []
  },
  
  Manager: {
    level: 4,
    name: 'Department Manager',
    access: [
      'view_own_department',
      'view_team_metrics',
      'manage_resources',
      'approve_requests',
      'view_department_projects',
      'manage_team_members',
      'conduct_reviews',
      'view_budgets',
      'approve_leave',
      'allocate_resources'
    ],
    restrictedFrom: [
      'view_financials',
      'approve_strategic_initiatives',
      'view_all_company_metrics'
    ]
  },
  
  TeamLead: {
    level: 3,
    name: 'Team Lead',
    access: [
      'view_own_team',
      'view_sprint_progress',
      'assign_tasks',
      'view_team_performance',
      'conduct_standup',
      'review_code',
      'manage_sprint',
      'view_team_capacity',
      'track_issues'
    ],
    restrictedFrom: [
      'view_financials',
      'approve_requests',
      'manage_resources',
      'view_budgets',
      'view_all_departments'
    ]
  },
  
  Maintainer: {
    level: 2,
    name: 'System Maintainer',
    access: [
      'view_system_health',
      'monitor_services',
      'deploy_updates',
      'view_logs',
      'manage_incidents',
      'view_server_metrics',
      'manage_alerts',
      'perform_maintenance'
    ],
    restrictedFrom: [
      'view_team_data',
      'view_financials',
      'manage_people',
      'view_projects',
      'approve_anything'
    ]
  }
};