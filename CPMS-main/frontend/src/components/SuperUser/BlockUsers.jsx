import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config/backend_url';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FaBan, FaCheckCircle, FaToggleOn, FaToggleOff } from 'react-icons/fa';

function BlockUsers() {
  document.title = 'CPMS | Block/Unblock Users';

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(''); // 'activate' or 'deactivate'

  // Filter states
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });

  const roles = ['student', 'tpo_admin', 'management_admin'];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/admin/users/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
    } catch (error) {
      console.log("BlockUsers.jsx => fetchUsers => ", error);
      alert("Error fetching users!");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (filters.role) {
      filtered = filtered.filter(u => u.role === filters.role);
    }

    if (filters.status) {
      filtered = filtered.filter(u => u.status === filters.status);
    }

    setFilteredUsers(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      status: ''
    });
  };

  const handleToggleClick = (user) => {
    setSelectedUser(user);
    setActionType(user.status === 'active' ? 'deactivate' : 'activate');
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    try {
      setActionLoading(true);
      const endpoint = actionType === 'deactivate' 
        ? `${BASE_URL}/admin/users/deactivate`
        : `${BASE_URL}/admin/users/activate`;

      const response = await axios.post(
        endpoint,
        { email: selectedUser.email },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );

      alert(response.data.msg);
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.log("BlockUsers.jsx => handleConfirmAction => ", error);
      alert(error.response?.data?.msg || "Error updating user status!");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <Badge bg="success" className="fs-6">Active</Badge>
      : <Badge bg="danger" className="fs-6">Inactive</Badge>;
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      'student': { bg: 'primary', text: 'Student' },
      'tpo_admin': { bg: 'info', text: 'TPO Admin' },
      'management_admin': { bg: 'warning', text: 'Management Admin' }
    };
    const roleInfo = roleMap[role] || { bg: 'secondary', text: role };
    return <Badge bg={roleInfo.bg}>{roleInfo.text}</Badge>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="container-fluid mt-4">
        <div className="mb-4">
          <h2>Block/Unblock User Accounts</h2>
          <p className="text-muted">
            Manage user account access. Deactivated users cannot log in until reactivated.
          </p>
        </div>

        {/* Filters Section */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Filters</h5>
            <div className="row">
              <div className="col-md-4 mb-2">
                <Form.Select 
                  name="role" 
                  value={filters.role}
                  onChange={handleFilterChange}
                >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="tpo_admin">TPO Admin</option>
                  <option value="management_admin">Management Admin</option>
                </Form.Select>
              </div>
              <div className="col-md-4 mb-2">
                <Form.Select 
                  name="status" 
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </div>
              <div className="col-md-4 mb-2">
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
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-5">
            <i className="fa-solid fa-spinner fa-spin fa-3x" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="alert alert-info text-center">
            No users found with the selected filters.
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      {user.first_name} {user.middle_name} {user.last_name}
                    </td>
                    <td>{user.email}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <Button
                        variant={user.status === 'active' ? 'danger' : 'success'}
                        size="sm"
                        onClick={() => handleToggleClick(user)}
                        className="d-flex align-items-center gap-2"
                      >
                        {user.status === 'active' ? (
                          <>
                            <FaBan /> Deactivate
                          </>
                        ) : (
                          <>
                            <FaCheckCircle /> Activate
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'deactivate' ? 'Deactivate User' : 'Activate User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionType === 'deactivate' ? (
            <div>
              <p className="mb-3">
                <strong>Warning:</strong> Are you sure you want to deactivate this user?
              </p>
              <div className="alert alert-warning">
                <i className="fa fa-exclamation-triangle me-2"></i>
                <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong> 
                {' '}({selectedUser?.email}) will not be able to log in until reactivated.
              </div>
              <p className="text-muted small mb-0">
                The user will be logged out immediately and cannot access their account.
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-3">
                Are you sure you want to activate this user?
              </p>
              <div className="alert alert-success">
                <i className="fa fa-check-circle me-2"></i>
                <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong> 
                {' '}({selectedUser?.email}) will be able to log in and access their account.
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            variant={actionType === 'deactivate' ? 'danger' : 'success'}
            onClick={handleConfirmAction}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin me-2" />
                Processing...
              </>
            ) : (
              actionType === 'deactivate' ? 'Deactivate' : 'Activate'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default BlockUsers;
