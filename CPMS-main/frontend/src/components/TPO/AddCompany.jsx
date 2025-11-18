import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Toast from '../Toast';
import ModalBox from '../Modal';
import { BASE_URL } from '../../config/backend_url';

function AddCompany() {
  document.title = 'CPMS | Add Company';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);

  const { companyId } = useParams();

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // useState for Modal display
  const [showModal, setShowModal] = useState(false);

  const [data, setData] = useState();

  //Check user permissions
 useEffect(() => {
  const checkPermission = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/company/check-permission`,
        {},
        {
          params: { access: 'company_add' },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );

      if (response.data.msg === 'Permission granted.') {
        setHasPermission(true);
      }
    } catch (error) {
      setHasPermission(false);
      if (error?.response?.status === 403) {
        setToastMessage("You don't have permission to add companies");
        setShowToast(true);
        // setTimeout(() => {
        //   navigate('/dashboard');
        // }, 2000);
      } else if (error?.response?.status === 401) {
        setToastMessage('Please login to continue');
        setShowToast(true);
        // setTimeout(() => navigate('/login'), 1500);
      } else {
        setToastMessage('Unable to verify permission.');
        setShowToast(true);
      }
    } finally {
      setLoading(false);
    }
  };

  checkPermission();
}, [navigate]);


  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all required fields
    const requiredFields = {
      companyName: 'Company Name',
      companyDescription: 'Company Description',
      companyDifficulty: 'Company Difficulty',
      companyLocation: 'Company Location',
      companyWebsite: 'Company Website'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !data?.[key])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      setShowToast(true);
      return;
    }

    // Validate website URL format
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlPattern.test(data.companyWebsite)) {
      setError('Please enter a valid website URL');
      setShowToast(true);
      return;
    }

    setShowModal(true);
  }

  const confirmSubmit = async () => {
    const url = companyId
      ? `${BASE_URL}/company/update-company?companyId=${companyId}`
      : `${BASE_URL}/company/add-company`;
    try {
      const response = await axios.post(url, data,
        {
          params: { access: 'company_add' },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (response?.status === 201) {
        setShowModal(false);
        setToastMessage(response?.data?.msg);
        const dataToPass = {
          showToastPass: true,
          toastMessagePass: response?.data?.msg
        }
        navigate('../tpo/companys', { state: dataToPass });
      }
    } catch (error) {
      console.log("AddCompany error while fetching => ", error);
      setShowModal(false);
      
      const errorMsg = error?.response?.data?.msg;
      const statusCode = error?.response?.status;
      let displayMessage = '';
      
      if (!navigator.onLine) {
        displayMessage = 'Please check your internet connection and try again.';
      } else if (!error.response) {
        displayMessage = 'Unable to reach the server. Please try again in a few moments.';
      } else {
        switch (statusCode) {
          case 403:
            displayMessage = `Permission Denied: ${errorMsg || 'You do not have permission to perform this action'}`;
            break;
          case 400:
            displayMessage = `Invalid Data: ${errorMsg || 'Please check your input and try again'}`;
            break;
          case 409:
            displayMessage = `Conflict: ${errorMsg || 'A company with this name already exists'}`;
            break;
          case 500:
            displayMessage = 'The server encountered an error. Our team has been notified.';
            break;
          case 401:
            displayMessage = 'Your session has expired. Please log in again.';
            // Optionally redirect to login page
            setTimeout(() => navigate('/login'), 2000);
            break;
          default:
            if (errorMsg) {
              displayMessage = `Error: ${errorMsg}`;
            } else if (error.code === 'ECONNABORTED') {
              displayMessage = 'Request timed out. Please try again.';
            } else {
              displayMessage = 'Unable to add company. Please verify your inputs and try again.';
            }
        }
      }
      
      setToastMessage(displayMessage);
      setShowToast(true);
      setError(displayMessage);
    }
  }

  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/company/company-data?companyId=${companyId}`);
      setData(response.data.company);
    } catch (error) {
      console.log("AddCompany error while fetching => ", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (companyId) fetchCompanyData() }, [companyId])


  useEffect(() => {
    if (!companyId) setLoading(false);
  }, [])


  const handleDataChange = (e) => {
    setError('');
    setData({ ...data, [e.target.name]: e.target.value })
  }


  return (
    <>
      {/*  any message here  */}
      < Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      {
        loading ? (
          <div className="flex justify-center h-72 items-center">
            <i className="fa-solid fa-spinner fa-spin text-3xl" />
          </div>
        ) : !hasPermission ? (
          <div className="flex flex-col items-center justify-center h-72">
            <div className="text-center p-8 max-w-lg w-full backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400">
              <div className="text-red-500 text-5xl mb-4">
                <i className="fas fa-lock"></i>
              </div>
              <h4 className="text-xl font-semibold mb-3">Access Denied</h4>
              <p className="text-gray-600 mb-3">
                You don't have permission to {companyId ? "update" : "add"} companies.
              </p>
              <hr className="my-4" />
              <p className="text-sm text-gray-500">
                Please contact your administrator if you need access.
              </p>
            </div>
          </div>
        ) : (
          <>
            <Form onSubmit={handleSubmit}>
              <div className="my-8 text-base backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400 p-6 max-sm:text-sm max-sm:p-3">
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
                    <FloatingLabel controlId="floatingCompanyName" label={
                      <>
                        <span>Company Name <span className='text-red-500'>*</span></span>
                      </>
                    }>
                      <Form.Control
                        type="text"
                        placeholder="Company Name"
                        name='companyName'
                        value={data?.companyName || ''}
                        onChange={handleDataChange}

                      />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingCompanyLocation" label={
                      <>
                        <span>Company Location <span className='text-red-500'>*</span></span>
                      </>
                    }>
                      <Form.Control
                        type="text"
                        placeholder="Company Location"
                        name='companyLocation'
                        value={data?.companyLocation || ''}
                        onChange={handleDataChange}

                      />
                    </FloatingLabel>
                  </div>
                  <FloatingLabel controlId="floatingCompanyWebsite" label={
                    <>
                      <span>Company Website <span className='text-red-500'>*</span></span>
                    </>
                  }>
                    <Form.Control
                      type="link"
                      placeholder="Company Website"
                      name='companyWebsite'
                      value={data?.companyWebsite || ''}
                      onChange={handleDataChange}

                    />
                  </FloatingLabel>
                  <FloatingLabel controlId="floatingSelectDifficulty" label={
                    <>
                      <span>Difficulty Level <span className='text-red-500'>*</span></span>
                    </>
                  }>
                    <Form.Select
                      aria-label="Floating label select difficulty"
                      className='cursor-pointer'
                      name='companyDifficulty'
                      value={data?.companyDifficulty || ''}
                      onChange={handleDataChange}

                    >
                      <option disabled value='' className='text-gray-400'>Enter Difficulty Level</option>
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Hard">Hard</option>
                    </Form.Select>
                  </FloatingLabel>
                  <FloatingLabel controlId="floatingcompanyDescription" label={
                    <>
                      <span>Company Description <span className='text-red-500'>*</span></span>
                    </>
                  }>
                    <Form.Control
                      as="textarea"
                      placeholder="Company Description"
                      name='companyDescription'
                      style={{ height: '100px', maxHeight: "450px" }}
                      value={data?.companyDescription || ''}
                      onChange={handleDataChange}

                    />
                  </FloatingLabel>
                </div>
                {
                  error &&
                  <div className="flex pt-2">
                    <span className='text-red-500'>{error}</span>
                  </div>
                }
              </div>
              <div className="flex flex-col justify-center items-center gap-2">
                <Button variant="primary" type='submit' size='lg'>
                  {
                    companyId
                      ? 'Update Company'
                      : 'Add Company'
                  }
                </Button>
              </div>
            </Form>
          </>
        )
      }


      {/* ModalBox Component for Delete Confirmation */}
      <ModalBox
        show={showModal}
        close={closeModal}
        header={"Confirmation"}
        body={`Do you want to add company ${data?.companyName}?`}
        btn={"Post"}
        confirmAction={confirmSubmit}
      />
    </>
  )
}
export default AddCompany
