// src/components/Dashboard/CEO/AutomationDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, FileText, TrendingUp, Mail, Bell, 
  RefreshCw, CheckCircle, AlertCircle, Send, Users,
  BarChart3, Activity, Zap, Settings, Play, Pause,
  AlertTriangle, Shield, Eye, Download, Trash2, Plus
} from 'lucide-react';
import automationService from '../../../services/automationService';
import employeeService from '../../../services/employeeService';
import warningSimulatorService from '../../../services/warningSimulatorService';
import emailSimulatorService from '../../../services/emailSimulatorService';
import EmailPreviewModal from '../../Common/EmailPreviewModal';
import WarningMonitor from './WarningMonitor';

const AutomationDashboard = ({ user, userRole }) => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [attendanceData, setAttendanceData] = useState([]);
  const [reports, setReports] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [warningStats, setWarningStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailSettings, setEmailSettings] = useState({
    taskAssigned: true,
    taskCompleted: true,
    leaveApproved: true,
    weeklyReport: true,
    monthlyEvaluation: true,
    attendanceSummary: true,
    performanceAlerts: true,
    warningNotifications: true
  });

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      if (autoSyncEnabled) {
        fetchAllData();
      }
    }, 300000); // Auto sync every 5 minutes
    return () => clearInterval(interval);
  }, [selectedPeriod, autoSyncEnabled]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchAttendanceData(),
        fetchReports(),
        fetchPerformanceData(),
        fetchNotifications(),
        fetchReminders(),
        fetchWarnings()
      ]);
    } catch (error) {
      console.error('Error fetching automation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const employees = await employeeService.getAllEmployees();
      const attendancePromises = employees.map(async (emp) => {
        const summary = await automationService.getAttendanceSummary(emp.id, new Date().getMonth() + 1, new Date().getFullYear());
        return {
          id: emp.id,
          name: emp.name,
          department: emp.department,
          present: summary?.present || 0,
          absent: summary?.absent || 0,
          late: summary?.late || 0,
          percentage: summary?.percentage || 0
        };
      });
      const attendance = await Promise.all(attendancePromises);
      setAttendanceData(attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const weeklyReports = await automationService.getAutoReports(user?.id, 'weekly', selectedPeriod);
      setReports(weeklyReports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const performance = await automationService.calculatePerformance(user?.id, selectedPeriod);
      setPerformanceData(performance);
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const emailLogs = await emailSimulatorService.getEmailLogs();
      setNotifications(emailLogs.slice(0, 10));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchReminders = async () => {
    try {
      const remindersList = await automationService.getUserReminders(user?.id);
      setReminders(remindersList || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const fetchWarnings = async () => {
    try {
      const warningsData = await warningSimulatorService.getPendingWarnings();
      const statsData = await warningSimulatorService.getWarningStats();
      setWarnings(warningsData);
      setWarningStats(statsData);
    } catch (error) {
      console.error('Error fetching warnings:', error);
    }
  };

  const runManualSync = async () => {
    setIsLoading(true);
    try {
      await automationService.syncAllData();
      await fetchAllData();
      alert('Manual sync completed successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async () => {
    try {
      await emailSimulatorService.sendTestEmail(user?.email);
      alert('Test email sent successfully!');
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send test email.');
    }
  };

  const handlePreviewEmail = (email) => {
    setSelectedEmail(email);
    setShowEmailPreview(true);
  };

  const updateEmailSetting = (setting) => {
    setEmailSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const runAutoScan = async () => {
    try {
      const issues = await warningSimulatorService.runAutomatedCheck();
      for (const issue of issues) {
        await warningSimulatorService.sendWarning(
          issue.employeeId,
          issue.type,
          issue.reason,
          issue.suggestedLevel
        );
      }
      await fetchWarnings();
      alert(`Auto-scan completed! ${issues.length} warning(s) sent.`);
    } catch (error) {
      console.error('Auto-scan failed:', error);
      alert('Auto-scan failed. Please try again.');
    }
  };

  const getWarningLevelBadge = (level) => {
    const levels = {
      1: { text: 'Soft Reminder', class: 'bg-blue-100 text-blue-700' },
      2: { text: 'Formal Warning', class: 'bg-yellow-100 text-yellow-700' },
      3: { text: 'Final Warning', class: 'bg-orange-100 text-orange-700' },
      4: { text: 'Escalated', class: 'bg-red-100 text-red-700' },
    };
    return levels[level] || levels[1];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">System Automation Core</h1>
            <p className="text-purple-100 mt-1">Auto attendance tracking, report generation, warnings, and notifications</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={runAutoScan}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> Auto-Scan Warnings
            </button>
            <button 
              onClick={runManualSync}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Sync Now
            </button>
            <button 
              onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${autoSyncEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
            >
              {autoSyncEnabled ? <CheckCircle className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {autoSyncEnabled ? 'Auto Sync ON' : 'Auto Sync OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-500"><Clock className="w-4 h-4" /><span className="text-sm">Auto Attendance</span></div>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Live</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{attendanceData.length} Tracked</div>
          <div className="text-xs text-gray-500 mt-1">Today: {attendanceData.filter(a => a.present > 0).length} present</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2"><FileText className="w-4 h-4" /><span className="text-sm">Auto Reports</span></div>
          <div className="text-2xl font-bold text-gray-900">{reports.length} Generated</div>
          <div className="text-xs text-blue-600 mt-1">This {selectedPeriod}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2"><AlertTriangle className="w-4 h-4" /><span className="text-sm">Active Warnings</span></div>
          <div className="text-2xl font-bold text-orange-600">{warningStats.activeWarnings || 0}</div>
          <div className="text-xs text-red-600 mt-1">{warningStats.level3Warnings || 0} final warnings</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-gray-500 mb-2"><Mail className="w-4 h-4" /><span className="text-sm">Emails Sent</span></div>
          <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
          <div className="text-xs text-purple-600 mt-1">Auto notifications</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl">
        <div className="flex flex-wrap gap-2 px-4">
          {[
            { id: 'attendance', label: 'Attendance Tracking', icon: Clock },
            { id: 'reports', label: 'Auto Reports', icon: FileText },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'warnings', label: 'Warning Monitor', icon: AlertTriangle, badge: warningStats.activeWarnings },
            { id: 'notifications', label: 'Email & Notifications', icon: Mail },
            { id: 'reminders', label: 'Reminders', icon: Bell }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Tracking Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
            <h3 className="font-semibold text-gray-900">Auto Attendance Tracking</h3>
            <p className="text-sm text-gray-500">Automatically tracked attendance for this month</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceData.map((emp, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{emp.name}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.department}</td>
                    <td className="px-6 py-4 text-green-600 font-medium">{emp.present}</td>
                    <td className="px-6 py-4 text-red-600">{emp.absent}</td>
                    <td className="px-6 py-4 text-orange-600">{emp.late}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        emp.percentage >= 90 ? 'bg-green-100 text-green-700' : 
                        emp.percentage >= 75 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {emp.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Auto Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Auto Generated Reports</h3>
              <p className="text-sm text-gray-500">Weekly and monthly reports automatically generated</p>
            </div>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)} 
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
          <div className="divide-y divide-gray-200">
            {reports.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-500">No reports generated yet</p>
                <p className="text-sm text-gray-400">Reports will appear here once generated</p>
              </div>
            ) : (
              reports.map((report, i) => (
                <div key={i} className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-500">{report.date} • {report.type}</p>
                  </div>
                  <button className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t">
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Generate Manual Report
            </button>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Performance Metrics
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Productivity', value: performanceData?.productivity || 78, color: 'bg-blue-600' },
                { label: 'Task Completion', value: performanceData?.taskCompletion || 82, color: 'bg-green-600' },
                { label: 'Quality Score', value: performanceData?.quality || 85, color: 'bg-purple-600' },
                { label: 'Efficiency', value: performanceData?.efficiency || 76, color: 'bg-orange-600' }
              ].map(metric => (
                <div key={metric.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{metric.label}</span>
                    <span className="font-semibold text-gray-900">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${metric.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${metric.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Performance Alerts
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Low productivity alert</p>
                  <p className="text-xs text-gray-500">2 employees below target this week</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">High performer recognition</p>
                  <p className="text-xs text-gray-500">Priya Sharma exceeded targets by 25%</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Missed deadlines</p>
                  <p className="text-xs text-gray-500">3 tasks overdue across the team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Monitor Tab */}
      {activeTab === 'warnings' && (
        <WarningMonitor userRole={userRole} />
      )}

      {/* Email & Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Email Settings
              </h3>
              <button 
                onClick={sendTestEmail} 
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Send className="w-3 h-3" /> Test Email
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(emailSettings).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <button 
                    onClick={() => updateEmailSetting(key)} 
                    className={`w-10 h-5 rounded-full transition-colors ${value ? 'bg-purple-600' : 'bg-gray-300'} relative`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`}></span>
                  </button>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b bg-gradient-to-r from-gray-50 to-white">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-600" />
                Recent Email Logs
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-2">📧</div>
                  <p className="text-gray-500">No email logs yet</p>
                  <p className="text-sm text-gray-400">Emails will appear here once sent</p>
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notif.subject || `Warning Email`}</p>
                      <p className="text-xs text-gray-500">To: {notif.to} • {new Date(notif.sentAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        notif.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {notif.status || 'Sent'}
                      </span>
                      <button 
                        onClick={() => handlePreviewEmail(notif)}
                        className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reminders Tab */}
      {activeTab === 'reminders' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b bg-gradient-to-r from-gray-50 to-white flex justify-between items-center flex-wrap gap-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-600" />
              Auto Reminders
            </h3>
            <button className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Reminder
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">Task Deadline Reminder</p>
                  <p className="text-sm text-gray-500">Sent to 3 employees with pending tasks</p>
                  <p className="text-xs text-gray-400 mt-1">Schedule: Daily at 9:00 AM</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                  <span className="text-xs text-gray-500">Sent 2h ago</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">Weekly Report Reminder</p>
                  <p className="text-sm text-gray-500">Reminder to submit weekly reports</p>
                  <p className="text-xs text-gray-400 mt-1">Schedule: Every Friday at 4:00 PM</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                  <span className="text-xs text-gray-500">Sent yesterday</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">Attendance Reminder</p>
                  <p className="text-sm text-gray-500">Reminder to mark attendance</p>
                  <p className="text-xs text-gray-400 mt-1">Schedule: Daily at 10:00 AM</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                  <span className="text-xs text-gray-500">Sent today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      <EmailPreviewModal 
        email={selectedEmail} 
        onClose={() => setShowEmailPreview(false)} 
      />
    </div>
  );
};

export default AutomationDashboard;