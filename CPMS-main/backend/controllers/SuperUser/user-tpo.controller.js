const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const Role = require("../../models/roles")
const generatePassword = require("../../utlis/generatePassword");
const sendMail = require("../../config/Nodemailer");
const emailTemplate = require("../../utlis/emailTemplates");

const tpoUsers = async (req, res) => {
  const tpoUsers = await User.find({ role: "tpo_admin" });
  res.json({ tpoUsers })
}

const tpoAddUsers = async (req, res) => {
  const email = req.body.email;
  const first_name = req.body.first_name

  try {
    if (await User.findOne({ email }))
      return res.json({ msg: "User Already Exists!" });

    console.log(req.body.password)
    const generatedPassword = generatePassword();

    const hashPassword = await bcrypt.hash(generatedPassword, 10);

    const selectedRole = "tpo_admin";

    const roleData = await Role.findOne({ role: selectedRole });
    if (!roleData) {
      return res.status(400).json({ msg: "Role not found in system!" });
    }

    console.log("ROLE DATA => ", roleData);
    console.log("ROLE ACCESS => ", roleData.access);


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
        role: "TPO",
        name: first_name,
        email: email,
        password: generatedPassword
      });
    const subject = "Welcome to CPMS | Your Login Credentials as a TPO";
    
    await sendMail(email, subject, html);
    

    return res.json({ msg: "User Created!" });
  } catch (error) {
    console.log("user-tpo.controller => ", error);
    return res.json({ msg: "Internal Server Error!" });
  }
}

const tpoDeleteUsers = async (req, res) => {
  // const user = await Users.find({email: req.body.email});
  const ress = await User.deleteOne({ email: req.body.email });
  if (ress.acknowledged) {
    return res.json({ msg: "User Deleted Successfully!" });
  } else {
    return res.json({ msg: "Error While Deleting User!" });
  }
}


module.exports = {
  tpoUsers,
  tpoAddUsers,
  tpoDeleteUsers
};