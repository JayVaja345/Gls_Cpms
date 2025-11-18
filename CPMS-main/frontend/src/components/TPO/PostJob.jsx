import React, { useState, useRef, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel'; ``
import Form from 'react-bootstrap/Form';
import Toast from '../Toast';
import ModalBox from '../Modal';
import { BASE_URL } from '../../config/backend_url';

function PostJob() {
  document.title = 'CPMS | Post Job';
  const navigate = useNavigate();

  const { jobId } = useParams();
  const editor = useRef(null);

  const [data, setData] = useState({});
  const [companys, setCompanys] = useState(null);

  const [loading, setLoading] = useState(true);

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // useState for Modal display
  const [showModal, setShowModal] = useState(false);

  const [hasPermission, setHasPermission] = useState(false);

  const closeModal = () => {
    setShowModal(false);
  };

   useEffect(() => {
    const checkPermission = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/company/check-permission`,
        {},
        {
          params: { access: 'job_add' },
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data?.company || !data?.jobTitle || !data?.salary || !data?.applicationDeadline || !data?.jobDescription || !data?.eligibility || !data?.howToApply) {
      setToastMessage("All Fields Required!");
      setShowToast(true);
      return;
    }
    // console.log(data)
    setShowModal(true);
  }

  const confirmSubmit = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/tpo/post-job`,
        data,
        {
          params: { access: 'job_add' },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      )
      //setHasPermission(true);
      // console.log(response.data)
      if (response?.data?.msg) {
        setToastMessage(response.data.msg);
        setShowToast(true);

        const newDataToPass = {
          showToastPass: true,
          toastMessagePass: response?.data?.msg,
        };
        navigate('../tpo/job-listings', { state: newDataToPass });
      }
    } catch (error) {
      //setHasPermission(false);
      if (error.response) {
        if (error?.response.data?.msg) setToastMessage(error.response.data.msg)
        else setToastMessage(error.message)

        setShowToast(true);
      }
      console.log("PostJob error while fetching => ", error);
    }
  }

  const handleDataChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value })
  }

  const fetchJobDetail = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/tpo/job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      )
      setData(response.data);
    } catch (error) {
      if (error.response) {
        if (error?.response.data?.msg) setToastMessage(error.response.data.msg)
        else setToastMessage(error.message)
        setShowToast(true);

        if (error?.response?.data?.msg === "job data not found") navigate('../404');
      }
      console.log("Error while fetching details => ", error);
    } finally {
      setLoading(false);
    }
  }

  const fetchCompanys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/company/company-detail`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setCompanys(response.data.companys);
    } catch (error) {
      console.log("Error fetching jobs ", error);
      if (error?.response?.data?.msg) {
        setToastMessage(error.response.data.msg);
        setShowToast(true);
      }
    }
  }

  useEffect(() => {
    // calling fetchJobDetail
    fetchJobDetail();
    fetchCompanys();
    if (!jobId) setLoading(false);
  }, []);

  // for formating date of birth
  const formatDate = (isoString) => {
    if (!isoString || isoString === "undefined") return "";
    const date = new Date(isoString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

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
                You don't have permission to {jobId ? "update" : "add"} companies.
              </p>
              <hr className="my-4" />
              <p className="text-sm text-gray-500">
                Please contact your administrator if you need access.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="">
              <form onSubmit={handleSubmit}>
                <div className="my-8 text-base backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400 p-6 max-sm:text-sm max-md:p-3">
                  <div className="grid grid-cols-1 gap-2">
                    {/* company details  */}
                    <FloatingLabel controlId="floatingSelectDifficulty" label={
                      <>
                        <span>Select Company Name <span className='text-red-500'>*</span></span>
                      </>
                    }>
                      <Form.Select
                        aria-label="Floating label select difficulty"
                        className='cursor-pointer'
                        name='companySelected'
                        value={data?.company || ''}
                        onChange={(e) => {
                          setData({
                            ...data,
                            company: e.target.value
                          });
                        }}

                      >
                        <option disabled value='' className='text-gray-400'>Select Company Name</option>
                        {
                          companys?.map((company, index) => (
                            <option key={index} value={company._id}>{company.companyName}</option>
                          ))
                        }
                      </Form.Select>
                    </FloatingLabel>
                  </div>
                </div>

                <div className="my-8 text-base backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400 p-6 max-sm:text-sm max-md:p-3">
                  <div className="flex flex-col">
                    {/* job details  */}
                    <div className="grid grid-cols-3 gap-2 max-md:grid-cols-1">
                      <FloatingLabel controlId="floatingJobTitle" label={
                        <>
                          <span>Job Title <span className='text-red-500'>*</span></span>
                        </>
                      }>
                        <Form.Control
                          type="text"
                          placeholder="Job Title"
                          name='jobTitle'
                          value={data?.jobTitle || ''}
                          onChange={handleDataChange}

                        />
                      </FloatingLabel>

                      <FloatingLabel controlId="floatingSalary" label={
                        <>
                          <span>Salary (In LPA) <span className='text-red-500'>*</span></span>
                        </>
                      }>
                        <Form.Control
                          type="text"
                          placeholder="Salary"
                          name="salary"
                          value={data?.salary || ''}
                          onChange={(e) => {
                            // Allow only numbers and decimals
                            if (!isNaN(e.target.value) && /^[0-9]*[.,]?[0-9]*$/.test(e.target.value)) {
                              handleDataChange(e);
                            }
                          }}

                        />
                      </FloatingLabel>

                      <FloatingLabel controlId="floatingDeadlineDate" label={
                        <>
                          <span>Deadline Date <span className='text-red-500'>*</span></span>
                        </>
                      }>
                        <Form.Control
                          type="date"
                          placeholder="Deadline Date"
                          name='applicationDeadline'
                          value={formatDate(data?.applicationDeadline) || ''}
                          onChange={handleDataChange}

                        />
                      </FloatingLabel>
                    </div>

                    {/* text editor  */}
                    <div className="py-6">
                      <label className=''>
                        Enter Job Description <span className="text-red-500">*</span>
                      </label>
                      <JoditEditor
                        ref={editor}
                        tabIndex={1}
                        value={data?.jobDescription || ''}
                        onChange={(e) => {
                          setData({
                            ...data,
                            jobDescription: e
                          })
                        }}
                      />
                    </div>
                    <div className="py-6">
                      <label className=''>
                        Enter Eligibility <span className="text-red-500">*</span>
                      </label>
                      <JoditEditor
                        ref={editor}
                        tabIndex={2}
                        value={data?.eligibility || ''}
                        onChange={(e) => {
                          setData({
                            ...data,
                            eligibility: e
                          })
                        }}
                      />
                    </div>
                    <div className="py-6">
                      <label className=''>
                        Enter Process To Apply <span className="text-red-500">*</span>
                      </label>
                      <JoditEditor
                        ref={editor}
                        tabIndex={3}
                        value={data?.howToApply || ''}
                        onChange={(e) => {
                          setData({
                            ...data,
                            howToApply: e
                          })
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center gap-2">
                  <Button variant="primary" type='submit' size='lg'>POST</Button>
                </div>
              </form>
            </div>
          </>
        )
      }

      {/* ModalBox Component for Delete Confirmation */}
      <ModalBox
        show={showModal}
        close={closeModal}
        header={"Confirmation"}
        body={`Do you want to post job for ${data?.jobTitle}?`}
        btn={"Post"}
        confirmAction={confirmSubmit}
      />
    </>
  )
}
export default PostJob
