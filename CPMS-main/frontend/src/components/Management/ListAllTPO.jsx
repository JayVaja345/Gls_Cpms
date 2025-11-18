import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../Toast';
import ModalBox from '../Modal';
import AddUserTable from '../AddUserTable';
import { BASE_URL } from '../../config/backend_url';

function AddTPO() {
  document.title = 'CPMS | TPO Users';
  // tpo users store here
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // useState for Modal display
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [hasPermission, setHasPermission] = useState(false);
  const [hasDeletePermission, setHasDeletePermission] = useState(false);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/management/tpo-users`, {
        params : { access : "tpo_list"},
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored in localStorage
        }
      });
      setHasPermission(true);
      if (response.data) {
        // console.log(response.data.tpoUsers)
        setUsers(response.data.tpoUsers);
      } else {
        console.warn('Response does not contain tpoUsers:', response.data);
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
      const response = await axios.post(`${BASE_URL}/management/deletetpo`,
        { email: userToDelete },
        {
          params : { access : "tpo_delete"},
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );
      setHasDeletePermission(true);
      setShowModal(false);
      if (response.data) {
        setToastMessage(response.data.msg);
        setShowToast(true);
        fetchUserDetails();
      } 
    } catch (error) {
      console.log("AddTPO => confirmDelete ==> ", error);
      setToastMessage("You don't have permission to delete TPO User");
      setShowToast(true);
      setShowModal(false);
    }
  }

  const closeModal = () => {
    setShowModal(false);
    setUserToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/management/addtpo`,
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
      }
    } catch (error) {
      console.log("handleSubmit => AddTPO.jsx ==> ", error);
    }
  }


  return (
    <>
      {/*  any message here  */}
      < Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="top-center"
      />

      {
        !hasPermission ? (
          <div className="flex justify-center items-center h-[80vh]">
            <div className="text-center p-8 bg-red-50 rounded-lg border border-red-100">
              <h2 className="text-xl text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-600">{'You do not have permission to view this content.'}</p>
            </div>
          </div>
        ) : <AddUserTable
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
        userToAdd={"TPO Admin"}
      />
      }

      

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
  );
}

export default AddTPO;
