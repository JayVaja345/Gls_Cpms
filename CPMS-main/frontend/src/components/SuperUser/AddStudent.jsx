import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../Toast';
import ModalBox from '../Modal';
import AddUserTable from '../AddUserTable';
import StudentExportButton from '../StudentExportButton'; // ✅ Imported as StudentExportButton
import { BASE_URL } from '../../config/backend_url';

function AddStudent() {
  // student users store here
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // useState for Modal display
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // State for export filters
  const [exportFilters, setExportFilters] = useState({
    department: '',
    year: '',
    isApproved: ''
  });

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/student-users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });

      if (response.data) {
        setUsers(response.data.studentUsers);
      } else {
        console.warn('Response does not contain studentUsers:', response.data);
      }
    } catch (error) {
      console.error("Error fetching user details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const [formOpen, setFormOpen] = useState(false);
  const [data, setData] = useState({
    first_name: "",
    email: "",
    number: "",
    password: ""
  });

  const handleDataChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleDeleteUser = (email) => {
    setUserToDelete(email);
    setShowModal(true);
  }

  const confirmDelete = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/admin/student-delete-user`,
        { email: userToDelete },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );
      
      if (response.data) {
        setToastMessage(response.data.msg);
        setShowToast(true);
        fetchUserDetails();
      }
    } catch (error) {
      console.log("student => confirmDelete ==> ", error);
      setToastMessage(error?.response?.data?.msg);
      setShowToast(true);
    }
    setShowModal(false);
  }

  const closeModal = () => {
    setShowModal(false);
    setUserToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/admin/student-add-user`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );
      if (response.data) {
        setToastMessage(response.data.msg);
        setShowToast(true);
        fetchUserDetails();
        // Reset form
        setData({
          first_name: "",
          email: "",
          number: "",
          password: ""
        });
        setFormOpen(false);
      }
    } catch (error) {
      console.log("handleSubmit => AddStudent.js ==> ", error);
      setToastMessage(error?.response?.data?.msg || "Error adding student");
      setShowToast(true);
    }
  }

  // Handle export filter changes
  const handleFilterChange = (filterType, value) => {
    setExportFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <>
      {/* Toast for messages */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      {/* Export Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Export Student Data</h3>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Department Filter */}
            <select 
              value={exportFilters.department} 
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Departments</option>
              <option value="Computer">Computer</option>
              <option value="Civil">Civil</option>
              <option value="ECS">ECS</option>
              <option value="AIDS">AIDS</option>
              <option value="Mechanical">Mechanical</option>
            </select>

            {/* Year Filter */}
            <select 
              value={exportFilters.year} 
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Years</option>
              <option value="1">First Year</option>
              <option value="2">Second Year</option>
              <option value="3">Third Year</option>
              <option value="4">Fourth Year</option>
            </select>

            {/* Approval Status Filter */}
            <select 
              value={exportFilters.isApproved} 
              onChange={(e) => handleFilterChange('isApproved', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="true">Approved</option>
              <option value="false">Not Approved</option>
            </select>

            {/* ✅ CORRECTED: Use StudentExportButton (not StudentCSVExportButton) */}
            <div className="group">
              <StudentExportButton 
                filters={exportFilters}
                buttonText="Export Data"
                users={users}
              />
            </div>
          </div>
        </div>

        {/* Stats Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="bg-white px-3 py-1 rounded-full border border-gray-200">
            Total Students: <span className="font-semibold text-gray-800">{users.length}</span>
          </span>
          {exportFilters.department && (
            <span className="bg-white px-3 py-1 rounded-full border border-gray-200">
              Department: <span className="font-semibold text-gray-800">{exportFilters.department}</span>
            </span>
          )}
          {exportFilters.year && (
            <span className="bg-white px-3 py-1 rounded-full border border-gray-200">
              Year: <span className="font-semibold text-gray-800">{exportFilters.year}</span>
            </span>
          )}
          {exportFilters.isApproved && (
            <span className="bg-white px-3 py-1 rounded-full border border-gray-200">
              Status: <span className="font-semibold text-gray-800">
                {exportFilters.isApproved === 'true' ? 'Approved' : 'Not Approved'}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* AddUserTable Component */}
      <AddUserTable
        users={users}
        loading={loading}
        handleDeleteUser={handleDeleteUser}
        formOpen={formOpen}
        setFormOpen={setFormOpen}
        data={data}
        handleDataChange={handleDataChange}
        handleSubmit={handleSubmit}
        showModal={showModal}
        closeModal={closeModal}
        confirmDelete={confirmDelete}
        userToDelete={userToDelete}
        userToAdd="Student"
        handleApproveStudent={null}
      />

      {/* ModalBox Component for Delete Confirmation */}
      <ModalBox
        show={showModal}
        close={closeModal}
        header={"Confirmation"}
        body={`Do you want to delete ${userToDelete}?`}
        btn={"Delete"}
        confirmAction={confirmDelete}
      />
    </>
  )
}

export default AddStudent;