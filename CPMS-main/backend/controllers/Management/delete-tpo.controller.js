const Users = require('../../models/user.model');
const { logAudit } = require('../../utils/auditLogger');

const DeleteTPO = async (req, res) => {
  // const user = await Users.find({email: req.body.email});
  const ress = await Users.deleteOne({ email: req.body.email });
  if (ress.acknowledged) {
    // audit log
    logAudit(req, {
      actionType: 'TPO_USER_DELETED',
      description: `Deleted TPO admin: ${req.body.email}`
    });
    return res.json({ msg: "User Deleted Successfully!" });
  } else {
    return res.json({ msg: "Error While Deleting User!" });
  }
}

module.exports = DeleteTPO;