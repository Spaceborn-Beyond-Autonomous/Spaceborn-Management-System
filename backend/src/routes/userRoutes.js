const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  resetPassword,
  deactivateEmployee,
  activateEmployee,
  hasRole
} = require('../controllers/userController');

// Public routes (none)

// Protected routes - Manager and CEO only
router.post('/create', protect, authorize('CEO', 'Manager'), createEmployee);
router.get('/', protect, authorize('CEO', 'Manager', 'Team Lead'), getAllEmployees);
router.get('/:id/has-role/:role', protect, hasRole);
router.get('/:id', protect, authorize('CEO', 'Manager'), getEmployee);
router.put('/:id', protect, authorize('CEO', 'Manager'), updateEmployee);
router.post('/:id/reset-password', protect, authorize('CEO', 'Manager'), resetPassword);
router.post('/:id/deactivate', protect, authorize('CEO', 'Manager'), deactivateEmployee);
router.post('/:id/activate', protect, authorize('CEO', 'Manager'), activateEmployee);

module.exports = router;
