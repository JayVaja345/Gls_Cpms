const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actionType: { type: String },
  description: { type: String },
  performedBy: { type: String },
  role: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);


