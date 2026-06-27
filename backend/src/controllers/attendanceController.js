// controllers/attendanceController.js
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { formatResponse } = require('../utils/helpers');

// @desc    Auto-mark attendance on login
// @route   POST /api/attendance/auto-mark
// @access  Private
exports.autoMarkAttendance = async (req, res) => {
  try {
    const { userId, userName, employeeId, department, role } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Check if already marked today
    let attendance = await Attendance.findOne({ userId, date: today });
    
    if (attendance) {
      // Update check-out if not set
      if (!attendance.checkOut) {
        attendance.checkOut = currentTime;
        attendance.checkOutTime = now;
        const hours = (now - attendance.checkInTime) / (1000 * 60 * 60);
        attendance.hoursWorked = Math.round(hours * 100) / 100;
        await attendance.save();
      }
      return res.status(200).json(formatResponse(true, 'Attendance updated', attendance));
    }
    
    // Determine status based on login time
    const loginHour = now.getHours();
    let status = 'present';
    if (loginHour >= 9) {
      status = 'late';
    }
    
    // Create new attendance record
    attendance = await Attendance.create({
      userId: String(userId),
      userName,
      employeeId,
      department,
      role,
      date: today,
      checkIn: currentTime,
      checkInTime: now,
      status,
      isAutoMarked: true
    });
    
    res.status(201).json(formatResponse(true, 'Attendance marked on login', attendance));
  } catch (error) {
    console.error('Auto-mark attendance error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    const { date, department, status } = req.query;
    const query = {};
    
    if (date) {
      query.date = date;
    }
    
    if (department && department !== 'all') {
      query.department = department;
    }
    
    if (status) {
      query.status = status;
    }
    
    const attendance = await Attendance.find(query).sort({ createdAt: -1 });
    res.status(200).json(formatResponse(true, 'Attendance fetched', attendance));
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get attendance stats
// @route   GET /api/attendance/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const records = await Attendance.find({ date: targetDate });
    
    const stats = {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      onLeave: records.filter(r => r.status === 'on-leave').length,
      workingFromHome: records.filter(r => r.status === 'working-from-home').length,
      totalEmployees: records.length
    };
    
    res.status(200).json(formatResponse(true, 'Stats fetched', stats));
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get department stats
// @route   GET /api/attendance/by-department
// @access  Private
exports.getDepartmentStats = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const records = await Attendance.find({ date: targetDate });
    
    // Group by department
    const deptMap = {};
    records.forEach(record => {
      if (!deptMap[record.department]) {
        deptMap[record.department] = {
          department: record.department,
          present: 0,
          absent: 0,
          late: 0,
          onLeave: 0,
          total: 0
        };
      }
      const dept = deptMap[record.department];
      dept.total++;
      if (record.status === 'present') dept.present++;
      else if (record.status === 'absent') dept.absent++;
      else if (record.status === 'late') dept.late++;
      else if (record.status === 'on-leave') dept.onLeave++;
    });
    
    const deptStats = Object.values(deptMap);
    res.status(200).json(formatResponse(true, 'Department stats', deptStats));
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Mark attendance manually
// @route   POST /api/attendance/mark
// @access  Private
exports.markAttendance = async (req, res) => {
  try {
    const { userId, userName, employeeId, department, role, date, status, checkInTime, checkOutTime, notes } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    let attendance = await Attendance.findOne({ userId, date: targetDate });
    
    if (attendance) {
      // Update existing
      if (status) attendance.status = status;
      if (checkInTime) {
        attendance.checkIn = checkInTime;
        attendance.checkInTime = new Date(`${targetDate}T${checkInTime}`);
      }
      if (checkOutTime) {
        attendance.checkOut = checkOutTime;
        attendance.checkOutTime = new Date(`${targetDate}T${checkOutTime}`);
      }
      if (notes) attendance.notes = notes;
      
      if (checkInTime && checkOutTime) {
        const start = new Date(`${targetDate}T${checkInTime}`);
        const end = new Date(`${targetDate}T${checkOutTime}`);
        attendance.hoursWorked = Math.round((end - start) / (1000 * 60 * 60) * 100) / 100;
      }
      
      await attendance.save();
      return res.status(200).json(formatResponse(true, 'Attendance updated', attendance));
    }
    
    // Create new
    attendance = await Attendance.create({
      userId: String(userId),
      userName,
      employeeId,
      department,
      role,
      date: targetDate,
      status: status || 'present',
      checkIn: checkInTime || '',
      checkInTime: checkInTime ? new Date(`${targetDate}T${checkInTime}`) : null,
      checkOut: checkOutTime || '',
      checkOutTime: checkOutTime ? new Date(`${targetDate}T${checkOutTime}`) : null,
      notes,
      isAutoMarked: false
    });
    
    res.status(201).json(formatResponse(true, 'Attendance marked', attendance));
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Mark absent for leave requests
// @route   POST /api/attendance/mark-leave-absent
// @access  Private
exports.markLeaveAbsent = async (req, res) => {
  try {
    const { leaveRequests } = req.body;  // Array of { userId, userName, employeeId, department, date }

    if (!leaveRequests || !Array.isArray(leaveRequests)) {
      return res.status(400).json(formatResponse(false, 'Invalid leave requests'));
    }

    const results = [];
    for (const leave of leaveRequests) {
      const { userId, userName, employeeId, department, startDate, endDate } = leave;

      // Generate all dates in range
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];

        // Check if already marked
        let attendance = await Attendance.findOne({ userId, date: dateStr });

        if (attendance) {
          attendance.status = 'on-leave';
          await attendance.save();
        } else {
          attendance = await Attendance.create({
            userId: String(userId),
            userName,
            employeeId,
            department,
            date: dateStr,
            status: 'on-leave',
            isAutoMarked: false
          });
        }
        results.push(attendance);
      }
    }

    res.status(200).json(formatResponse(true, 'Leave attendance marked', results));
  } catch (error) {
    console.error('Mark leave absent error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get roster attendance computed as:
//          - on-leave if employee has APPROVED leave covering the date
//          - present/late/wfh based on Attendance record if exists
//          - absent if no Attendance record and not on-leave
// @route   GET /api/attendance/roster?date=YYYY-MM-DD&department=...
// @access  Private
exports.getRosterAttendance = async (req, res) => {
  try {
    const { date, department } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const user = req.user;
    const viewRole = user?.role;

    // Scope:
    // - CEO/Manager: all departments unless a department filter is passed
    // - Other roles: their own department
    const hasCompanyAttendanceAccess = ['CEO', 'COO', 'Manager'].includes(viewRole);
    const scopeDepartment = hasCompanyAttendanceAccess
      ? (department && department !== 'all' ? department : null)
      : user?.department;

    const usersQuery = { role: { $in: ['CEO', 'COO', 'Manager', 'Co-Head', 'CO Head', 'Team Lead', 'Member', 'HR'] } };
    if (scopeDepartment) usersQuery.department = scopeDepartment;

    const employees = await User.find(usersQuery).select('employeeId firstName lastName fullName role department');

    // Some schemas may not have 'fullName' consistently; normalize below.

    const attendanceRecords = await Attendance.find({
      date: targetDate,
      ...(scopeDepartment ? { department: scopeDepartment } : {})
    });

    const attendanceByUserId = new Map();
    attendanceRecords.forEach((r) => {
      attendanceByUserId.set(String(r.userId), r);
    });


    // If auto-mark stored userId as user._id, roster should match via emp._id.
    // If auto-mark instead stored some other identifier, then matching will be incomplete.
    // (Kept as-is to avoid breaking existing data.)

    // Approved leaves covering targetDate
    const leaves = await Leave.find({
      status: 'Approved',
      ...(scopeDepartment ? { department: scopeDepartment } : {})
    });

    const isLeaveOnDate = (leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const current = new Date(targetDate);
      return current >= start && current <= end;
    };

    const leaveUserIdSet = new Map(); // userId -> leave
    for (const l of leaves) {
      if (!isLeaveOnDate(l)) continue;
      // Attendance.userId stores String(userId from auto-mark). Leave.userId is Number.
      leaveUserIdSet.set(String(l.userId), l);
    }

    const roster = employees.map((emp) => {
      // Attendance/Leave userId in this codebase is the user _id stored as string.
      // User model does not expose userId field, so we use _id here.
      const empUserId = String(emp._id);
      const attendance = attendanceByUserId.get(empUserId) || null;
      const leave = leaveUserIdSet.get(empUserId) || null;

      if (leave) {
        return {
          id: emp.employeeId || emp._id,
          userId: empUserId,
          employeeId: emp.employeeId,
          name: emp.fullName || emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.employeeId,
          department: emp.department,
          role: emp.role,
          status: 'on-leave',
          checkIn: '',
          checkOut: '',
          hoursWorked: 0,
          leaveInfo: {
            type: leave.type,
            startDate: leave.startDate,
            endDate: leave.endDate
          }
        };
      }

      if (attendance) {
        return {
          id: attendance._id,
          userId: String(attendance.userId),
          employeeId: attendance.employeeId,
          name: attendance.userName,
          department: attendance.department,
          role: attendance.role,
          status: attendance.status,
          checkIn: attendance.checkIn,
          checkOut: attendance.checkOut,
          hoursWorked: attendance.hoursWorked || 0
        };
      }

      return {
        id: `absent-${emp.employeeId || emp._id}`,
        userId: empUserId,
        employeeId: emp.employeeId,
        name: emp.fullName || emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.employeeId,
        department: emp.department,
        role: emp.role,
        status: 'absent',
        checkIn: '',
        checkOut: '',
        hoursWorked: 0
      };
    });

    res.status(200).json(formatResponse(true, 'Roster attendance computed', roster));
  } catch (error) {
    console.error('Get roster attendance error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};
