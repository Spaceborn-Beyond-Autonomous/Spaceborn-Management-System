// src/components/Dashboard/CEO/WarningMonitor.jsx
import React, { useState, useEffect } from 'react';
import warningSimulatorService from '../../../services/warningSimulatorService';
import emailSimulatorService from '../../../services/emailSimulatorService';
import EmailPreviewModal from '../../Common/EmailPreviewModal';

const WarningMonitor = ({ userRole }) => {
  const [warnings, setWarnings] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [autoScanning, setAutoScanning] = useState(false);
  const [scanResults, setScanResults] = useState([]);

  useEffect(() => {
    loadData();
    // Auto-refresh every minute
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [warningsData, statsData, emailsData] = await Promise.all([
        warningSimulatorService.getPendingWarnings(),
        warningSimulatorService.getWarningStats(),
        emailSimulatorService.getEmailLogs(),
      ]);
      setWarnings(warningsData);
      setStats(statsData);
      setEmailLogs(emailsData.slice(0, 10));
    } catch (error) {
      console.error('Error loading warnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAutoScan = async () => {
    setAutoScanning(true);
    try {
      const issues = await warningSimulatorService.runAutomatedCheck();
      setScanResults(issues);
      
      // Auto-send warnings for critical issues
      for (const issue of issues) {
        const employee = warningSimulatorService.getEmployeeById(issue.employeeId);
        await warningSimulatorService.sendWarning(
          issue.employeeId,
          issue.type,
          issue.reason,
          issue.suggestedLevel
        );
      }
      
      await loadData();
      setTimeout(() => setScanResults([]), 5000);
    } catch (error) {
      console.error('Error running auto scan:', error);
    } finally {
      setAutoScanning(false);
    }
  };

  const handleSendWarning = async (employeeId, type, reason) => {
    if (!window.confirm(`Send ${type} warning to this employee?`)) return;
    
    try {
      await warningSimulatorService.sendWarning(employeeId, type, reason, 1);
      await loadData();
      alert(`Warning sent successfully!`);
    } catch (error) {
      alert('Failed to send warning');
    }
  };

  const handleDismissWarning = async (warningId) => {
    const comments = prompt('Add resolution comments (optional):');
    if (!window.confirm('Dismiss this warning?')) return;
    
    try {
      await warningSimulatorService.dismissWarning(warningId, comments);
      await loadData();
      alert('Warning dismissed');
    } catch (error) {
      alert('Failed to dismiss warning');
    }
  };

  const handlePreviewEmail = (email) => {
    setSelectedEmail(email);
    setShowEmailPreview(true);
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

  const filteredWarnings = warnings.filter(warning => {
    if (filterType !== 'all' && warning.type !== filterType) return false;
    if (filterDepartment !== 'all' && warning.department !== filterDepartment) return false;
    return true;
  });

  const departments = [...new Set(warnings.map(w => w.department))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">⚠️ Warning Monitor</h2>
          <p className="text-sm text-gray-500 mt-1">Automated employee warning system</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runAutoScan}
            disabled={autoScanning}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {autoScanning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Run Auto-Scan</span>
              </>
            )}
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Scan Results Alert */}
      {scanResults.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-yellow-800">Auto-Scan Complete</p>
              <p className="text-sm text-yellow-700">
                Found {scanResults.length} issue(s). {scanResults.length} warning(s) have been sent automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.totalWarnings || 0}</div>
          <div className="text-sm text-gray-600">Total Warnings</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{stats.activeWarnings || 0}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{stats.level3Warnings || 0}</div>
          <div className="text-sm text-gray-600">Final Warnings</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{stats.escalatedWarnings || 0}</div>
          <div className="text-sm text-gray-600">Escalated</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.resolvedWarnings || 0}</div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            <option value="daily_report">Daily Report</option>
            <option value="attendance">Attendance</option>
            <option value="meeting">Meeting</option>
            <option value="task_overdue">Task Overdue</option>
            <option value="performance">Performance</option>
          </select>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <span className="text-sm text-gray-500">
            Showing {filteredWarnings.length} active warning(s)
          </span>
        </div>
      </div>

      {/* Warnings List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Active Warnings</h3>
          <p className="text-red-100 text-sm">Employees with active warnings requiring attention</p>
        </div>
        
        {filteredWarnings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-500 text-lg">No active warnings</p>
            <p className="text-sm text-gray-400 mt-1">All employees are meeting expectations</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredWarnings.map((warning) => {
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
                            <button
                              onClick={() => handlePreviewEmail({
                                to: `${warning.employeeName} <${warning.employeeId}@spaceborn.com>`,
                                subject: `${getWarningTypeLabel(warning.type)} Warning`,
                                status: 'delivered',
                                content: `<div style="padding: 20px;"><h2>Warning Email</h2><p>${warning.reason}</p></div>`
                              })}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View Email
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedWarning(warning);
                          setShowDetails(true);
                        }}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleDismissWarning(warning.id)}
                        className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Warning Details Modal */}
      {showDetails && selectedWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Warning Details</h3>
              <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Employee</label>
                  <p className="font-medium">{selectedWarning.employeeName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Department / Role</label>
                  <p className="font-medium">{selectedWarning.department} • {selectedWarning.role}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Warning Type</label>
                  <p className="font-medium">{getWarningTypeLabel(selectedWarning.type)}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Warning Level</label>
                  <p className="font-medium">{getWarningLevelBadge(selectedWarning.level).text}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Reason</label>
                  <p className="text-gray-700 mt-1">{selectedWarning.reason}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Issued On</label>
                  <p>{new Date(selectedWarning.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Status</label>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                    selectedWarning.status === 'active' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedWarning.status.toUpperCase()}
                  </span>
                </div>
                {selectedWarning.resolvedAt && (
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Resolution</label>
                    <p className="text-gray-700 mt-1">Resolved on {new Date(selectedWarning.resolvedAt).toLocaleString()}</p>
                    {selectedWarning.resolutionNotes && (
                      <p className="text-sm text-gray-500 mt-1">Notes: {selectedWarning.resolutionNotes}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      <EmailPreviewModal 
        email={selectedEmail} 
        onClose={() => setShowEmailPreview(false)} 
      />

      {/* Email Logs */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b">
          <h3 className="font-semibold text-gray-900">📧 Recent Email Logs</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {emailLogs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No email logs yet</p>
            </div>
          ) : (
            emailLogs.map((log, idx) => (
              <div key={idx} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{log.subject || `Warning Email`}</p>
                  <p className="text-xs text-gray-500">To: {log.to} • {new Date(log.sentAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    log.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {log.status || 'Sent'}
                  </span>
                  <button
                    onClick={() => handlePreviewEmail(log)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
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
  );
};

export default WarningMonitor;