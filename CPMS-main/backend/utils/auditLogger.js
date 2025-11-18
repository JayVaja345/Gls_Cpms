const AuditLog = require('../models/AuditLog');

async function logAudit(req, details) {
  try {
    const { actionType, description, performedBy, role, timestamp } = details || {};
    await AuditLog.create({
      actionType: actionType || 'GENERAL',
      description: description || '',
      performedBy: performedBy || (req.user ? (req.user.email || String(req.user._id)) : 'system'),
      role: role || (req.user ? req.user.role : 'system'),
      timestamp: timestamp || undefined
    });
  } catch (error) {
    console.log('auditLogger.logAudit =>', error);
  }
}

module.exports = { logAudit };


