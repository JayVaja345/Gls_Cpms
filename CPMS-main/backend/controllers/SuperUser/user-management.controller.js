const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const Role = require("../../models/roles")
const generatePassword = require("../../utlis/generatePassword");
const sendMail = require("../../config/Nodemailer");
const emailTemplate = require("../../utlis/emailTemplates");
const { logAudit } = require('../../utils/auditLogger');

// get management user
const managementUsers = async (req, res) => {
  const managementUsers = await User.find({ role: "management_admin" });
  res.json({ managementUsers });
}

const managementAddUsers = async (req, res) => {
  const email = req.body.email;
  const first_name = req.body.first_name
  try {
    if (await User.findOne({ email }))
    return res.json({ msg: "User Already Exists!" });

    const generatedPassword = generatePassword();

    const hashPassword = await bcrypt.hash(generatedPassword, 10);

    const selectedRole = "management_admin";

    const roleData = await Role.findOne({ role: selectedRole });

    if (!roleData) {
      return res.status(400).json({ msg: "Role not found in system!" });
    }

    const newUser = new User({
      first_name: req.body.first_name,
      email: req.body.email,
      number: req.body.number,
      password: hashPassword,
      role: selectedRole,
      UserRoleAccess: roleData.access
    });    

    await newUser.save();

    const html = emailTemplate({
        role: "Management Admin",
        name: first_name,
        email: email,
        password: generatedPassword
    });

    const subject = "Welcome to CPMS | Your Login Credentials as a Management Admin";
    
    await sendMail(email, subject, html);

    // audit log
    logAudit(req, {
      actionType: 'MANAGEMENT_USER_CREATED',
      description: `Created management admin: ${newUser.email}`
    });
    return res.json({ msg: "User Created!" });
  } catch (error) {
    console.log("admin.user-management => ", error);
    return res.json({ msg: "Internal Server Error!" });
  }
}

const managementDeleteUsers = async (req, res) => {
  // const user = await Users.find({email: req.body.email});
  const ress = await User.deleteOne({ email: req.body.email });
  if (ress.acknowledged) {
    // audit log
    logAudit(req, {
      actionType: 'MANAGEMENT_USER_DELETED',
      description: `Deleted management admin: ${req.body.email}`
    });
    return res.json({ msg: "User Deleted Successfully!" });
  } else {
    return res.json({ msg: "Error While Deleting User!" });
  }
}


module.exports = {
  managementUsers,
  managementAddUsers,
  managementDeleteUsers
};