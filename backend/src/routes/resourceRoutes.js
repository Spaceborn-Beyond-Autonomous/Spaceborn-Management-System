const express = require('express');
const router = express.Router();

const resourceInventoryController = require('../controllers/resourceInventoryController');
const resourceController = require('../controllers/resourceController');

console.log('✅ RESOURCE ROUTES LOADED');

const { protect, authorize } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/*
|--------------------------------------------------------------------------
| Resource Requests
|--------------------------------------------------------------------------
*/

// Create Request
router.post(
  '/requests',
  protect,
  resourceController.createRequest
);

// My Requests
router.get(
  '/my-requests',
  protect,
  resourceController.getMyRequests
);

// Pending Requests
router.get(
  '/pending',
  protect,
  resourceController.getPendingRequests
);

// All Requests
router.get(
  '/all-requests',
  protect,
  resourceController.getAllRequests
);

// Frontend compatibility: src/services/api.js and dashboard panels call
// GET /api/resources/requests for request lists.
router.get(
  '/requests',
  protect,
  resourceController.getRequests
);

// Approve Request
router.put(
  '/requests/:id/approve',
  protect,
  resourceController.approveRequest
);

// Reject Request
router.put(
  '/requests/:id/reject',
  protect,
  resourceController.rejectRequest
);

// Delete Request
router.delete(
  '/requests/:id',
  protect,
  resourceController.deleteRequest
);

/*
|--------------------------------------------------------------------------
| Resource Inventory
|--------------------------------------------------------------------------
*/

router.get(
  '/available',
  protect,
  resourceInventoryController.getAvailableResources
);

router.get(
  '/allocation',
  protect,
  resourceInventoryController.getResourceAllocation
);

router.get(
  '/stats',
  protect,
  resourceInventoryController.getResourceStats
);

router.get(
  '/types',
  protect,
  resourceInventoryController.getResourceTypes
);

router.get(
  '/tracking',
  protect,
  resourceInventoryController.getTrackingHistory
);

router.post(
  '/',
  protect,
  resourceInventoryController.createResource
);

router.put(
  '/:id',
  protect,
  resourceInventoryController.updateResource
);

router.delete(
  '/:id',
  protect,
  resourceInventoryController.deleteResource
);

module.exports = router;
