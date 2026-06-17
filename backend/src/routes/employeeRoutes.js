const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  getEmployeeByEmail,
  getEmployeeByEmployeeId,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  getEmployeesByRole,
  getEmployeesByManager,
  getEmployeeDepartments,
  getEmployeeStats,
  getLeaveBalance,
  updateLeaveBalance,
  searchEmployees,
} = require('../controllers/userController');

router.use(protect);

router.get('/departments', authorize('CEO', 'Manager', 'Team Lead'), getEmployeeDepartments);
router.get('/stats', authorize('CEO', 'Manager'), getEmployeeStats);
router.get('/search', authorize('CEO', 'Manager', 'Team Lead'), searchEmployees);
router.get('/email/:email', authorize('CEO', 'Manager', 'Team Lead'), getEmployeeByEmail);
router.get('/employee-id/:employeeId', authorize('CEO', 'Manager', 'Team Lead'), getEmployeeByEmployeeId);
router.get('/department/:department', authorize('CEO', 'Manager', 'Team Lead'), getEmployeesByDepartment);
router.get('/role/:role', authorize('CEO', 'Manager'), getEmployeesByRole);
router.get('/manager/:managerId', authorize('CEO', 'Manager', 'Team Lead'), getEmployeesByManager);
router.get('/:id/leave-balance', getLeaveBalance);
router.patch('/:id/leave-balance', authorize('CEO', 'Manager'), updateLeaveBalance);
router.get('/:id', authorize('CEO', 'Manager', 'Team Lead'), getEmployeeById);
router.put('/:id', authorize('CEO', 'Manager'), updateEmployee);
router.delete('/:id', authorize('CEO', 'Manager'), deleteEmployee);
router.get('/', authorize('CEO', 'Manager', 'Team Lead'), getEmployees);
router.post('/', authorize('CEO', 'Manager'), createEmployee);

module.exports = router;
