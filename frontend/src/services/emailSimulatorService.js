// src/services/emailSimulatorService.js
class EmailSimulatorService {
  constructor() {
    this.sentEmails = [];
    this.emailLogs = this.loadMockLogs();
  }

  loadMockLogs() {
    return [
      {
        id: 'email_001',
        to: 'ravi.das@spaceborn.com',
        subject: '⚠️ Daily Report Reminder - Ravi Das',
        type: 'daily_report',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'delivered',
        warningId: 'warn_001'
      },
      {
        id: 'email_002',
        to: 'nisha.kumar@spaceborn.com',
        subject: '⚠️ Attendance Warning - Nisha Kumar',
        type: 'attendance',
        sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'delivered',
        warningId: 'warn_002'
      },
      {
        id: 'email_003',
        to: 'priya.sharma@spaceborn.com',
        subject: '⚠️ Meeting Missed: Q2 Sprint Planning - Priya Sharma',
        type: 'meeting',
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'delivered',
        warningId: 'warn_003'
      }
    ];
  }

  // Simulate sending email
  async sendWarningEmail(employee, warningType, warningLevel, reason, customData = {}) {
    return new Promise((resolve) => {
      const emailContent = this.generateEmailContent(employee, warningType, warningLevel, reason, customData);
      
      const emailLog = {
        id: `email_${Date.now()}`,
        to: employee.email,
        subject: emailContent.subject,
        type: warningType,
        content: emailContent.html,
        sentAt: new Date().toISOString(),
        status: 'delivered',
        warningLevel: warningLevel,
      };
      
      this.sentEmails.unshift(emailLog);
      
      // Simulate API delay
      setTimeout(() => {
        resolve(emailLog);
      }, 500);
    });
  }

  // Generate email content based on warning type
  generateEmailContent(employee, type, level, reason, data) {
    const warningLevels = {
      1: { text: 'Soft Reminder', color: '#f39c12', severity: 'low' },
      2: { text: 'Formal Warning', color: '#e67e22', severity: 'medium' },
      3: { text: 'Final Warning', color: '#e74c3c', severity: 'high' },
      4: { text: 'Escalated to Manager', color: '#c0392b', severity: 'critical' }
    };
    
    const levelInfo = warningLevels[level] || warningLevels[1];
    
    const templates = {
      daily_report: {
        subject: `⚠️ Daily Report Reminder - ${employee.name}`,
        html: this.getDailyReportEmail(employee, levelInfo, reason)
      },
      attendance: {
        subject: `⚠️ Attendance Warning - ${employee.name} (${data.rate || '72'}%)`,
        html: this.getAttendanceEmail(employee, levelInfo, reason, data)
      },
      meeting: {
        subject: `⚠️ Meeting Missed: ${data.title || 'Team Meeting'} - ${employee.name}`,
        html: this.getMeetingEmail(employee, levelInfo, reason, data)
      },
      task_overdue: {
        subject: `⚠️ ${data.taskCount || 1} Task(s) Overdue - ${employee.name}`,
        html: this.getTaskOverdueEmail(employee, levelInfo, reason, data)
      },
      performance: {
        subject: `⚠️ Performance Improvement Notice - ${employee.name}`,
        html: this.getPerformanceEmail(employee, levelInfo, reason, data)
      }
    };
    
    return templates[type] || templates.performance;
  }

  getDailyReportEmail(employee, levelInfo, reason) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${levelInfo.color}; color: white; padding: 20px; text-align: center;">
          <h2>⚠️ Daily Report Reminder</h2>
          <p style="margin: 5px 0 0;">${levelInfo.text}</p>
        </div>
        <div style="padding: 20px; background: #fff3e0;">
          <p>Dear <strong>${employee.name}</strong>,</p>
          <p>${reason || 'Your daily work report has not been submitted for the past 2 days.'}</p>
          <div style="background: #fff3cd; border-left: 4px solid ${levelInfo.color}; padding: 15px; margin: 15px 0;">
            <p><strong>📋 Reminder Details:</strong></p>
            <ul>
              <li>Last submitted: ${new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
              <li>Due: Today, 6:00 PM</li>
              <li>Warning Level: ${levelInfo.text}</li>
            </ul>
          </div>
          <p>Please submit your daily report as soon as possible.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000'}/daily-report" style="background: ${levelInfo.color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Submit Report Now
            </a>
          </div>
          ${levelInfo.severity === 'high' ? '<p><strong>⚠️ This is a final warning.</strong> Continued non-compliance will be escalated.</p>' : ''}
        </div>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated notification from SpaceBorn CMS. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} SpaceBorn. All rights reserved.</p>
        </div>
      </div>
    `;
  }

  getAttendanceEmail(employee, levelInfo, reason, data) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${levelInfo.color}; color: white; padding: 20px; text-align: center;">
          <h2>⚠️ Attendance Warning</h2>
          <p style="margin: 5px 0 0;">${levelInfo.text}</p>
        </div>
        <div style="padding: 20px; background: ${levelInfo.severity === 'high' ? '#fdf0ef' : '#fff3e0'};">
          <p>Dear <strong>${employee.name}</strong>,</p>
          <p>${reason || 'Your attendance has fallen below the required threshold.'}</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">📊 Attendance Statistics (Last 30 Days)</h3>
            <table style="width: 100%;">
              <tr><td>Present Days:</td><td><strong>${data.present || 18}</strong></td></tr>
              <tr><td>Absent Days:</td><td><strong>${data.absent || 7}</strong></td></tr>
              <tr><td>Late Arrivals:</td><td><strong>${data.late || 5}</strong></td></tr>
              <tr><td>Attendance Rate:</td><td><strong style="color: ${levelInfo.color};">${data.rate || 72}%</strong></td></tr>
              <tr><td>Target:</td><td><strong>85%</strong></td></tr>
            </table>
          </div>
          ${levelInfo.severity === 'high' ? `
          <div style="background: #f8d7da; border-left: 4px solid #e74c3c; padding: 15px; margin: 15px 0;">
            <p><strong>⚠️ CRITICAL WARNING</strong></p>
            <p>Your attendance has fallen below 70%. Please contact your manager immediately.</p>
          </div>
          ` : ''}
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000'}/attendance" style="background: ${levelInfo.color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Attendance Details
            </a>
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated notification from SpaceBorn CMS. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  getMeetingEmail(employee, levelInfo, reason, data) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${levelInfo.color}; color: white; padding: 20px; text-align: center;">
          <h2>⚠️ Meeting Missed Notification</h2>
          <p style="margin: 5px 0 0;">${levelInfo.text}</p>
        </div>
        <div style="padding: 20px; background: ${levelInfo.severity === 'high' ? '#fdf0ef' : '#fff3e0'};">
          <p>Dear <strong>${employee.name}</strong>,</p>
          <p>${reason || 'You missed a scheduled meeting.'}</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">📅 Meeting Details</h3>
            <table style="width: 100%;">
              <tr><td><strong>Title:</strong></td><td>${data.title || 'Team Sync Meeting'}</td></tr>
              <tr><td><strong>Date:</strong></td><td>${data.date ? new Date(data.date).toLocaleString() : new Date().toLocaleString()}</td></tr>
              <tr><td><strong>Duration:</strong></td><td>${data.duration || '1 hour'}</td></tr>
              <tr><td><strong>Attendees:</strong></td><td>${(data.attendees || ['Team Members']).join(', ')}</td></tr>
            </table>
          </div>
          <p>Please ensure you attend future meetings or provide prior notification if unable to attend.</p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated notification from SpaceBorn CMS. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  getTaskOverdueEmail(employee, levelInfo, reason, data) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${levelInfo.color}; color: white; padding: 20px; text-align: center;">
          <h2>⚠️ Task Overdue Alert</h2>
          <p style="margin: 5px 0 0;">${levelInfo.text}</p>
        </div>
        <div style="padding: 20px; background: ${levelInfo.severity === 'high' ? '#fdf0ef' : '#fff3e0'};">
          <p>Dear <strong>${employee.name}</strong>,</p>
          <p>${reason || 'You have tasks that are past due date.'}</p>
          <div style="background: white; border-radius: 8px; overflow: hidden; margin: 15px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead style="background: #f8f9fa;">
                <tr><th style="padding: 10px; text-align: left;">Task</th><th style="padding: 10px; text-align: left;">Due Date</th><th style="padding: 10px; text-align: left;">Overdue</th></tr>
              </thead>
              <tbody>
                ${(data.tasks || [{ name: 'Complete project documentation', dueDate: '2026-06-05', daysOverdue: 3 }]).map(task => `
                  <tr style="border-top: 1px solid #eee;">
                    <td style="padding: 10px;">${task.name}</td>
                    <td style="padding: 10px;">${new Date(task.dueDate).toLocaleDateString()}</td>
                    <td style="padding: 10px; color: #e74c3c;">${task.daysOverdue} days</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <p>Please prioritize completing these overdue tasks immediately.</p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated notification from SpaceBorn CMS. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  getPerformanceEmail(employee, levelInfo, reason, data) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${levelInfo.color}; color: white; padding: 20px; text-align: center;">
          <h2>⚠️ Performance Improvement Notice</h2>
          <p style="margin: 5px 0 0;">${levelInfo.text}</p>
        </div>
        <div style="padding: 20px; background: ${levelInfo.severity === 'high' ? '#fdf0ef' : '#fff3e0'};">
          <p>Dear <strong>${employee.name}</strong>,</p>
          <p>${reason || 'Your performance metrics have fallen below expectations.'}</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">📊 Performance Metrics</h3>
            <table style="width: 100%;">
              <tr><td>Task Completion Rate:</td><td><strong>${data.completionRate || 45}%</strong> (Target: 85%)</td></tr>
              <tr><td>On-time Delivery:</td><td><strong>${data.onTimeRate || 60}%</strong> (Target: 90%)</td></tr>
              <tr><td>Quality Score:</td><td><strong>${data.qualityScore || 3}/5</strong> (Target: 4/5)</td></tr>
            </table>
          </div>
          ${levelInfo.severity === 'high' ? '<p><strong>⚠️ This is a final warning.</strong> Please take immediate action to improve your performance.</p>' : ''}
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000'}/performance" style="background: ${levelInfo.color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Performance Details
            </a>
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated notification from SpaceBorn CMS. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  // Get email logs
  async getEmailLogs() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.emailLogs, ...this.sentEmails]);
      }, 300);
    });
  }

  // Simulate sending test email
  async sendTestEmail(to) {
    return new Promise((resolve) => {
      const testEmail = {
        id: `test_${Date.now()}`,
        to: to,
        subject: 'Test Email from SpaceBorn CMS',
        sentAt: new Date().toISOString(),
        status: 'delivered',
      };
      this.sentEmails.unshift(testEmail);
      resolve(testEmail);
    });
  }
}

export default new EmailSimulatorService();