const AuditLog = require('../models/AuditLog');

// Ensure only super admin can access read/clear operations
function assertSuperAdmin(req, res) {
  if (!req.user || req.user.role !== 'superuser') {
    res.status(403).json({ msg: 'Forbidden: Super Admin only' });
    return false;
  }
  return true;
}

// POST /audit/logs → Add a new log entry
async function addAuditLog(req, res) {
  try {
    const { actionType, description, performedBy, role, timestamp } = req.body || {};

    const log = await AuditLog.create({
      actionType: actionType || 'GENERAL',
      description: description || '',
      performedBy: performedBy || (req.user ? (req.user.email || String(req.user._id)) : 'system'),
      role: role || (req.user ? req.user.role : 'system'),
      timestamp: timestamp || undefined
    });

    res.status(201).json({ msg: 'Log created', log });
  } catch (error) {
    console.log('auditLogController.addAuditLog =>', error);
    res.status(500).json({ msg: 'Failed to create log' });
  }
}

// GET /audit/logs → Get all logs (latest first) [Super Admin]
async function getAuditLogs(req, res) {
  try {
    if (!assertSuperAdmin(req, res)) return;

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
    const skip = (page - 1) * limit;

    const emailQuery = (req.query.email || '').trim();
    const typeQuery = (req.query.type || '').toLowerCase();
    const filter = {};
    if (emailQuery) filter.performedBy = { $regex: emailQuery, $options: 'i' };
    if (typeQuery === 'created') filter.actionType = { $regex: 'create|post|add', $options: 'i' };
    if (typeQuery === 'updated') filter.actionType = { $regex: 'update|approv|status', $options: 'i' };
    if (typeQuery === 'deleted') filter.actionType = { $regex: 'delete', $options: 'i' };

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter)
    ]);

    res.status(200).json({ logs, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.log('auditLogController.getAuditLogs =>', error);
    res.status(500).json({ msg: 'Failed to fetch logs' });
  }
}

// DELETE /audit/logs → Clear logs [Super Admin]
async function clearAuditLogs(req, res) {
  try {
    if (!assertSuperAdmin(req, res)) return;

    await AuditLog.deleteMany({});
    res.status(200).json({ msg: 'All logs cleared' });
  } catch (error) {
    console.log('auditLogController.clearAuditLogs =>', error);
    res.status(500).json({ msg: 'Failed to clear logs' });
  }
}

module.exports = {
  addAuditLog,
  getAuditLogs,
  clearAuditLogs
};


