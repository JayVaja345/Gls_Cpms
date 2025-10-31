const Alumni = require("../../models/alumni.model");
const User = require("../../models/user.model");

// Get all alumni records
const getAllAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.find()
      .populate('studentId', 'first_name middle_name last_name email')
      .populate('companyId', 'company_name')
      .sort({ passingYear: -1, createdAt: -1 });
    
    return res.json({ alumni });
  } catch (error) {
    console.log("alumni.controller => getAllAlumni => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Get alumni by ID
const getAlumniById = async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id)
      .populate('studentId', 'first_name middle_name last_name email number profile')
      .populate('companyId', 'company_name company_website')
      .populate('createdBy', 'first_name email')
      .populate('lastUpdatedBy', 'first_name email');
    
    if (!alumni) {
      return res.status(404).json({ msg: "Alumni record not found!" });
    }
    
    return res.json({ alumni });
  } catch (error) {
    console.log("alumni.controller => getAlumniById => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Get alumni by filters (year, department, placement status)
const getAlumniByFilters = async (req, res) => {
  try {
    const { passingYear, department, placementStatus } = req.query;
    const filters = {};
    
    if (passingYear) filters.passingYear = parseInt(passingYear);
    if (department) filters.department = department;
    if (placementStatus) filters.placementStatus = placementStatus;
    
    const alumni = await Alumni.find(filters)
      .populate('studentId', 'first_name middle_name last_name email')
      .populate('companyId', 'company_name')
      .sort({ passingYear: -1, lastName: 1 });
    
    return res.json({ alumni, count: alumni.length });
  } catch (error) {
    console.log("alumni.controller => getAlumniByFilters => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Create new alumni record
const createAlumni = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    
    // Check if alumni record already exists for this student
    if (req.body.studentId) {
      const existingAlumni = await Alumni.findOne({ studentId: req.body.studentId });
      if (existingAlumni) {
        return res.status(400).json({ msg: "Alumni record already exists for this student!" });
      }
    }
    
    // Check if UIN already exists
    if (req.body.UIN) {
      const existingUIN = await Alumni.findOne({ UIN: req.body.UIN });
      if (existingUIN) {
        return res.status(400).json({ msg: "UIN already exists!" });
      }
    }
    
    const newAlumni = new Alumni({
      ...req.body,
      createdBy: userId,
      lastUpdatedBy: userId
    });
    
    await newAlumni.save();
    return res.json({ msg: "Alumni record created successfully!", alumni: newAlumni });
  } catch (error) {
    console.log("alumni.controller => createAlumni => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Update alumni record
const updateAlumni = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const alumniId = req.params.id;
    
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ msg: "Alumni record not found!" });
    }
    
    // Check if UIN is being changed and if it already exists
    if (req.body.UIN && req.body.UIN !== alumni.UIN) {
      const existingUIN = await Alumni.findOne({ UIN: req.body.UIN });
      if (existingUIN) {
        return res.status(400).json({ msg: "UIN already exists!" });
      }
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        alumni[key] = req.body[key];
      }
    });
    
    alumni.lastUpdatedBy = userId;
    alumni.updatedAt = Date.now();
    
    await alumni.save();
    return res.json({ msg: "Alumni record updated successfully!", alumni });
  } catch (error) {
    console.log("alumni.controller => updateAlumni => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Delete alumni record
const deleteAlumni = async (req, res) => {
  try {
    const alumniId = req.params.id;
    
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ msg: "Alumni record not found!" });
    }
    
    await Alumni.deleteOne({ _id: alumniId });
    return res.json({ msg: "Alumni record deleted successfully!" });
  } catch (error) {
    console.log("alumni.controller => deleteAlumni => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Get placement statistics
const getPlacementStats = async (req, res) => {
  try {
    const { passingYear } = req.query;
    const filter = passingYear ? { passingYear: parseInt(passingYear) } : {};
    
    const stats = await Alumni.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$placementStatus',
          count: { $sum: 1 },
          avgPackage: { $avg: '$packageOffered' },
          maxPackage: { $max: '$packageOffered' },
          minPackage: { $min: '$packageOffered' }
        }
      }
    ]);
    
    const departmentStats = await Alumni.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: [{ $eq: ['$placementStatus', 'Placed'] }, 1, 0] }
          },
          avgPackage: { $avg: '$packageOffered' }
        }
      }
    ]);
    
    const totalAlumni = await Alumni.countDocuments(filter);
    
    return res.json({ 
      stats, 
      departmentStats, 
      totalAlumni 
    });
  } catch (error) {
    console.log("alumni.controller => getPlacementStats => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

// Get all passing years (for filters)
const getPassingYears = async (req, res) => {
  try {
    const years = await Alumni.distinct('passingYear');
    return res.json({ years: years.sort((a, b) => b - a) });
  } catch (error) {
    console.log("alumni.controller => getPassingYears => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
};

module.exports = {
  getAllAlumni,
  getAlumniById,
  getAlumniByFilters,
  createAlumni,
  updateAlumni,
  deleteAlumni,
  getPlacementStats,
  getPassingYears
};
