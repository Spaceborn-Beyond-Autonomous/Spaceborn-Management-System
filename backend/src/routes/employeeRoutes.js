const express = require('express');
const multer = require('multer');
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
  uploadEmployeeDocument,
} = require('../controllers/userController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    cb(null, allowedMimeTypes.includes(file.mimetype));
  }
});

router.use(protect);

router.get('/departments', authorize('CEO', 'COO', 'Manager', 'Team Lead'), getEmployeeDepartments);
router.get('/stats', authorize('CEO', 'COO', 'Manager'), getEmployeeStats);
router.get('/search', authorize('CEO', 'COO', 'Manager', 'Team Lead'), searchEmployees);
router.get('/email/:email', authorize('CEO', 'COO', 'Manager', 'Team Lead'), getEmployeeByEmail);
router.get('/employee-id/:employeeId', authorize('CEO', 'COO', 'Manager', 'Team Lead'), getEmployeeByEmployeeId);
router.get('/department/:department', authorize('CEO', 'COO', 'Manager', 'Team Lead'), getEmployeesByDepartment);
router.get('/role/:role', authorize('CEO', 'COO', 'Manager'), getEmployeesByRole);
router.get('/manager/:managerId', authorize('CEO', 'COO', 'Manager', 'Team Lead'), getEmployeesByManager);
router.post('/:id/documents', authorize('CEO', 'COO', 'Manager'), upload.single('document'), uploadEmployeeDocument);
router.get('/:id/leave-balance', getLeaveBalance);
router.patch('/:id/leave-balance', authorize('CEO', 'COO', 'Manager'), updateLeaveBalance);
router.get('/:id', authorize('CEO', 'COO', 'Manager', 'Team Lead'), getEmployeeById);
router.put('/:id', authorize('CEO', 'COO', 'Manager'), updateEmployee);
router.delete('/:id', authorize('CEO', 'COO', 'Manager'), deleteEmployee);
router.get('/', authorize('CEO', 'COO', 'Manager', 'Team Lead'), getEmployees);
router.post('/', authorize('CEO', 'COO', 'Manager'), createEmployee);

module.exports = router;
