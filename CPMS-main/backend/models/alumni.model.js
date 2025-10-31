const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const alumniSchema = new mongoose.Schema({
  // Basic Information
  studentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Users',
    required: true 
  },
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  contactNumber: { type: Number },
  
  // Academic Information
  UIN: { type: String, required: true, trim: true },
  rollNumber: { type: Number },
  department: { 
    type: String, 
    enum: ['Computer', 'Civil', 'ECS', 'AIDS', 'Mechanical'],
    required: true 
  },
  passingYear: { type: Number, required: true },
  admissionYear: { type: Number },
  CGPA: { type: Number },
  
  // Placement Information
  placementStatus: { 
    type: String, 
    enum: ['Placed', 'Higher Studies', 'Entrepreneur', 'Not Placed', 'Other'],
    default: 'Not Placed'
  },
  
  // Company Details (if placed)
  companyName: { type: String, trim: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  jobTitle: { type: String, trim: true },
  packageOffered: { type: Number }, // In LPA
  joiningDate: { type: Date },
  jobLocation: { type: String, trim: true },
  jobType: { 
    type: String, 
    enum: ['Full Time', 'Part Time', 'Contract', 'Internship'],
    default: 'Full Time'
  },
  
  // Higher Studies Details (if applicable)
  higherStudiesDetails: {
    instituteName: { type: String, trim: true },
    course: { type: String, trim: true },
    country: { type: String, trim: true },
    admissionYear: { type: Number }
  },
  
  // Entrepreneur Details (if applicable)
  entrepreneurDetails: {
    businessName: { type: String, trim: true },
    businessType: { type: String, trim: true },
    startDate: { type: Date }
  },
  
  // Additional Information
  currentCompany: { type: String, trim: true },
  currentDesignation: { type: String, trim: true },
  currentLocation: { type: String, trim: true },
  linkedInProfile: { type: String, trim: true },
  achievements: { type: String },
  notes: { type: String },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Users' },
  lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'Users' }
});

// Update the updatedAt field before saving
alumniSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
alumniSchema.index({ passingYear: 1, department: 1 });
alumniSchema.index({ UIN: 1 });
alumniSchema.index({ email: 1 });

module.exports = mongoose.model('Alumni', alumniSchema);
