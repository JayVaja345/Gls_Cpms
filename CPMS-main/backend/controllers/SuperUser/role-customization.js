const mongoose = require("mongoose");
const User = require("../../models/user.model");
const Role = require("../../models/roles");

// OPTIONAL: validate against a whitelist of permissions.
// Keep this in sync with your frontend keys (or import from a shared config).
const ALLOWED_PERMS = new Set([
  "dashboard_view",
  "students_list",
  "students_approve",

  "company_list",
  "company_add",
  "company_edit",
  "company_delete",

  "job_list",
  "job_add",
  "job_edit",
  "job_delete",

  "notice_list",
  "notice_add",
  "notice_delete",

  "tpo_list",
  "tpo_add",
  "tpo_delete",
]);

const viewUser = async (req, res) => {
  try {
    const findData = await User.find({
      role: { $in: ["tpo_admin", "management_admin"] }
    });
    if (!findData || findData.length === 0) {
      return res.status(404).json({ msg: "Data Not Found" });
    }
    return res.json({ findData });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

const addRolePer = async (req, res) => {
  try {
    const { role, access } = req.body;

    if (!role || typeof role !== "string") {
      return res.status(400).json({ success: false, msg: "role is required (string)" });
    }
    if (!Array.isArray(access)) {
      return res.status(400).json({ success: false, msg: "access must be an array of strings" });
    }

    const cleanRole = role.trim().toLowerCase();
    const cleanAccess = [
  ...new Set(
    access
      .filter((p) => typeof p === "string")
      .map((p) => p.trim().toLowerCase().replace(/:/g, "_"))
      .filter((p) => p.length > 0)
  ),
];


    const invalid = cleanAccess.filter((p) => !ALLOWED_PERMS.has(p));
    if (invalid.length > 0) {
      return res.status(400).json({
        success: false,
        msg: "Invalid permission(s) provided",
        invalid,
      });
    }

    const doc = await Role.findOneAndUpdate(
      { role: cleanRole },
      { $set: { role: cleanRole, access: cleanAccess } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Role saved successfully",
      data: doc,
    });
  } catch (err) {
    console.error("addRolePer error:", err);
    return res.status(500).json({ success: false, msg: "Internal Server Error!" });
  }
};

const viewRolePer = async (req, res) => {
  try {
    const findRolePer = await Role.find({});
    if (!findRolePer || findRolePer.length === 0) {
      return res.status(404).json({ msg: "Data Not Found" });
    }
    return res.json({ findRolePer });
  } catch (err) {
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

/** ✅ UPDATE: PATCH /admin/roles/:id */
const updateRolePer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, msg: "Invalid role id" });
    }

    const { role, access } = req.body;
    const $set = {};

    if (role !== undefined) {
      if (typeof role !== "string" || !role.trim()) {
        return res.status(400).json({ success: false, msg: "role must be a non-empty string" });
      }
      const cleanRole = role.trim().toLowerCase();

      // ensure uniqueness if role is changing
      const existing = await Role.findOne({ role: cleanRole, _id: { $ne: id } });
      if (existing) {
        return res.status(409).json({ success: false, msg: "role already exists" });
      }
      $set.role = cleanRole;
    }

    if (access !== undefined) {
      if (!Array.isArray(access)) {
        return res.status(400).json({ success: false, msg: "access must be an array of strings" });
      }
     const cleanAccess = [
  ...new Set(
    access
      .filter((p) => typeof p === "string")
      .map((p) => p.trim().toLowerCase().replace(/:/g, "_"))
      .filter((p) => p.length > 0)
  ),
];



      const invalid = cleanAccess.filter((p) => !ALLOWED_PERMS.has(p));
      if (invalid.length > 0) {
        return res.status(400).json({
          success: false,
          msg: "Invalid permission(s) provided",
          invalid,
        });
      }
      $set.access = cleanAccess;
    }

    if (Object.keys($set).length === 0) {
      return res.status(400).json({ success: false, msg: "Nothing to update" });
    }

    const updated = await Role.findByIdAndUpdate(
      id,
      { $set },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, msg: "Role not found" });
    }

    return res.json({ success: true, msg: "Role updated successfully", data: updated });
  } catch (err) {
    console.error("updateRolePer error:", err);
    return res.status(500).json({ success: false, msg: "Internal Server Error!" });
  }
};

/** ✅ DELETE: DELETE /admin/roles/:id */
const deleteRolePer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, msg: "Invalid role id" });
    }

    const deleted = await Role.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, msg: "Role not found" });
    }

    return res.json({ success: true, msg: "Role deleted successfully" });
  } catch (err) {
    console.error("deleteRolePer error:", err);
    return res.status(500).json({ success: false, msg: "Internal Server Error!" });
  }
};

const grantPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: "Invalid user id" });
    }

    if (!permission) {
      return res.status(400).json({ msg: "permission is required" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $addToSet: { UserRoleAccess: permission } }, // prevent duplicates
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "Permission granted", data: updated });
  } catch (err) {
    console.error("grantPermission =>", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const revokePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: "Invalid user id" });
    }

    if (!permission) {
      return res.status(400).json({ msg: "permission is required" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $pull: { UserRoleAccess: permission } }, // remove the permission
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "Permission revoked", data: updated });
  } catch (err) {
    console.error("revokePermission =>", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};


module.exports = {
  viewUser,
  addRolePer,
  viewRolePer,
  updateRolePer,
  deleteRolePer,
  grantPermission,
  revokePermission
};
