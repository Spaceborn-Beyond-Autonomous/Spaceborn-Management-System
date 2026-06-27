const express = require('express');
const router = express.Router();

const resourceInventoryController = require('../controllers/resourceInventoryController');

const authMiddleware = require('../middleware/authMiddleware');

/*
|--------------------------------------------------------------------------
| Resource Inventory
|--------------------------------------------------------------------------
*/

/**
 * Available Resources
 */
router.get(
  '/available',
  authMiddleware,
  resourceInventoryController.getAvailableResources
);

/**
 * Resource Allocation
 */
router.get(
  '/allocation',
  authMiddleware,
  resourceInventoryController.getResourceAllocation
);

/**
 * Resource Statistics
 */
router.get(
  '/stats',
  authMiddleware,
  resourceInventoryController.getResourceStats
);

/**
 * Resource Types
 */
router.get(
  '/types',
  authMiddleware,
  resourceInventoryController.getResourceTypes
);

/**
 * Tracking History
 */
router.get(
  '/tracking',
  authMiddleware,
  resourceInventoryController.getTrackingHistory
);

/**
 * Create Resource
 * CEO Only
 */
router.post(
  '/',
  authMiddleware,
  resourceInventoryController.createResource
);

/**
 * Update Resource
 * CEO Only
 */
router.put(
  '/:id',
  authMiddleware,
  resourceInventoryController.updateResource
);

/**
 * Delete Resource
 * CEO Only
 */
router.delete(
  '/:id',
  authMiddleware,
  resourceInventoryController.deleteResource
);

module.exports = router;