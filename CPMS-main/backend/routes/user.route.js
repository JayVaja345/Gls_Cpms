const express = require('express');

// router after /user/
const router = express.Router();

// import multer for user profile update 
const upload = require('../config/Multer.js');

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authenticateToken = require('../middleware/auth.middleware');

function verifyRole(req, res, next) {
  try {
    const normalizePerm = (s) =>
      String(s || "")
        .trim()
        .toLowerCase()
        .replace(/:/g, "_");
        
    const user = req.user;
    // console.log("User in verifyRole:", user);

    if(user.role === 'superuser' || user.role === 'student') {
      return next();
    }
    
    const normalizedAccess = Array.isArray(user?.UserRoleAccess)
      ? user.UserRoleAccess.map(normalizePerm)
      : [];

    if (!user) {
      return res.status(401).json({ msg: "Please login first." });
    }

    // Get required access from query, params, body or header
    const requiredAccess =
      req.query?.access ||
      req.params?.access ||
      req.body?.access ||
      req.header("x-access");

    // If no access parameter is provided but the user is logged in, allow access
    if (!requiredAccess) {
      return next();
    }

    // Normalize the required access to use underscores
    const normalizedRequiredAccess = normalizePerm(requiredAccess);

    if (!normalizedAccess.includes(normalizedRequiredAccess)) {
      return res.status(403).json({ 
        msg: "Forbidden: Insufficient permission",
        required: normalizedRequiredAccess,
        available: normalizedAccess 
      });
    }

    next();
  } catch (err) {
    console.error("verifyRole error:", err);
    return res.status(500).json({ msg: "Internal server error" });
  }
}


// users controller methods
const UserDetail = require('../controllers/user/user.detail.controller.js');
const AllUsersLen = require('../controllers/user/user.all-users.controller.js');
const UpdatePhoto = require('../controllers/user/user.update-photo.controller.js');
const UpdateProfile = require('../controllers/user/user.update-profile.controller.js');
const UpdatePassword = require('../controllers/user/user.update-password.js');
const UserData = require('../controllers/user/user.show-data.js');

// details of users student
router.get('/detail', authenticateToken, verifyRole, UserDetail);

// all user in lenght 
router.get('/all-users', authenticateToken, verifyRole, AllUsersLen);

router.get('/:userId', authenticateToken, UserData);

router.post('/upload-photo', upload.single('profileImgs'), UpdatePhoto);

router.post('/update-profile', authenticateToken, UpdateProfile);

router.post('/change-password', authenticateToken, UpdatePassword);

// Export both the router and verifyRole middleware
module.exports = { 
  router,
  verifyRole
};