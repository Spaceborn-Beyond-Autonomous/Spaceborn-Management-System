import React, { useState, useEffect } from 'react';
import reportService from '../../services/reportService';

const DailyWorkReport = ({ user, onReportSubmitted }) => {
  const [todayReport, setTodayReport] = useState(null);
  const [formData, setFormData] = useState({
    completedTasks: '',
    ongoingWork: '',
    issuesFaced: '',
    nextDayPlan: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [pastReports, setPastReports] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [compliance, setCompliance] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [user.id]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTodayReport(),
        fetchPastReports(),
        fetchCompliance(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayReport = async () => {
    try {
      const report = await reportService.getTodayReport(user.id);
      if (report) {
        setTodayReport(report);
        setFormData({
          completedTasks: report.completedTasks || '',
          ongoingWork: report.ongoingWork || '',
          issuesFaced: report.issuesFaced || '',
          nextDayPlan: report.nextDayPlan || '',
        });
      }
    } catch (error) {
      console.error('Error fetching today\'s report:', error);
      // Don't show error to user for missing report
    }
  };

  const fetchPastReports = async () => {
    try {
      const reports = await reportService.getUserReports(user.id);
      setPastReports(reports || []);
    } catch (error) {
      console.error('Error fetching past reports:', error);
      setPastReports([]);
    }
  };

  const fetchCompliance = async () => {
    try {
      const stats = await reportService.getComplianceReport(user.department);
      setCompliance(stats);
    } catch (error) {
      console.error('Error fetching compliance:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.completedTasks.trim()) {
      setError('Please fill in completed tasks');
      setIsSubmitting(false);
      return;
    }

    try {
      const reportData = {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        department: user.department,
        employeeId: user.employeeId,
        date: new Date().toISOString().split('T')[0],
        completedTasks: formData.completedTasks,
        ongoingWork: formData.ongoingWork,
        issuesFaced: formData.issuesFaced,
        nextDayPlan: formData.nextDayPlan,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
      };

      const result = await reportService.submitReport(reportData);
      setTodayReport(result);
      setSubmitted(true);
      setIsEditing(false);
      setTimeout(() => setSubmitted(false), 3000);
      
      if (onReportSubmitted) onReportSubmitted(result);
      await fetchPastReports();
      await fetchCompliance();
    } catch (error) {
      setError(error.message || 'Failed to submit report. Please try again.');
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

 const handleUpdate = async () => {
  setIsSubmitting(true);
  setError('');
  
  try {
    const reportId = todayReport._id || todayReport.id;
    if (!reportId) {
      setError('Report ID missing');
      setIsSubmitting(false);
      return;
    }
    
    const updated = await reportService.updateReport(reportId, {
      completedTasks: formData.completedTasks,
      ongoingWork: formData.ongoingWork,
      issuesFaced: formData.issuesFaced,
      nextDayPlan: formData.nextDayPlan,
      updatedAt: new Date().toISOString(),
    });

      setTodayReport(updated);
      setSubmitted(true);
      setIsEditing(false);
      setTimeout(() => setSubmitted(false), 3000);
      await fetchPastReports();
    } catch (error) {
      setError(error.message || 'Failed to update report.');
      console.error('Error updating report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReport = async (report) => {
  if (window.confirm('Delete this report?')) {
    try {
      const reportId = report._id || report.id;
      if (!reportId) {
        alert('Cannot delete - report ID missing');
        return;
      }
      await reportService.deleteReport(reportId);
      await fetchPastReports();
      alert('Report deleted');
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  }
};

  const isTodayReportSubmitted = () => {
    return todayReport && todayReport.status === 'submitted';
  };

  const getSubmissionStreak = () => {
    if (!compliance || !compliance.streak) return 0;
    return compliance.streak;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Compliance Banner */}
      {compliance && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg mr-2">📊</span>
              <span className="font-medium text-gray-700">Report Compliance:</span>
              <span className="ml-2 text-gray-600">
                {compliance.submittedThisMonth || 0} / {compliance.expectedThisMonth || 22} reports this month
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                🔥 Streak: {getSubmissionStreak()} days
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${compliance.percentage || 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-green-600">
                {compliance.percentage || 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-black to-gray-800 px-6 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">📝 Daily Work Report</h2>
              <p className="text-gray-300 text-sm">Mandatory daily submission · Due by EOD</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
              >
                {showHistory ? 'Hide History' : 'View History'}
              </button>
            </div>
          </div>
        </div>

        {submitted && (
          <div className="m-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
            ✅ Report {isEditing ? 'updated' : 'submitted'} successfully!
          </div>
        )}

        {error && (
          <div className="m-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
            ❌ {error}
          </div>
        )}

        {isTodayReportSubmitted() && !isEditing ? (
  <div className="p-6">
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <span className="text-green-800 font-semibold">✓ Report submitted for today</span>
          <p className="text-green-600 text-sm">Submitted at: {todayReport?.submittedAt ? new Date(todayReport.submittedAt).toLocaleTimeString() : 'N/A'}</p>
          {todayReport?.updatedAt && (
            <p className="text-green-600 text-sm">Last updated: {new Date(todayReport.updatedAt).toLocaleTimeString()}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Edit Report
          </button>
          <button
            onClick={() => {
              setTodayReport(null);
              setFormData({
                completedTasks: '',
                ongoingWork: '',
                issuesFaced: '',
                nextDayPlan: '',
              });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Report
          </button>
        </div>
      </div>
    </div>
    <div className="space-y-4">
      <ReportSection title="✅ Completed Tasks" content={todayReport?.completedTasks} />
      <ReportSection title="🔄 Ongoing Work" content={todayReport?.ongoingWork} />
      <ReportSection title="⚠️ Issues Faced" content={todayReport?.issuesFaced} />
      <ReportSection title="📅 Next Day Plan" content={todayReport?.nextDayPlan} />
    </div>
  </div>
) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ✅ Completed Tasks <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.completedTasks}
                onChange={(e) => setFormData({...formData, completedTasks: e.target.value})}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                placeholder="• Task 1: Completed feature X&#10;• Task 2: Fixed bug Y&#10;• Task 3: Attended meeting Z"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Use bullet points for better readability</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔄 Ongoing Work
              </label>
              <textarea
                value={formData.ongoingWork}
                onChange={(e) => setFormData({...formData, ongoingWork: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                placeholder="• Currently working on feature A&#10;• Reviewing PR #123&#10;• Investigating performance issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⚠️ Issues Faced
              </label>
              <textarea
                value={formData.issuesFaced}
                onChange={(e) => setFormData({...formData, issuesFaced: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                placeholder="• Dependency delay from team X&#10;• Technical challenge with Y&#10;• Need clarification on requirement Z"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Next Day Plan
              </label>
              <textarea
                value={formData.nextDayPlan}
                onChange={(e) => setFormData({...formData, nextDayPlan: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                placeholder="• Complete feature A&#10;• Start task B&#10;• Team meeting at 2 PM"
              />
            </div>

            <div className="flex justify-end space-x-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (todayReport) {
                      setFormData({
                        completedTasks: todayReport.completedTasks || '',
                        ongoingWork: todayReport.ongoingWork || '',
                        issuesFaced: todayReport.issuesFaced || '',
                        nextDayPlan: todayReport.nextDayPlan || '',
                      });
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                type={isEditing ? 'button' : 'submit'}
                onClick={isEditing ? handleUpdate : undefined}
                disabled={isSubmitting}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Report' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* History Section */}
      {showHistory && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">📋 Report History</h3>
            <span className="text-sm text-gray-500">{pastReports.length} reports</span>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {pastReports.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500">No past reports found.</p>
                <p className="text-sm text-gray-400 mt-1">Submit your first report to get started</p>
              </div>
            ) : (
              pastReports.map((report) => (
                <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <span className="font-medium text-gray-900">
                          {new Date(report.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          report.status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status === 'submitted' ? 'Submitted' : report.status}
                        </span>
                        {report.updatedAt && (
                          <span className="text-xs text-gray-400">(Edited)</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {new Date(report.submittedAt).toLocaleString()}
                        {report.updatedAt && ` • Updated: ${new Date(report.updatedAt).toLocaleString()}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteReport(report)}
                      className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                      title="Delete report"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    <div className="line-clamp-2">
                      <span className="font-medium">Completed:</span> {report.completedTasks?.substring(0, 100)}
                      {report.completedTasks?.length > 100 && '...'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ReportSection = ({ title, content }) => (
  <div className="border-l-4 border-black pl-4 py-2 bg-gray-50 rounded-r-lg">
    <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
    <p className="text-gray-700 whitespace-pre-wrap">{content || '—'}</p>
  </div>
);

export default DailyWorkReport;