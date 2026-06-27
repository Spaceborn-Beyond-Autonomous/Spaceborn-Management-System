// controllers/reportController.js
const mongoose = require('mongoose');
const Report = require('../models/Report');
const { formatResponse } = require('../utils/helpers');
const { notifyReportSubmitted } = require('../utils/notificationDispatcher');

// @desc    Submit new report
// @route   POST /api/reports
// @access  Private (All roles)
exports.submitReport = async (req, res) => {
  try {
    const { userId, userName, userRole, department, employeeId, date, completedTasks, ongoingWork, issuesFaced, nextDayPlan } = req.body;

    if (!userId || !date) {
      return res.status(400).json(formatResponse(false, 'User ID and date are required'));
    }

    // Handle userId - convert to string if it's not already
    const userIdStr = String(userId);

    // Check if report already exists for this user and date
    const existingReport = await Report.findOne({ userId: userIdStr, date });
    
    if (existingReport) {
      // Update existing report
      existingReport.completedTasks = completedTasks || '';
      existingReport.ongoingWork = ongoingWork || '';
      existingReport.issuesFaced = issuesFaced || '';
      existingReport.nextDayPlan = nextDayPlan || '';
      existingReport.status = 'submitted';
      existingReport.updatedAt = new Date();
      
      await existingReport.save();
      await notifyReportSubmitted(existingReport);
      return res.status(200).json(formatResponse(true, 'Report updated successfully', existingReport));
    }

    // Create new report - store userId as string
    const report = await Report.create({
      userId: userIdStr,
      userName: userName || 'Unknown',
      userRole: userRole || 'Member',
      department: department || 'General',
      employeeId: employeeId || '',
      date,
      completedTasks: completedTasks || '',
      ongoingWork: ongoingWork || '',
      issuesFaced: issuesFaced || '',
      nextDayPlan: nextDayPlan || '',
      status: 'submitted',
      submittedAt: new Date()
    });

    await notifyReportSubmitted(report);

    res.status(201).json(formatResponse(true, 'Report submitted successfully', report));
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get today's report for a user
// @route   GET /api/reports/user/:userId/today
// @access  Private
exports.getTodayReport = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userIdStr = String(req.params.userId);
    const report = await Report.findOne({ userId: userIdStr, date: today });

    if (!report) {
      return res.status(404).json(formatResponse(false, 'No report found for today'));
    }

    res.status(200).json(formatResponse(true, 'Today\'s report', report));
  } catch (error) {
    console.error('Get today report error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get all reports for a user
// @route   GET /api/reports/user/:userId
// @access  Private
exports.getUserReports = async (req, res) => {
  try {
    const userIdStr = String(req.params.userId);
    const reports = await Report.find({ userId: userIdStr }).sort({ date: -1 }).limit(100);
    res.status(200).json(formatResponse(true, 'User reports', reports));
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get reports by department
// @route   GET /api/reports/department/:department
// @access  Private (CEO, Manager)
exports.getDepartmentReports = async (req, res) => {
  try {
    const reports = await Report.find({ department: req.params.department }).sort({ date: -1 });
    res.status(200).json(formatResponse(true, 'Department reports', reports));
  } catch (error) {
    console.error('Get department reports error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get all reports (CEO only)
// @route   GET /api/reports
// @access  Private (CEO)
exports.getAllReports = async (req, res) => {
  try {
    const { department, date, start, end } = req.query;
    
    let query = {};
    
    if (department) {
      query.department = department;
    }
    
    if (date) {
      query.date = date;
    }
    
    if (start && end) {
      query.date = { $gte: start, $lte: end };
    }

    const reports = await Report.find(query).sort({ date: -1, createdAt: -1 });
    res.status(200).json(formatResponse(true, 'All reports', reports));
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private (Owner only)
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    let report;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      report = await Report.findById(id);
    }
    
    if (!report) {
      report = await Report.findOne({ _id: id });
    }

    if (!report) {
      return res.status(404).json(formatResponse(false, 'Report not found'));
    }

    const { completedTasks, ongoingWork, issuesFaced, nextDayPlan } = req.body;

    if (completedTasks) report.completedTasks = completedTasks;
    if (ongoingWork) report.ongoingWork = ongoingWork;
    if (issuesFaced) report.issuesFaced = issuesFaced;
    if (nextDayPlan) report.nextDayPlan = nextDayPlan;
    report.updatedAt = new Date();

    await report.save();
    res.status(200).json(formatResponse(true, 'Report updated', report));
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};
// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private (Owner only)
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by _id or by userId+date
    let report;
    if (mongoose.Types.ObjectId.isValid(id)) {
      report = await Report.findById(id);
    }
    
    // Also search by userId for string IDs
    if (!report) {
      report = await Report.findOne({ _id: id });
    }

    if (!report) {
      return res.status(404).json(formatResponse(false, 'Report not found'));
    }

    await Report.findByIdAndDelete(report._id);
    res.status(200).json(formatResponse(true, 'Report deleted'));
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};


// @desc    Get compliance report
// @route   GET /api/reports/compliance
// @access  Private
exports.getComplianceReport = async (req, res) => {
  try {
    const { department } = req.query;
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const expectedDays = Math.min(22, Math.ceil(today.getDate()));
    
    let query = {
      date: {
        $gte: startOfMonth.toISOString().split('T')[0],
        $lte: today.toISOString().split('T')[0]
      },
      status: 'submitted'
    };
    
    if (department) {
      query.department = department;
    }

    const reporters = await Report.distinct('userId', query);
    const submittedCount = await Report.countDocuments(query);
    
    const percentage = expectedDays > 0 ? Math.round((reporters.length / expectedDays) * 100) : 0;

    let streak = 0;
    let checkDate = new Date(today);
    
    while (streak < 365) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayQuery = { ...query, date: dateStr };
      
      const hasReport = await Report.findOne(dayQuery);
      if (hasReport) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.status(200).json(formatResponse(true, 'Compliance report', {
      submittedThisMonth: submittedCount,
      expectedThisMonth: expectedDays,
      submittersCount: reporters.length,
      percentage,
      streak
    }));
  } catch (error) {
    console.error('Get compliance error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};
