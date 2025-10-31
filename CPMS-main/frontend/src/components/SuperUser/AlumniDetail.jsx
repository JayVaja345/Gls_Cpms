import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../../config/backend_url';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';

function AlumniDetail() {
  document.title = 'CPMS | Alumni Details';

  const { id } = useParams();
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlumniDetails();
  }, [id]);

  const fetchAlumniDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/admin/alumni/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setAlumni(response.data.alumni);
    } catch (error) {
      console.log("AlumniDetail.jsx => fetchAlumniDetails => ", error);
      alert("Error fetching alumni details!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Placed': 'success',
      'Higher Studies': 'primary',
      'Entrepreneur': 'warning',
      'Not Placed': 'secondary',
      'Other': 'info'
    };
    return <Badge bg={badges[status] || 'secondary'} className="fs-6">{status}</Badge>;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <i className="fa-solid fa-spinner fa-spin fa-3x" />
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="alert alert-danger text-center">
        Alumni record not found!
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Alumni Details</h2>
        <div className="d-flex gap-2">
          <Link 
            to={`/admin/edit-alumni/${id}`}
            className="btn btn-warning"
          >
            <i className="fa fa-edit me-2"></i>Edit
          </Link>
          <Button 
            variant="secondary"
            onClick={() => navigate('/admin/alumni')}
          >
            <i className="fa fa-arrow-left me-2"></i>Back to List
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Basic Information</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <p><strong>Name:</strong></p>
              <p className="text-muted">
                {alumni.firstName} {alumni.middleName} {alumni.lastName}
              </p>
            </Col>
            <Col md={4}>
              <p><strong>Email:</strong></p>
              <p className="text-muted">{alumni.email}</p>
            </Col>
            <Col md={4}>
              <p><strong>Contact Number:</strong></p>
              <p className="text-muted">{alumni.contactNumber || 'N/A'}</p>
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
            <Col md={3}>
              <p><strong>UIN:</strong></p>
              <p className="text-muted">{alumni.UIN}</p>
            </Col>
            <Col md={3}>
              <p><strong>Roll Number:</strong></p>
              <p className="text-muted">{alumni.rollNumber || 'N/A'}</p>
            </Col>
            <Col md={3}>
              <p><strong>Department:</strong></p>
              <p className="text-muted">{alumni.department}</p>
            </Col>
            <Col md={3}>
              <p><strong>CGPA:</strong></p>
              <p className="text-muted">{alumni.CGPA || 'N/A'}</p>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <p><strong>Admission Year:</strong></p>
              <p className="text-muted">{alumni.admissionYear || 'N/A'}</p>
            </Col>
            <Col md={4}>
              <p><strong>Passing Year:</strong></p>
              <p className="text-muted">{alumni.passingYear}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Placement Status */}
      <Card className="mb-4">
        <Card.Header className="bg-warning">
          <h5 className="mb-0">Placement Information</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={12}>
              <p><strong>Placement Status:</strong></p>
              <p>{getStatusBadge(alumni.placementStatus)}</p>
            </Col>
          </Row>

          {alumni.placementStatus === 'Placed' && (
            <>
              <Row>
                <Col md={4}>
                  <p><strong>Company Name:</strong></p>
                  <p className="text-muted">{alumni.companyName || 'N/A'}</p>
                </Col>
                <Col md={4}>
                  <p><strong>Job Title:</strong></p>
                  <p className="text-muted">{alumni.jobTitle || 'N/A'}</p>
                </Col>
                <Col md={4}>
                  <p><strong>Package:</strong></p>
                  <p className="text-muted">
                    {alumni.packageOffered 
                      ? `₹${alumni.packageOffered} LPA` 
                      : 'N/A'}
                  </p>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <p><strong>Job Type:</strong></p>
                  <p className="text-muted">{alumni.jobType || 'N/A'}</p>
                </Col>
                <Col md={4}>
                  <p><strong>Joining Date:</strong></p>
                  <p className="text-muted">{formatDate(alumni.joiningDate)}</p>
                </Col>
                <Col md={4}>
                  <p><strong>Job Location:</strong></p>
                  <p className="text-muted">{alumni.jobLocation || 'N/A'}</p>
                </Col>
              </Row>
            </>
          )}

          {alumni.placementStatus === 'Higher Studies' && alumni.higherStudiesDetails && (
            <Row>
              <Col md={6}>
                <p><strong>Institute Name:</strong></p>
                <p className="text-muted">
                  {alumni.higherStudiesDetails.instituteName || 'N/A'}
                </p>
              </Col>
              <Col md={6}>
                <p><strong>Course:</strong></p>
                <p className="text-muted">
                  {alumni.higherStudiesDetails.course || 'N/A'}
                </p>
              </Col>
              <Col md={6}>
                <p><strong>Country:</strong></p>
                <p className="text-muted">
                  {alumni.higherStudiesDetails.country || 'N/A'}
                </p>
              </Col>
              <Col md={6}>
                <p><strong>Admission Year:</strong></p>
                <p className="text-muted">
                  {alumni.higherStudiesDetails.admissionYear || 'N/A'}
                </p>
              </Col>
            </Row>
          )}

          {alumni.placementStatus === 'Entrepreneur' && alumni.entrepreneurDetails && (
            <Row>
              <Col md={6}>
                <p><strong>Business Name:</strong></p>
                <p className="text-muted">
                  {alumni.entrepreneurDetails.businessName || 'N/A'}
                </p>
              </Col>
              <Col md={6}>
                <p><strong>Business Type:</strong></p>
                <p className="text-muted">
                  {alumni.entrepreneurDetails.businessType || 'N/A'}
                </p>
              </Col>
              <Col md={6}>
                <p><strong>Start Date:</strong></p>
                <p className="text-muted">
                  {formatDate(alumni.entrepreneurDetails.startDate)}
                </p>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Current Information */}
      {(alumni.currentCompany || alumni.currentDesignation || alumni.currentLocation) && (
        <Card className="mb-4">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">Current Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <p><strong>Current Company:</strong></p>
                <p className="text-muted">{alumni.currentCompany || 'N/A'}</p>
              </Col>
              <Col md={4}>
                <p><strong>Current Designation:</strong></p>
                <p className="text-muted">{alumni.currentDesignation || 'N/A'}</p>
              </Col>
              <Col md={4}>
                <p><strong>Current Location:</strong></p>
                <p className="text-muted">{alumni.currentLocation || 'N/A'}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Additional Information */}
      <Card className="mb-4">
        <Card.Header className="bg-secondary text-white">
          <h5 className="mb-0">Additional Information</h5>
        </Card.Header>
        <Card.Body>
          {alumni.linkedInProfile && (
            <Row className="mb-3">
              <Col md={12}>
                <p><strong>LinkedIn Profile:</strong></p>
                <p>
                  <a 
                    href={alumni.linkedInProfile} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    {alumni.linkedInProfile}
                  </a>
                </p>
              </Col>
            </Row>
          )}

          {alumni.achievements && (
            <Row className="mb-3">
              <Col md={12}>
                <p><strong>Achievements:</strong></p>
                <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                  {alumni.achievements}
                </p>
              </Col>
            </Row>
          )}

          {alumni.notes && (
            <Row>
              <Col md={12}>
                <p><strong>Notes:</strong></p>
                <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
                  {alumni.notes}
                </p>
              </Col>
            </Row>
          )}

          <Row className="mt-4 pt-3 border-top">
            <Col md={6}>
              <p className="text-muted small">
                <strong>Created:</strong> {formatDate(alumni.createdAt)}
              </p>
            </Col>
            <Col md={6}>
              <p className="text-muted small">
                <strong>Last Updated:</strong> {formatDate(alumni.updatedAt)}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AlumniDetail;
