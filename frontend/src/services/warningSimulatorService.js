// src/services/warningSimulatorService.js
class WarningSimulatorService {
  constructor() {
    // Mock warning data
    this.warnings = this.loadMockWarnings();
    this.warningHistory = this.loadMockHistory();
  }

  loadMockWarnings() {
    return [
      {
        id: 'warn_001',
        employeeId: 'EMP001',
        employeeName: 'Ravi Das',
        department: 'Core Systems',
        role: 'Frontend Developer',
        type: 'daily_report',
        level: 2,
        reason: 'Missed daily report submission for 3 consecutive days',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        emailSent: true,
        emailSentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: null,
        notes: 'Has been reminded multiple times'
      },
      {
        id: 'warn_002',
        employeeId: 'EMP002',
        employeeName: 'Nisha Kumar',
        department: 'Core Systems',
        role: 'Backend Developer',
        type: 'attendance',
        level: 1,
        reason: 'Attendance rate dropped to 72% in last 30 days',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        emailSent: true,
        emailSentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: null,
        notes: ''
      },
      {
        id: 'warn_003',
        employeeId: 'EMP003',
        employeeName: 'Priya Sharma',
        department: 'Core Systems',
        role: 'Core Systems Lead',
        type: 'meeting',
        level: 1,
        reason: 'Missed Q2 Sprint Planning meeting without prior notice',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        emailSent: true,
        emailSentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: null,
        notes: ''
      },
      {
        id: 'warn_004',
        employeeId: 'EMP004',
        employeeName: 'Pooja B',
        department: 'Hardware & Integration',
        role: 'UI Designer',
        type: 'task_overdue',
        level: 2,
        reason: '3 tasks overdue by more than 5 days',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'resolved',
        emailSent: true,
        emailSentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Tasks completed after warning'
      },
      {
        id: 'warn_005',
        employeeId: 'EMP005',
        employeeName: 'Anil Mehta',
        department: 'Hardware & Integration',
        role: 'Hardware & Integration Lead',
        type: 'performance',
        level: 3,
        reason: 'Low productivity - 45% task completion rate this sprint',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        emailSent: true,
        emailSentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: null,
        notes: 'Final warning issued'
      }
    ];
  }

  loadMockHistory() {
    return [
      { id: 'hist_001', employeeId: 'EMP001', type: 'daily_report', level: 1, date: '2026-06-01', resolved: true },
      { id: 'hist_002', employeeId: 'EMP002', type: 'attendance', level: 1, date: '2026-05-15', resolved: true },
      { id: 'hist_003', employeeId: 'EMP004', type: 'task_overdue', level: 1, date: '2026-05-20', resolved: true },
    ];
  }

  // Get all active warnings
  async getPendingWarnings() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.warnings.filter(w => w.status === 'active'));
      }, 500);
    });
  }

  // Get warnings for specific employee
  async getEmployeeWarnings(employeeId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.warnings.filter(w => w.employeeId === employeeId));
      }, 300);
    });
  }

  // Get warning statistics
  async getWarningStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const active = this.warnings.filter(w => w.status === 'active');
        const resolved = this.warnings.filter(w => w.status === 'resolved');
        
        resolve({
          totalWarnings: this.warnings.length,
          activeWarnings: active.length,
          resolvedWarnings: resolved.length,
          level3Warnings: active.filter(w => w.level >= 3).length,
          escalatedWarnings: active.filter(w => w.level >= 4).length,
          byType: {
            daily_report: this.warnings.filter(w => w.type === 'daily_report').length,
            attendance: this.warnings.filter(w => w.type === 'attendance').length,
            meeting: this.warnings.filter(w => w.type === 'meeting').length,
            task_overdue: this.warnings.filter(w => w.type === 'task_overdue').length,
            performance: this.warnings.filter(w => w.type === 'performance').length,
          },
          byDepartment: {
            'Core Systems': this.warnings.filter(w => w.department === 'Core Systems').length,
            'Hardware & Integration': this.warnings.filter(w => w.department === 'Hardware & Integration').length,
            'Robotics & Simulation': this.warnings.filter(w => w.department === 'Robotics & Simulation').length,
          }
        });
      }, 300);
    });
  }

  // Send warning (simulate email)
  async sendWarning(employeeId, type, reason, level) {
    return new Promise((resolve) => {
      const employee = this.getEmployeeById(employeeId);
      const newWarning = {
        id: `warn_${Date.now()}`,
        employeeId,
        employeeName: employee.name,
        department: employee.department,
        role: employee.role,
        type,
        level,
        reason,
        createdAt: new Date().toISOString(),
        status: 'active',
        emailSent: true,
        emailSentAt: new Date().toISOString(),
        resolvedAt: null,
        notes: ''
      };
      
      this.warnings.unshift(newWarning);
      resolve(newWarning);
    });
  }

  // Dismiss warning
  async dismissWarning(warningId, comments) {
    return new Promise((resolve) => {
      const warning = this.warnings.find(w => w.id === warningId);
      if (warning) {
        warning.status = 'resolved';
        warning.resolvedAt = new Date().toISOString();
        warning.resolutionNotes = comments;
      }
      resolve(true);
    });
  }

  // Simulate checking for issues (runs automatically)
  async runAutomatedCheck() {
    const issues = [];
    
    // Check for missed reports
    const missedReportEmployees = ['EMP001', 'EMP006'];
    for (const empId of missedReportEmployees) {
      issues.push({
        employeeId: empId,
        type: 'daily_report',
        reason: 'No daily report submitted for last 2 days',
        suggestedLevel: 1
      });
    }
    
    // Check for attendance issues
    const attendanceIssues = ['EMP002'];
    for (const empId of attendanceIssues) {
      issues.push({
        employeeId: empId,
        type: 'attendance',
        reason: 'Attendance rate dropped to 68% in last 30 days',
        suggestedLevel: 2
      });
    }
    
    return issues;
  }

  getEmployeeById(id) {
    const employees = {
      'EMP001': { name: 'Ravi Das', department: 'Core Systems', role: 'Frontend Developer', email: 'ravi.das@spaceborn.com' },
      'EMP002': { name: 'Nisha Kumar', department: 'Core Systems', role: 'Backend Developer', email: 'nisha.kumar@spaceborn.com' },
      'EMP003': { name: 'Priya Sharma', department: 'Core Systems', role: 'Core Systems Lead', email: 'priya.sharma@spaceborn.com' },
      'EMP004': { name: 'Pooja B', department: 'Hardware & Integration', role: 'UI Designer', email: 'pooja.b@spaceborn.com' },
      'EMP005': { name: 'Anil Mehta', department: 'Hardware & Integration', role: 'Hardware & Integration Lead', email: 'anil.mehta@spaceborn.com' },
    };
    return employees[id] || { name: 'Unknown', department: 'Unknown', role: 'Unknown', email: 'unknown@spaceborn.com' };
  }
}

export default new WarningSimulatorService();
