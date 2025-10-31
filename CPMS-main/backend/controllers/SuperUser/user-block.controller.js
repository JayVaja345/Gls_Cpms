const User = require("../../models/user.model");

// Get all users with their status
const getAllUsersWithStatus = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'superuser' } })
      .select('first_name middle_name last_name email role status createdAt')
      .sort({ createdAt: -1 });
    
    return res.json({ users });
  } catch (error) {
    console.log("user-block.controller => getAllUsersWithStatus => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Toggle user status (activate/deactivate)
const toggleUserStatus = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    // Prevent deactivating superuser accounts
    if (user.role === 'superuser') {
      return res.status(403).json({ msg: "Cannot deactivate superuser accounts!" });
    }

    // Toggle status
    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    const action = user.status === 'active' ? 'activated' : 'deactivated';
    return res.json({ 
      msg: `User ${action} successfully!`,
      status: user.status 
    });
  } catch (error) {
    console.log("user-block.controller => toggleUserStatus => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Deactivate user
const deactivateUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    // Prevent deactivating superuser accounts
    if (user.role === 'superuser') {
      return res.status(403).json({ msg: "Cannot deactivate superuser accounts!" });
    }

    if (user.status === 'inactive') {
      return res.status(400).json({ msg: "User is already deactivated!" });
    }

    user.status = 'inactive';
    // Clear token to force logout
    user.token = null;
    await user.save();

    return res.json({ msg: "User deactivated successfully!" });
  } catch (error) {
    console.log("user-block.controller => deactivateUser => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Activate user
const activateUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    if (user.status === 'active') {
      return res.status(400).json({ msg: "User is already active!" });
    }

    user.status = 'active';
    await user.save();

    return res.json({ msg: "User activated successfully!" });
  } catch (error) {
    console.log("user-block.controller => activateUser => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

module.exports = {
  getAllUsersWithStatus,
  toggleUserStatus,
  deactivateUser,
  activateUser
};
