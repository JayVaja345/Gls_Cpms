const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/auth.middleware');
const { addAuditLog, getAuditLogs, clearAuditLogs } = require('../controllers/auditLogController');

// Add a new log entry (authenticated)
router.post('/logs', authenticateToken, addAuditLog);

// Get all logs (Super Admin only)
router.get('/logs', authenticateToken, getAuditLogs);

// Clear all logs (Super Admin only)
router.delete('/logs', authenticateToken, clearAuditLogs);

module.exports = router;


