const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  resetPassword,
  deactivateEmployee,
  activateEmployee,
  hasRole
} = require('../controllers/userController');

// Public routes (none)

// Protected routes - Manager and CEO only
router.post('/create', protect, authorize('CEO', 'COO', 'Manager'), createEmployee);
router.get('/', protect, authorize('CEO', 'COO', 'Manager', 'Team Lead'), getAllEmployees);
router.get('/:id/has-role/:role', protect, hasRole);
router.get('/:id', protect, authorize('CEO', 'COO', 'Manager'), getEmployee);
router.put('/:id', protect, authorize('CEO', 'COO', 'Manager'), updateEmployee);
router.post('/:id/reset-password', protect, authorize('CEO', 'COO', 'Manager'), resetPassword);
router.post('/:id/deactivate', protect, authorize('CEO', 'COO', 'Manager'), deactivateEmployee);
router.post('/:id/activate', protect, authorize('CEO', 'COO', 'Manager'), activateEmployee);
router.delete('/:id', protect, authorize('CEO', 'COO', 'Manager'), deleteEmployee);
router.post('/:id/terminate', protect, authorize('CEO', 'COO', 'Manager'), deleteEmployee);

module.exports = router;
