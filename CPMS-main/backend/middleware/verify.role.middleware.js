const verifyRole = (req, res, next) => {
  try {
    const normalizePerm = (s) =>
      String(s || "")
        .trim()
        .toLowerCase()
        .replace(/:/g, "_");
        
    const user = req.user;
    const normalizedAccess = Array.isArray(user?.UserRoleAccess)
      ? user.UserRoleAccess.map(normalizePerm)
      : [];

    if (!user) {
      return res.status(401).json({ msg: "Please login first." });
    }

    const requestedAccess = normalizePerm(req.query.access);
    
    if (!requestedAccess) {
      return res.status(403).json({ msg: "Access parameter is required." });
    }

    if (!normalizedAccess.includes(requestedAccess)) {
      return res.status(403).json({ 
        msg: `Permission denied. Required permission: ${requestedAccess}`,
        requiredPermission: requestedAccess,
        userPermissions: normalizedAccess
      });
    }

    next();
  } catch (error) {
    console.error("verify.role.middleware.js error =>", error);
    res.status(500).json({ msg: "Error verifying role permissions" });
  }
};

module.exports = verifyRole;
