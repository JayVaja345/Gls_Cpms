import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from '../../config/backend_url';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function AddEditAlumni() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  document.title = isEditMode ? 'CPMS | Edit Alumni' : 'CPMS | Add Alumni';

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    UIN: '',
    rollNumber: '',
    department: '',
    passingYear: new Date().getFullYear(),
    admissionYear: '',
    CGPA: '',
    placementStatus: 'Not Placed',
    companyName: '',
    jobTitle: '',
    packageOffered: '',
    joiningDate: '',
    jobLocation: '',
    jobType: 'Full Time',
    higherStudiesDetails: {
      instituteName: '',
      course: '',
      country: '',
      admissionYear: ''
    },
    entrepreneurDetails: {
      businessName: '',
      businessType: '',
      startDate: ''
    },
    currentCompany: '',
    currentDesignation: '',
    currentLocation: '',
    linkedInProfile: '',
    achievements: '',
    notes: ''
  });

  const departments = ['Computer', 'Civil', 'ECS', 'AIDS', 'Mechanical'];
  const placementStatuses = ['Placed', 'Higher Studies', 'Entrepreneur', 'Not Placed', 'Other'];
  const jobTypes = ['Full Time', 'Part Time', 'Contract', 'Internship'];

  useEffect(() => {
    if (!isEditMode) {
      fetchStudents();
    } else {
      fetchAlumniData();
    }
  }, [id, isEditMode]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/student-users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setStudents(response.data.studentUsers);
    } catch (error) {
      console.log("AddEditAlumni.jsx => fetchStudents => ", error);
    }
  };

  const fetchAlumniData = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get(`${BASE_URL}/admin/alumni/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      const alumniData = response.data.alumni;
      setFormData({
        ...alumniData,
        joiningDate: alumniData.joiningDate ? alumniData.joiningDate.split('T')[0] : '',
        higherStudiesDetails: alumniData.higherStudiesDetails || { instituteName: '', course: '', country: '', admissionYear: '' },
        entrepreneurDetails: alumniData.entrepreneurDetails || { businessName: '', businessType: '', startDate: '' }
      });
    } catch (error) {
      console.log("AddEditAlumni.jsx => fetchAlumniData => ", error);
      alert("Error fetching alumni data!");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value
      }
    });
  };

  const handleStudentSelect = (e) => {
    const studentId = e.target.value;
    const selectedStudent = students.find(s => s._id === studentId);
    
    if (selectedStudent) {
      setFormData({
        ...formData,
        studentId: selectedStudent._id,
        firstName: selectedStudent.first_name || '',
        middleName: selectedStudent.middle_name || '',
        lastName: selectedStudent.last_name || '',
        email: selectedStudent.email || '',
        contactNumber: selectedStudent.number || '',
        UIN: selectedStudent.studentProfile?.UIN || '',
        rollNumber: selectedStudent.studentProfile?.rollNumber || '',
        department: selectedStudent.studentProfile?.department || '',
        admissionYear: selectedStudent.studentProfile?.addmissionYear || ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.UIN || !formData.department || !formData.passingYear) {
      alert("Please fill in all required fields!");
      return;
    }

    try {
      setLoading(true);
      
      const url = isEditMode 
        ? `${BASE_URL}/admin/alumni/${id}`
        : `${BASE_URL}/admin/alumni`;
      
      const method = isEditMode ? 'put' : 'post';
      
      const response = await axios[method](url, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      alert(response.data.msg);
      navigate('/admin/alumni');
    } catch (error) {
      console.log("AddEditAlumni.jsx => handleSubmit => ", error);
      alert(error.response?.data?.msg || "Error saving alumni record!");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="text-center py-5">
        <i className="fa-solid fa-spinner fa-spin fa-3x" />
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4">{isEditMode ? 'Edit' : 'Add New'} Alumni Record</h2>

      <Form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Basic Information</h5>
          </Card.Header>
          <Card.Body>
            {!isEditMode && (
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Select Student (Optional)</Form.Label>
                    <Form.Select onChange={handleStudentSelect}>
                      <option value="">-- Select Student to Auto-fill --</option>
                      {students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.first_name} {student.last_name} - {student.email}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            )}
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Middle Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="number"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Academic Information */}
        <Card className="mb-4">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">Academic Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>UIN <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="UIN"
                    value={formData.UIN}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Roll Number</Form.Label>
                  <Form.Control
                    type="number"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Department <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Passing Year <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="passingYear"
                    value={formData.passingYear}
                    onChange={handleInputChange}
                    min="2000"
                    max="2099"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Admission Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="admissionYear"
                    value={formData.admissionYear}
                    onChange={handleInputChange}
                    min="2000"
                    max="2099"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>CGPA</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="CGPA"
                    value={formData.CGPA}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Placement Information */}
        <Card className="mb-4">
          <Card.Header className="bg-warning">
            <h5 className="mb-0">Placement Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Placement Status <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="placementStatus"
                    value={formData.placementStatus}
                    onChange={handleInputChange}
                    required
                  >
                    {placementStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {formData.placementStatus === 'Placed' && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Job Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Package (LPA)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="packageOffered"
                        value={formData.packageOffered}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Job Type</Form.Label>
                      <Form.Select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleInputChange}
                      >
                        {jobTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Joining Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Job Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="jobLocation"
                        value={formData.jobLocation}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}

            {formData.placementStatus === 'Higher Studies' && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Institute Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.higherStudiesDetails.instituteName}
                      onChange={(e) => handleNestedInputChange('higherStudiesDetails', 'instituteName', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.higherStudiesDetails.course}
                      onChange={(e) => handleNestedInputChange('higherStudiesDetails', 'course', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.higherStudiesDetails.country}
                      onChange={(e) => handleNestedInputChange('higherStudiesDetails', 'country', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Admission Year</Form.Label>
                    <Form.Control
                      type="number"
                      value={formData.higherStudiesDetails.admissionYear}
                      onChange={(e) => handleNestedInputChange('higherStudiesDetails', 'admissionYear', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            {formData.placementStatus === 'Entrepreneur' && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Business Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.entrepreneurDetails.businessName}
                      onChange={(e) => handleNestedInputChange('entrepreneurDetails', 'businessName', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Business Type</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.entrepreneurDetails.businessType}
                      onChange={(e) => handleNestedInputChange('entrepreneurDetails', 'businessType', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.entrepreneurDetails.startDate}
                      onChange={(e) => handleNestedInputChange('entrepreneurDetails', 'startDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>

        {/* Additional Information */}
        <Card className="mb-4">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">Additional Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Company</Form.Label>
                  <Form.Control
                    type="text"
                    name="currentCompany"
                    value={formData.currentCompany}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Designation</Form.Label>
                  <Form.Control
                    type="text"
                    name="currentDesignation"
                    value={formData.currentDesignation}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="currentLocation"
                    value={formData.currentLocation}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>LinkedIn Profile</Form.Label>
                  <Form.Control
                    type="url"
                    name="linkedInProfile"
                    value={formData.linkedInProfile}
                    onChange={handleInputChange}
                    placeholder="https://www.linkedin.com/in/username"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Achievements</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Submit Buttons */}
        <div className="d-flex gap-3 mb-4">
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin me-2" />
                Saving...
              </>
            ) : (
              <>{isEditMode ? 'Update' : 'Create'} Alumni Record</>
            )}
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => navigate('/admin/alumni')}
            disabled={loading}
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default AddEditAlumni;
