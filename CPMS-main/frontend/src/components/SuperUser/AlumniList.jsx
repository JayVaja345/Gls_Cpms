import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaFilter } from 'react-icons/fa';
import { BASE_URL } from '../../config/backend_url';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';

function AlumniList() {
  document.title = 'CPMS | Alumni Records';

  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter states
  const [passingYears, setPassingYears] = useState([]);
  const [filters, setFilters] = useState({
    passingYear: '',
    department: '',
    placementStatus: ''
  });

  const departments = ['Computer', 'Civil', 'ECS', 'AIDS', 'Mechanical'];
  const placementStatuses = ['Placed', 'Higher Studies', 'Entrepreneur', 'Not Placed', 'Other'];

  useEffect(() => {
    fetchAlumni();
    fetchPassingYears();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, alumni]);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/admin/alumni`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setAlumni(response.data.alumni);
      setFilteredAlumni(response.data.alumni);
    } catch (error) {
      console.log("AlumniList.jsx => fetchAlumni => ", error);
      alert("Error fetching alumni records!");
    } finally {
      setLoading(false);
    }
  };

  const fetchPassingYears = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/alumni/years`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setPassingYears(response.data.years);
    } catch (error) {
      console.log("AlumniList.jsx => fetchPassingYears => ", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...alumni];

    if (filters.passingYear) {
      filtered = filtered.filter(a => a.passingYear === parseInt(filters.passingYear));
    }

    if (filters.department) {
      filtered = filtered.filter(a => a.department === filters.department);
    }

    if (filters.placementStatus) {
      filtered = filtered.filter(a => a.placementStatus === filters.placementStatus);
    }

    setFilteredAlumni(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      passingYear: '',
      department: '',
      placementStatus: ''
    });
  };

  const handleDeleteClick = (alumniRecord) => {
    setSelectedAlumni(alumniRecord);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await axios.delete(`${BASE_URL}/admin/alumni/${selectedAlumni._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      alert("Alumni record deleted successfully!");
      setShowDeleteModal(false);
      fetchAlumni();
    } catch (error) {
      console.log("AlumniList.jsx => handleDeleteConfirm => ", error);
      alert("Error deleting alumni record!");
    } finally {
      setDeleteLoading(false);
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
    return <Badge bg={badges[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <>
      <div className="container-fluid mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Alumni Placement Records</h2>
          <Link to="/admin/add-alumni" className="btn btn-primary">
            <i className="fa fa-plus me-2"></i>Add New Alumni
          </Link>
        </div>

        {/* Filters Section */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">
              <FaFilter className="me-2" />
              Filters
            </h5>
            <div className="row">
              <div className="col-md-3 mb-2">
                <Form.Select 
                  name="passingYear" 
                  value={filters.passingYear}
                  onChange={handleFilterChange}
                >
                  <option value="">All Years</option>
                  {passingYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-3 mb-2">
                <Form.Select 
                  name="department" 
                  value={filters.department}
                  onChange={handleFilterChange}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-3 mb-2">
                <Form.Select 
                  name="placementStatus" 
                  value={filters.placementStatus}
                  onChange={handleFilterChange}
                >
                  <option value="">All Status</option>
                  {placementStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-3 mb-2">
                <Button variant="secondary" onClick={clearFilters} className="w-100">
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-3">
          <p className="text-muted">
            Showing {filteredAlumni.length} of {alumni.length} records
          </p>
        </div>

        {/* Alumni Table */}
        {loading ? (
          <div className="text-center py-5">
            <i className="fa-solid fa-spinner fa-spin fa-3x" />
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="alert alert-info text-center">
            No alumni records found. Add your first alumni record!
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>UIN</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Passing Year</th>
                  <th>Status</th>
                  <th>Company</th>
                  <th>Package (LPA)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumni.map((alumniRecord) => (
                  <tr key={alumniRecord._id}>
                    <td>{alumniRecord.UIN}</td>
                    <td>
                      {alumniRecord.firstName} {alumniRecord.middleName} {alumniRecord.lastName}
                    </td>
                    <td>{alumniRecord.department}</td>
                    <td>{alumniRecord.passingYear}</td>
                    <td>{getStatusBadge(alumniRecord.placementStatus)}</td>
                    <td>{alumniRecord.companyName || '-'}</td>
                    <td>
                      {alumniRecord.packageOffered 
                        ? `₹ ${alumniRecord.packageOffered} LPA` 
                        : '-'}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link 
                          to={`/admin/alumni/${alumniRecord._id}`}
                          className="btn btn-sm btn-info"
                          title="View Details"
                        >
                          <FaEye />
                        </Link>
                        <Link 
                          to={`/admin/edit-alumni/${alumniRecord._id}`}
                          className="btn btn-sm btn-warning"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteClick(alumniRecord)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the alumni record for{' '}
          <strong>
            {selectedAlumni?.firstName} {selectedAlumni?.lastName}
          </strong>?
          <br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin me-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AlumniList;
