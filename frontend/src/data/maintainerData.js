export const maintainerData = {
  user: {
    name: 'John Doe',
    role: 'Maintainer',
    permissions: 'System Access'
  },
  
  systemHealth: {
    overall: 96,
    uptime: 99.95,
    responseTime: 124,
    errorRate: 0.32,
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 68
  },
  
  services: [
    { name: 'API Gateway', status: 'operational', uptime: 99.99, latency: 45 },
    { name: 'Database', status: 'operational', uptime: 99.95, latency: 12 },
    { name: 'Cache', status: 'degraded', uptime: 99.80, latency: 8 },
    { name: 'Message Queue', status: 'operational', uptime: 99.98, latency: 23 }
  ],
  
  serverMetrics: [
    { name: 'app-server-1', cpu: 52, memory: 68, disk: 45, status: 'healthy' },
    { name: 'app-server-2', cpu: 48, memory: 64, disk: 42, status: 'healthy' },
    { name: 'db-server-1', cpu: 78, memory: 82, disk: 72, status: 'warning' }
  ],
  
  incidents: [
    { id: 1, title: 'High CPU on main DB', severity: 'medium', status: 'resolved', time: '2h ago' },
    { id: 2, title: 'API timeout spikes', severity: 'high', status: 'investigating', time: '30min ago' }
  ],
  
  deployments: [
    { version: 'v2.4.0', environment: 'production', status: 'success', time: '2024-06-05 14:30' },
    { version: 'v2.3.9', environment: 'staging', status: 'pending', time: '2024-06-06 10:00' }
  ],
  
  alerts: [
    { metric: 'CPU > 80%', threshold: '5min', current: '45%', status: 'ok' },
    { metric: 'Memory > 85%', threshold: '5min', current: '62%', status: 'ok' },
    { metric: 'Error Rate > 1%', threshold: '1min', current: '0.32%', status: 'ok' }
  ],
  
  maintenanceTasks: [
    { task: 'Database backup', schedule: 'Daily 2AM', lastRun: '6h ago', status: 'success' },
    { task: 'Security patches', schedule: 'Weekly', lastRun: '2d ago', status: 'pending' }
  ]
};