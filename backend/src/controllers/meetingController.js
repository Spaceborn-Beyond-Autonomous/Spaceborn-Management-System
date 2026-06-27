const Meeting = require('../models/Meeting');
const User = require('../models/User');
const { formatResponse } = require('../utils/helpers');
const { notifyMeetingCreated } = require('../utils/notificationDispatcher');

// @desc    Create new meeting
// @route   POST /api/meetings
// @access  Private (CEO, Manager, Team Lead)
exports.createMeeting = async (req, res) => {
  try {
    const { title, department, date, time, duration, meetingLink, description } = req.body;

    // Validate required fields
    if (!title || !department || !date || !time) {
      return res.status(400).json(formatResponse(false, 'Title, department, date, and time are required'));
    }

    const meeting = await Meeting.create({
      title,
      department,
      date,
      time,
      duration: duration || '1 hour',
      meetingLink: meetingLink || '',
      description: description || '',
      createdBy: `${req.user.firstName} ${req.user.lastName}`,
      createdById: req.user._id,
      status: 'upcoming',
      attendees: []
    });

    await notifyMeetingCreated(meeting);

    res.status(201).json(formatResponse(true, 'Meeting scheduled successfully', meeting));
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get all meetings
// @route   GET /api/meetings
// @access  Private (All roles)
exports.getAllMeetings = async (req, res) => {
  try {
    const { filter, department } = req.query;
    const today = new Date().toISOString().split('T')[0];

    let query = {};

    // Filter by status
    if (filter === 'upcoming') {
      query.date = { $gte: today };
    } else if (filter === 'past') {
      query.date = { $lt: today };
    }

    // Filter by department
    if (department && department !== 'all') {
      query.$or = [
        { department: department },
        { department: 'All' }
      ];
    }

    const meetings = await Meeting.find(query)
      .sort({ date: 1, time: 1 })
      .populate('createdById', 'firstName lastName');

    res.status(200).json(formatResponse(true, 'Meetings fetched successfully', meetings));
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get meetings for my department
// @route   GET /api/meetings/my-department
// @access  Private (All roles)
exports.getMyDepartmentMeetings = async (req, res) => {
  try {
    const user = req.user;
    const userDepartment = user.department;
    const today = new Date().toISOString().split('T')[0];

    const meetings = await Meeting.find({
      $or: [
        { department: userDepartment },
        { department: 'All' }
      ],
      date: { $gte: today }
    }).sort({ date: 1, time: 1 });

    res.status(200).json(formatResponse(true, 'Meetings fetched successfully', meetings));
  } catch (error) {
    console.error('Get department meetings error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Get single meeting
// @route   GET /api/meetings/:id
// @access  Private (All roles)
exports.getMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json(formatResponse(false, 'Meeting not found'));
    }

    res.status(200).json(formatResponse(true, 'Meeting fetched successfully', meeting));
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Update meeting
// @route   PUT /api/meetings/:id
// @access  Private (CEO, Manager, Team Lead - creator only)
exports.updateMeeting = async (req, res) => {
  try {
    const { title, department, date, time, duration, meetingLink, description, status } = req.body;

    let meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json(formatResponse(false, 'Meeting not found'));
    }

    // Check if user is creator or CEO/Manager
    const isCreator = meeting.createdById.toString() === req.user._id.toString();
    const isCEO = req.user.role === 'CEO';
    const isManager = req.user.role === 'Manager' || req.user.role === 'COO';

    if (!isCreator && !isCEO && !isManager) {
      return res.status(403).json(formatResponse(false, 'Not authorized to update this meeting'));
    }

    // Update fields
    if (title) meeting.title = title;
    if (department) meeting.department = department;
    if (date) meeting.date = date;
    if (time) meeting.time = time;
    if (duration) meeting.duration = duration;
    if (meetingLink) meeting.meetingLink = meetingLink;
    if (description) meeting.description = description;
    if (status) meeting.status = status;

    await meeting.save();

    res.status(200).json(formatResponse(true, 'Meeting updated successfully', meeting));
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private (CEO, Manager only)
exports.deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json(formatResponse(false, 'Meeting not found'));
    }

    // Check if user is CEO or Manager
    //if (req.user.role !== 'CEO' && req.user.role !== 'Manager') {
    //  return res.status(403).json(formatResponse(false, 'Not authorized to delete meetings'));
   // }

    await Meeting.findByIdAndDelete(req.params.id);

    res.status(200).json(formatResponse(true, 'Meeting deleted successfully'));
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};

// @desc    Add attendee to meeting
// @route   POST /api/meetings/:id/attend
// @access  Private (All roles)
exports.addAttendee = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json(formatResponse(false, 'Meeting not found'));
    }

    const userName = `${req.user.firstName} ${req.user.lastName}`;

    // Check if already attending
    if (!meeting.attendees.includes(userName)) {
      meeting.attendees.push(userName);
      await meeting.save();
    }

    res.status(200).json(formatResponse(true, 'Joined meeting successfully', {
      attendees: meeting.attendees
    }));
  } catch (error) {
    console.error('Add attendee error:', error);
    res.status(500).json(formatResponse(false, error.message));
  }
};
