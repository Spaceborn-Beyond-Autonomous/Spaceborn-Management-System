const Resource = require('../models/Resource');
const ResourceRequest = require('../models/ResourceRequest');

/**
 * Get Available Resources
 */
exports.getAvailableResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .sort({ name: 1 });

    const formatted = resources.map(resource => ({
      id: resource._id,
      name: resource.name,
      type: resource.type,
      available: resource.available,
      total: resource.total,
      unit: resource.unit || 'units'
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources'
    });
  }
};

/**
 * Resource Allocation Table
 */
exports.getResourceAllocation = async (req, res) => {
  try {
    const { status, type, search } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.name = {
        $regex: search,
        $options: 'i'
      };
    }

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json(resources);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch allocations'
    });
  }
};

/**
 * Resource Statistics
 */
exports.getResourceStats = async (req, res) => {
  try {
    const resources = await Resource.find();

    const pendingRequests = await ResourceRequest.countDocuments({
      status: 'pending'
    });

    const totalResources = resources.length;

    const equipmentTotal = resources.reduce(
      (sum, r) => sum + (r.total || 0),
      0
    );

    const equipmentUsed = resources.reduce(
      (sum, r) => sum + (r.allocated || 0),
      0
    );

    const budgetUsed = resources.reduce(
      (sum, r) => sum + (Number(r.budgetUsed || 0)),
      0
    );

    const budgetTotal = resources.reduce(
      (sum, r) => sum + (Number(r.budgetTotal || 0)),
      0
    );

    const cloudResources = resources.filter(
      r => r.type === 'Cloud'
    );

    const cloudCreditsUtilization =
      cloudResources.length > 0
        ? Math.round(
            cloudResources.reduce(
              (sum, r) =>
                sum +
                ((r.allocated || 0) /
                  (r.total || 1)) *
                  100,
              0
            ) / cloudResources.length
          )
        : 0;

    res.status(200).json({
      totalResources,
      equipmentUsed,
      equipmentTotal,
      budgetUsed,
      budgetTotal,
      cloudCreditsUtilization,
      pendingRequests
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
};

/**
 * Resource Types
 */
exports.getResourceTypes = async (req, res) => {
  try {
    const types = [
      'Hardware',
      'Software',
      'Cloud',
      'License',
      'Facility',
      'Other'
    ];

    res.status(200).json(types);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch types'
    });
  }
};

/**
 * Resource Tracking
 */
exports.getTrackingHistory = async (req, res) => {
  try {
    const requests = await ResourceRequest.find({
      status: {
        $in: ['approved', 'rejected']
      }
    })
      .sort({ updatedAt: -1 })
      .limit(100);

    const tracking = requests.map(item => ({
      id: item._id,
      resourceName: item.resourceName,
      resourceType: item.resourceType,
      action: item.status,
      user: item.requesterName,
      department: item.department,
      timestamp:
        item.approvedAt ||
        item.rejectedAt ||
        item.updatedAt,
      details:
        item.status === 'approved'
          ? `Approved by ${item.approvedByName || item.approvedBy || item.requesterName || 'Unknown'}`
          : `Rejected by ${item.rejectedByName || item.rejectedBy || item.requesterName || 'Unknown'}`
    }));

    res.status(200).json(tracking);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking history'
    });
  }
};

/**
 * Create Resource
 */
exports.createResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to create resource'
    });
  }
};

/**
 * Update Resource
 */
exports.updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to update resource'
    });
  }
};

/**
 * Delete Resource
 */
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(
      req.params.id
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete resource'
    });
  }
};