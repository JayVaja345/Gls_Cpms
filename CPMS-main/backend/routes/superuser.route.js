const express = require('express');

// router after /admin/
const router = express.Router();

const authenticateToken = require('../middleware/auth.middleware');

const Login = require('../controllers/SuperUser/login.controller.js');

// management methods
const { managementUsers, managementAddUsers, managementDeleteUsers } = require('../controllers/SuperUser/user-management.controller.js');
// tpo methods
const { tpoUsers, tpoAddUsers, tpoDeleteUsers } = require('../controllers/SuperUser/user-tpo.controller.js');
// student methods
const { studentUsers, studentAddUsers, studentDeleteUsers, studentApprove } = require('../controllers/SuperUser/user-student.controller.js');
// alumni methods
const { 
  getAllAlumni, 
  getAlumniById, 
  getAlumniByFilters, 
  createAlumni, 
  updateAlumni, 
  deleteAlumni,
  getPlacementStats,
  getPassingYears
} = require('../controllers/SuperUser/alumni.controller.js');
// user block/unblock methods
const { 
  getAllUsersWithStatus, 
  toggleUserStatus, 
  deactivateUser, 
  activateUser 
} = require('../controllers/SuperUser/user-block.controller.js');



router.post('/login', Login);

// management routes
router.get('/management-users', authenticateToken, managementUsers);
router.post('/management-add-user', authenticateToken, managementAddUsers);
router.post('/management-delete-user', authenticateToken, managementDeleteUsers);

// tpo routes
router.get('/tpo-users', authenticateToken, tpoUsers);
router.post('/tpo-add-user', authenticateToken, tpoAddUsers);
router.post('/tpo-delete-user', authenticateToken, tpoDeleteUsers);

// student routes
router.get('/student-users', authenticateToken, studentUsers);
router.post('/student-add-user', authenticateToken, studentAddUsers);
router.post('/student-delete-user', authenticateToken, studentDeleteUsers);
// approve student
router.post('/student-approve', authenticateToken, studentApprove);

// alumni routes
router.get('/alumni', authenticateToken, getAllAlumni);
router.get('/alumni/stats', authenticateToken, getPlacementStats);
router.get('/alumni/years', authenticateToken, getPassingYears);
router.get('/alumni/filter', authenticateToken, getAlumniByFilters);
router.get('/alumni/:id', authenticateToken, getAlumniById);
router.post('/alumni', authenticateToken, createAlumni);
router.put('/alumni/:id', authenticateToken, updateAlumni);
router.delete('/alumni/:id', authenticateToken, deleteAlumni);

// user block/unblock routes
router.get('/users/status', authenticateToken, getAllUsersWithStatus);
router.post('/users/toggle-status', authenticateToken, toggleUserStatus);
router.post('/users/deactivate', authenticateToken, deactivateUser);
router.post('/users/activate', authenticateToken, activateUser);


module.exports = router;