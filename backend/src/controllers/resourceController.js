// src/controllers/resourceController.js
console.log('RESOURCE CONTROLLER FILE EXECUTING');
const ResourceRequest = require('../models/ResourceRequest');
const User = require('../models/User');
const {
  notifyResourceRequested,
  notifyResourceDecision
} = require('../utils/notificationDispatcher');

const normalizeRoleForRequest = (role = 'Member') => {
  if (role === 'Team Lead') return 'TeamLead';
  return role;
};

/**
 * Create Resource Request
 */
exports.createRequest = async (req, res) => {
  try {
    const {
      resourceName,
      resourceType,
      quantity,
      reason,
      priority
    } = req.body;

    // requester comes from auth middleware in normal flow.
    // But for correctness (especially when frontend sends explicit requester details),
    // prefer request body fields for name/role/department when present.
    const requester = req.user?._id || req.body.requester;

    const requesterName =
      req.body.requesterName ||
      req.body.requestorName ||
      req.body.userName ||
      req.body.fullName ||
      req.body.employeeName ||
      req.user?.name;

    const requesterRole = normalizeRoleForRequest(
      req.body.requesterRole ||
      req.user?.role
    );


    const department =
      req.body.department ||
      req.user?.department ||
      '';


    

    const request = await ResourceRequest.create({
      requester,
      requesterName,
      requesterRole: requesterRole,

      department,
      resourceName,
      resourceType,
      quantity,
      reason,
      priority,
      approvalLevel: req.body.approvalLevel || 'TeamLead'
    });

    await notifyResourceRequested(request);

    res.status(201).json({
      success: true,
      message: 'Resource request created successfully',
      data: request
    });
  } catch (error) {
    console.error('Create Request Error:', error);

    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create request',
      details: error?.errors || error
    });
  }
};

/**
 * Get My Requests
 */
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ResourceRequest.find({
      requester: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get My Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
};

/**
 * Get Pending Requests
 *
 * TeamLead -> Member requests
 * Manager -> Member + TeamLead requests
 * CEO -> All pending requests
 */
exports.getPendingRequests = async (req, res) => {
  try {
    let filter = {
      status: 'pending'
    };

    if (normalizeRoleForRequest(req.user.role) === 'TeamLead') {
      filter.requesterRole = 'Member';
    }

    if (req.user.role === 'Manager' || req.user.role === 'COO') {
      filter.requesterRole = {
        $in: ['Member', 'TeamLead']
      };
    }

    // Only match pending requests; requesterName fields should represent the actual requester.
    // No additional filtering/mapping should override requester fields.


    const requests = await ResourceRequest.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get Pending Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests'
    });
  }
};

/**
 * Get All Requests
 * CEO / Manager Only
 */
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ResourceRequest.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get All Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
};

/**
 * Get Requests
 * Compatibility endpoint for GET /api/resources/requests.
 */
exports.getRequests = async (req, res) => {
  try {
    const filter = {};
    const { status, department, requester } = req.query;

    if (status) filter.status = status;
    if (department) filter.department = department;
    if (requester === 'me') filter.requester = req.user._id;

    if ((req.user.role === 'Manager' || req.user.role === 'COO') && !department) {
      filter.department = req.user.department;
    }

    const requests = await ResourceRequest.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Get Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource requests'
    });
  }
};

/**
 * Approve Request
 */
exports.approveRequest = async (req, res) => {
  try {
    const request = await ResourceRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request already processed'
      });
    }

    request.status = 'approved';
    request.approvedBy = req.user._id;
    request.approvedByName = req.user.name;
    request.approvedAt = new Date();

    await request.save();

    await notifyResourceDecision(request, 'approved');

    res.status(200).json({
      success: true,
      message: 'Request approved successfully',
      data: {
        ...request.toObject(),
        id: request._id
      }
    });
  } catch (error) {
    console.error('Approve Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve request'
    });
  }
};

/**
 * Reject Request
 */
exports.rejectRequest = async (req, res) => {
  try {
    const request = await ResourceRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request already processed'
      });
    }

    request.status = 'rejected';
    request.rejectedBy = req.user._id;
    request.rejectedByName = req.user.name;
    request.rejectedAt = new Date();

    await request.save();

    await notifyResourceDecision(request, 'rejected');

    res.status(200).json({
      success: true,
      message: 'Request rejected',
      data: {
        ...request.toObject(),
        id: request._id
      }
    });
  } catch (error) {
    console.error('Reject Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request'
    });
  }
};

/**
 * Delete Own Request
 */
exports.deleteRequest = async (req, res) => {
  try {
    const request = await ResourceRequest.findOne({
      _id: req.params.id,
      requester: req.user._id
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Processed requests cannot be deleted'
      });
    }

    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Delete Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete request'
    });
  }
};
console.log('RESOURCE CONTROLLER EXPORTS:', module.exports);
