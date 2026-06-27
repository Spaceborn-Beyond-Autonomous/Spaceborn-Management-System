// src/components/Dashboard/Manager/AutomationDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, FileText, TrendingUp, Mail, Bell, 
  RefreshCw, CheckCircle, AlertCircle, Send, Users,
  BarChart3, Activity, Zap, Settings, Play, Pause,
  Download, Eye, Trash2, AlertTriangle, Shield, Plus
} from 'lucide-react';
import authService from '../../../services/authService';
import employeeService from '../../../services/employeeService';
import warningSimulatorService from '../../../services/warningSimulatorService';
import emailSimulatorService from '../../../services/emailSimulatorService';
import EmailPreviewModal from '../../Common/EmailPreviewModal';
import * as XLSX from 'xlsx';

const AutomationDashboard = ({ user, userRole = 'Manager' }) => {
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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generatingReport, setGeneratingReport] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    name: '',
    reportType: 'executive',
    frequency: 'weekly',
    dayOfWeek: 'monday',
    time: '09:00',
    recipients: [],
    departments: [],
    format: 'html',
    active: true,
  });
  const [recipientInput, setRecipientInput] = useState('');
  const [schedules, setSchedules] = useState([]);
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

  const currentUser = authService.getCurrentUser();
  const managerDepartment = 'All Departments';

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      if (autoSyncEnabled) {
        fetchAllData();
      }
    }, 300000);
    return () => clearInterval(interval);
  }, [selectedPeriod, selectedMonth, selectedYear, autoSyncEnabled]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchAttendanceData(),
        fetchReports(),
        fetchPerformanceData(),
        fetchNotifications(),
        fetchReminders(),
        fetchWarnings(),
        fetchSchedules()
      ]);
    } catch (error) {
      console.error('Error fetching automation data:', error);
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWarnings = async () => {
    try {
      const warningsData = await warningSimulatorService.getPendingWarnings();
      const statsData = await warningSimulatorService.getWarningStats();
      setWarnings(warningsData);
      setWarningStats({
        ...statsData,
        activeWarnings: warningsData.length,
        totalWarnings: warningsData.length
      });
    } catch (error) {
      console.error('Error fetching warnings:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const schedulesData = await emailSimulatorService.getScheduledReports?.() || [];
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    }
  };

  const loadMockData = () => {
    // Mock attendance data across departments
    const mockAttendance = [
      { name: 'Mike Johnson', department: 'Core Systems', present: 18, absent: 2, late: 1, percentage: 85 },
      { name: 'Ravi Das', department: 'Core Systems', present: 20, absent: 0, late: 0, percentage: 100 },
      { name: 'Priya Sharma', department: 'Platform and DevOps', present: 17, absent: 2, late: 1, percentage: 80 },
      { name: 'Nisha Kumar', department: 'Hardware & Integration', present: 19, absent: 0, late: 1, percentage: 95 },
      { name: 'Suresh M', department: 'Robotics & Simulation', present: 16, absent: 3, late: 1, percentage: 75 },
      { name: 'Alex Chen', department: 'AI/LLM & Perception', present: 18, absent: 1, late: 1, percentage: 90 }
    ];
    setAttendanceData(mockAttendance);

    // Mock reports
    const mockReports = [
      { id: 1, title: `Weekly Report - ${managerDepartment} Team`, date: '2026-06-10', type: 'weekly', generatedBy: 'Auto System', status: 'sent' },
      { id: 2, title: `Attendance Summary - ${managerDepartment}`, date: '2026-06-09', type: 'attendance', generatedBy: 'Auto System', status: 'sent' },
      { id: 3, title: `Performance Review - ${managerDepartment}`, date: '2026-06-01', type: 'monthly', generatedBy: 'Auto System', status: 'sent' },
    ];
    setReports(mockReports);

    // Mock performance data
    setPerformanceData({
      productivity: 82,
      taskCompletion: 78,
      quality: 88,
      efficiency: 75,
      averageScore: 81,
      teamMembers: 6,
      topPerformer: 'Ravi Das',
      needsImprovement: 'Suresh M'
    });

    // Mock notifications
    setNotifications([
      { id: 1, subject: 'Weekly Report Generated', to: currentUser?.email, time: '5 min ago', status: 'sent' },
      { id: 2, subject: 'Team Performance Summary', to: currentUser?.email, time: '1 hour ago', status: 'sent' },
      { id: 3, subject: 'Attendance Alert', to: currentUser?.email, time: '2 hours ago', status: 'sent' }
    ]);

    // Mock reminders
    setReminders([
      { id: 1, title: 'Submit Weekly Report', type: 'report', dueDate: '2026-06-14', status: 'pending', assignedTo: 'Team Members' },
      { id: 2, title: 'Team Meeting at 3 PM', type: 'meeting', dueDate: '2026-06-12', status: 'pending', assignedTo: 'Core Systems Team' }
    ]);

    // Mock warnings for department
    setWarnings([
      {
        id: 'warn_001',
        employeeId: 'EMP001',
        employeeName: 'Suresh M',
        department: managerDepartment,
        role: 'Developer',
        type: 'attendance',
        level: 2,
        reason: 'Attendance rate dropped to 75% in last 30 days',
        createdAt: new Date().toISOString(),
        status: 'active',
        emailSent: true
      }
    ]);
    setWarningStats({ 
      totalWarnings: 1, 
      activeWarnings: 1, 
      resolvedWarnings: 0,
      level3Warnings: 0,
      escalatedWarnings: 0 
    });
  };

  const fetchAttendanceData = async () => {
    try {
      const employees = await employeeService.getAllEmployees();
      const teamEmployees = employees.filter(emp => emp.department === managerDepartment);
      const attendance = teamEmployees.map(emp => ({
        name: emp.name,
        department: emp.department,
        present: Math.floor(Math.random() * (22 - 15) + 15),
        absent: Math.floor(Math.random() * 5),
        late: Math.floor(Math.random() * 4),
        percentage: Math.floor(Math.random() * (100 - 70) + 70)
      }));
      setAttendanceData(attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      loadMockData();
    }
  };

  const fetchReports = async () => {
    try {
      const reportsData = await fetchReportsFromAPI();
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const performance = {
        productivity: Math.floor(Math.random() * (90 - 70) + 70),
        taskCompletion: Math.floor(Math.random() * (95 - 65) + 65),
        quality: Math.floor(Math.random() * (95 - 75) + 75),
        efficiency: Math.floor(Math.random() * (85 - 65) + 65),
        averageScore: Math.floor(Math.random() * (90 - 70) + 70),
        teamMembers: attendanceData.length,
        topPerformer: attendanceData[0]?.name || 'Team Member',
        needsImprovement: attendanceData[attendanceData.length - 1]?.name || 'Team Member'
      };
      setPerformanceData(performance);
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const emailLogs = await emailSimulatorService.getEmailLogs();
      const filteredLogs = emailLogs.slice(0, 10);
      setNotifications(filteredLogs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchReminders = async () => {
    try {
      const remindersData = [
        { id: 1, title: 'Submit Weekly Report', type: 'report', dueDate: '2026-06-14', status: 'pending' },
        { id: 2, title: 'Review Team Performance', type: 'review', dueDate: '2026-06-15', status: 'pending' }
      ];
      setReminders(remindersData);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const fetchReportsFromAPI = () => {
    return Promise.resolve([
      { id: 1, title: `Weekly Report - ${managerDepartment} Team`, date: new Date().toISOString().split('T')[0], type: 'weekly', generatedBy: 'Auto System', status: 'sent' }
    ]);
  };

  const handleAddRecipient = () => {
    if (recipientInput && !scheduleConfig.recipients.includes(recipientInput)) {
      setScheduleConfig({
        ...scheduleConfig,
        recipients: [...scheduleConfig.recipients, recipientInput],
      });
      setRecipientInput('');
    }
  };

  const handleRemoveRecipient = (email) => {
    setScheduleConfig({
      ...scheduleConfig,
      recipients: scheduleConfig.recipients.filter(r => r !== email),
    });
  };

  const handleScheduleReport = async () => {
    if (scheduleConfig.recipients.length === 0) {
      alert('Please add at least one recipient');
      return;
    }

    try {
      const newSchedule = {
        id: Date.now(),
        ...scheduleConfig,
        recipients: scheduleConfig.recipients,
        createdAt: new Date().toISOString(),
      };
      setSchedules([newSchedule, ...schedules]);
      setShowScheduleForm(false);
      setScheduleConfig({
        name: '',
        reportType: 'executive',
        frequency: 'weekly',
        dayOfWeek: 'monday',
        time: '09:00',
        recipients: [],
        departments: [],
        format: 'html',
        active: true,
      });
      alert('Report scheduled successfully!');
    } catch (error) {
      alert('Failed to schedule report');
    }
  };

  const handleDeleteSchedule = (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this scheduled report?')) {
      setSchedules(schedules.filter(s => s.id !== scheduleId));
      alert('Schedule deleted successfully');
    }
  };

  const generateMonthlyReport = async () => {
    setGeneratingReport(true);
    try {
      const totalEmployees = attendanceData.length;
      const avgAttendance = attendanceData.reduce((sum, emp) => sum + emp.percentage, 0) / totalEmployees;
      const topPerformer = attendanceData.reduce((best, emp) => emp.percentage > (best?.percentage || 0) ? emp : best, null);
      
      const reportData = {
        department: managerDepartment,
        month: new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' }),
        year: selectedYear,
        totalEmployees,
        avgAttendance: avgAttendance.toFixed(1),
        topPerformer: topPerformer?.name,
        attendanceDetails: attendanceData,
        generatedAt: new Date().toISOString()
      };

      const ws = XLSX.utils.json_to_sheet(attendanceData.map(emp => ({
        'Employee Name': emp.name,
        'Present Days': emp.present,
        'Absent Days': emp.absent,
        'Late Days': emp.late,
        'Attendance %': `${emp.percentage}%`
      })));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `${managerDepartment} Attendance`);

      const summaryData = [{
        'Department': managerDepartment,
        'Month': reportData.month,
        'Year': reportData.year,
        'Total Employees': reportData.totalEmployees,
        'Average Attendance': `${reportData.avgAttendance}%`,
        'Top Performer': reportData.topPerformer,
        'Generated On': new Date().toLocaleString()
      }];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      const fileName = `${managerDepartment}_Attendance_Report_${reportData.month}_${reportData.year}.xlsx`;
      XLSX.writeFile(wb, fileName);

      const newReport = {
        id: reports.length + 1,
        title: `${reportData.month} ${reportData.year} - ${managerDepartment} Attendance Report`,
        date: new Date().toISOString().split('T')[0],
        type: 'monthly',
        generatedBy: currentUser?.name || 'Auto System',
        status: 'generated'
      };
      setReports([newReport, ...reports]);
      
      alert(`Monthly report generated successfully!`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const sendEmailReport = async () => {
    setSendingEmail(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newNotification = { 
        id: notifications.length + 1, 
        subject: `Weekly Report - ${managerDepartment} Team`,
        to: currentUser?.email,
        time: 'Just now', 
        status: 'sent',
        content: '<div>Weekly report content</div>'
      };
      setNotifications([newNotification, ...notifications]);

      alert(`Report sent to ${currentUser?.email} successfully!`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please check your email settings.');
    } finally {
      setSendingEmail(false);
    }
  };

  const runAutoScan = async () => {
    try {
      const issues = await warningSimulatorService.runAutomatedCheck();
      const deptIssues = issues.filter(i => {
        const emp = warningSimulatorService.getEmployeeById(i.employeeId);
        return emp?.department === managerDepartment;
      });
      
      for (const issue of deptIssues) {
        await warningSimulatorService.sendWarning(
          issue.employeeId,
          issue.type,
          issue.reason,
          issue.suggestedLevel
        );
      }
      await fetchWarnings();
      alert(`Auto-scan completed! ${deptIssues.length} warning(s) sent to your team.`);
    } catch (error) {
      console.error('Auto-scan failed:', error);
      alert('Auto-scan failed. Please try again.');
    }
  };

  const handlePreviewEmail = (email) => {
    setSelectedEmail(email);
    setShowEmailPreview(true);
  };

  const runManualSync = async () => {
    setIsLoading(true);
    try {
      await fetchAllData();
      alert('Data sync completed successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmailSetting = (setting) => {
    setEmailSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const exportAttendanceToExcel = () => {
    const exportData = attendanceData.map(emp => ({
      'Employee Name': emp.name,
      'Department': emp.department,
      'Present Days': emp.present,
      'Absent Days': emp.absent,
      'Late Days': emp.late,
      'Attendance Percentage': `${emp.percentage}%`
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${managerDepartment} Attendance`);
    
    const fileName = `${managerDepartment}_attendance_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const getWarningTypeIcon = (type) => {
    const icons = {
      daily_report: '📋',
      attendance: '⏰',
      meeting: '📅',
      task_overdue: '⏳',
      performance: '📊',
    };
    return icons[type] || '⚠️';
  };

  const getWarningTypeLabel = (type) => {
    const labels = {
      daily_report: 'Daily Report',
      attendance: 'Attendance',
      meeting: 'Meeting Missed',
      task_overdue: 'Task Overdue',
      performance: 'Performance',
    };
    return labels[type] || type;
  };

  const getWarningLevelBadge = (level) => {
    const levels = {
      1: { text: 'Soft Reminder', class: 'bg-blue-100 text-blue-700 border-blue-200' },
      2: { text: 'Formal Warning', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      3: { text: 'Final Warning', class: 'bg-orange-100 text-orange-700 border-orange-200' },
      4: { text: 'Escalated', class: 'bg-red-100 text-red-700 border-red-200' },
    };
    return levels[level] || levels[1];
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      executive: 'Executive Summary',
      team: 'Team Report',
      sprint: 'Sprint Report',
      personal: 'Personal Report',
    };
    return labels[type] || type;
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    };
    return labels[frequency] || frequency;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading automation data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {showEmailPreview && (
        <EmailPreviewModal 
          email={selectedEmail} 
          onClose={() => setShowEmailPreview(false)} 
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Team Automation Dashboard</h1>
            <p className="text-purple-100 mt-1">Auto attendance tracking, report generation, warnings, and notifications</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={runAutoScan}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> Auto-Scan
            </button>
            <button 
              onClick={runManualSync}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Sync Now
            </button>
            <button 
              onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${autoSyncEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
            >
              {autoSyncEnabled ? <CheckCircle className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {autoSyncEnabled ? 'Auto Sync ON' : 'Auto Sync OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceData.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Auto Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Team Performance</p>
              <p className="text-2xl font-bold text-purple-600">{performanceData?.averageScore || 0}%</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Warnings</p>
              <p className="text-2xl font-bold text-orange-600">{warningStats.activeWarnings || 0}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-pink-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Reminders</p>
              <p className="text-2xl font-bold text-gray-900">{reminders.length}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="border-b">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Attendance Tracking</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Auto Reports</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'performance'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Performance</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('warnings')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'warnings'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Warning Monitor</span>
                {warningStats.activeWarnings > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {warningStats.activeWarnings}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'schedules'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Scheduled Reports</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email Settings</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'reminders'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Reminders</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Tracking Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">📊 Team Attendance Tracking</h2>
            <p className="text-purple-100 text-sm mt-1">Automatically tracked attendance for {managerDepartment} team</p>
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
          <div className="px-6 py-3 bg-gray-50 border-t flex justify-end">
            <button onClick={exportAttendanceToExcel} className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Export to Excel
            </button>
          </div>
        </div>
      )}

      {/* Auto Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">📄 Auto Generated Reports</h2>
              <p className="text-purple-100 text-sm mt-1">Weekly and monthly reports automatically generated</p>
            </div>
            <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-3 justify-between items-center">
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm">
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <div className="flex gap-2">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-1.5 border rounded-lg text-sm">
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i}>{new Date(selectedYear, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-1.5 border rounded-lg text-sm">
                  {[2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button onClick={generateMonthlyReport} disabled={generatingReport} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                  {generatingReport ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {reports.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-500">No reports generated yet</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{report.title}</p>
                      <p className="text-sm text-gray-500">{report.date} • {report.type} • Generated by {report.generatedBy}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-purple-600 text-sm hover:text-purple-700 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button className="text-green-600 text-sm hover:text-green-700 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t">
              <button onClick={sendEmailReport} disabled={sendingEmail} className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2">
                <Send className="w-4 h-4" /> {sendingEmail ? 'Sending...' : 'Send Email Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Team Performance Metrics
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
              Performance Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Top Performer</p>
                  <p className="text-sm text-gray-600">{performanceData?.topPerformer} is leading the team this month</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Needs Improvement</p>
                  <p className="text-sm text-gray-600">{performanceData?.needsImprovement} needs attention on task completion</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Team Average</p>
                  <p className="text-sm text-gray-600">Team performance is {performanceData?.averageScore >= 80 ? 'above' : 'at'} average</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Attention Required</p>
                  <p className="text-sm text-gray-600">{warningStats.activeWarnings || 0} active warning(s) need attention</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Monitor Tab */}
      {activeTab === 'warnings' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-2xl font-bold text-red-600">{warningStats.totalWarnings || 0}</div>
              <div className="text-sm text-gray-600">Total Warnings</div>
            </div>
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{warningStats.activeWarnings || 0}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{warningStats.level3Warnings || 0}</div>
              <div className="text-sm text-gray-600">Final Warnings</div>
            </div>
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{warningStats.escalatedWarnings || 0}</div>
              <div className="text-sm text-gray-600">Escalated</div>
            </div>
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-2xl font-bold text-green-600">{warningStats.resolvedWarnings || 0}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </div>

          {/* Active Warnings List */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">⚠️ Active Warnings</h3>
              <p className="text-red-100 text-sm">Employees with active warnings requiring attention</p>
            </div>
            
            {warnings.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-gray-500 text-lg">No active warnings</p>
                <p className="text-sm text-gray-400 mt-1">All employees are meeting expectations</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {warnings.map((warning) => {
                  const levelBadge = getWarningLevelBadge(warning.level);
                  return (
                    <div key={warning.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                          <div className="text-3xl">{getWarningTypeIcon(warning.type)}</div>
                          <div>
                            <div className="flex items-center space-x-3 flex-wrap gap-2">
                              <h4 className="font-semibold text-gray-900">{warning.employeeName}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${levelBadge.class}`}>
                                {levelBadge.text}
                              </span>
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                {warning.department}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{warning.role}</p>
                            <p className="text-sm text-gray-600 mt-2">{warning.reason}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <p className="text-xs text-gray-400">
                                Issued: {new Date(warning.createdAt).toLocaleString()}
                              </p>
                              {warning.emailSent && (
                                <button className="text-xs text-blue-600 hover:underline">
                                  View Email
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          {/* Schedule Form */}
          {showScheduleForm && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Automated Report</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Name</label>
                  <input
                    type="text"
                    value={scheduleConfig.name}
                    onChange={(e) => setScheduleConfig({...scheduleConfig, name: e.target.value})}
                    placeholder="e.g., Weekly Team Report"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    value={scheduleConfig.reportType}
                    onChange={(e) => setScheduleConfig({...scheduleConfig, reportType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="team">Team Report</option>
                    <option value="attendance">Attendance Report</option>
                    <option value="performance">Performance Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={scheduleConfig.frequency}
                    onChange={(e) => setScheduleConfig({...scheduleConfig, frequency: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                {scheduleConfig.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                    <select
                      value={scheduleConfig.dayOfWeek}
                      onChange={(e) => setScheduleConfig({...scheduleConfig, dayOfWeek: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={scheduleConfig.time}
                    onChange={(e) => setScheduleConfig({...scheduleConfig, time: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Recipients */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button onClick={handleAddRecipient} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {scheduleConfig.recipients.map((email, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm">
                      {email}
                      <button onClick={() => handleRemoveRecipient(email)} className="ml-2 text-purple-500 hover:text-purple-700">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowScheduleForm(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button onClick={handleScheduleReport} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Schedule Report
                </button>
              </div>
            </div>
          )}

          {/* Schedules List */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-white">📅 Scheduled Reports</h2>
                <p className="text-purple-100 text-sm">Manage automated email reports</p>
              </div>
              <button
                onClick={() => setShowScheduleForm(!showScheduleForm)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Report</span>
              </button>
            </div>

            {schedules.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📧</div>
                <p className="text-gray-500">No scheduled reports</p>
                <p className="text-sm text-gray-400 mt-1">Click "Schedule Report" to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{schedule.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {getReportTypeLabel(schedule.reportType)} • {getFrequencyLabel(schedule.frequency)}
                          {schedule.frequency === 'weekly' && ` on ${schedule.dayOfWeek}`} at {schedule.time}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {schedule.recipients.map((email, idx) => (
                            <span key={idx} className="text-xs text-gray-500">• {email}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${schedule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {schedule.active ? 'Active' : 'Paused'}
                        </span>
                        <button onClick={() => handleDeleteSchedule(schedule.id)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email & Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">📧 Email Settings</h3>
              <button onClick={sendEmailReport} disabled={sendingEmail} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                {sendingEmail ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(emailSettings).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <button onClick={() => updateEmailSetting(key)} className={`w-10 h-5 rounded-full transition-colors ${value ? 'bg-purple-600' : 'bg-gray-300'} relative`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`}></span>
                  </button>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b">
              <h3 className="font-semibold text-gray-900">📨 Recent Email Logs</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-500">No email logs yet</p>
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <div key={idx} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{notif.subject || 'Email Notification'}</p>
                      <p className="text-xs text-gray-500">To: {notif.to || currentUser?.email} • {notif.time || new Date(notif.sentAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${notif.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {notif.status || 'Sent'}
                      </span>
                      <button onClick={() => handlePreviewEmail(notif)} className="text-xs text-blue-600 hover:text-blue-700">
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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">🔔 Auto Reminders</h2>
            <p className="text-purple-100 text-sm">Automated reminders for team tasks and deadlines</p>
          </div>
          <div className="divide-y divide-gray-200">
            {reminders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-500">No reminders set</p>
              </div>
            ) : (
              reminders.map(reminder => (
                <div key={reminder.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{reminder.title}</p>
                      <p className="text-sm text-gray-500">Due: {reminder.dueDate} • {reminder.type}</p>
                      {reminder.assignedTo && (
                        <p className="text-xs text-gray-400 mt-1">Assigned to: {reminder.assignedTo}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">{reminder.status}</span>
                      <button className="text-sm text-purple-600 hover:text-purple-700">Mark Complete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t">
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Reminder
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AutomationDashboard;
