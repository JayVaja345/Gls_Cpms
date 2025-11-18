import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Placeholder from 'react-bootstrap/Placeholder';
import { useLocation, useNavigate } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Toast from './Toast';
import TablePlaceholder from './TablePlaceholder';
import { BASE_URL } from '../config/backend_url';

function AllJobPost() {
  document.title = 'CPMS | Job Listings';
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Toast and Modal states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [dataToParasModal, setDataToParasModal] = useState(null);
  const [modalBody, setModalBody] = useState({ cmpName: '', jbTitle: '' });

  const [hasPermission, setHasPermission] = useState(false);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [error, setError] = useState(''); // Added error state
  const [isDeleting, setIsDeleting] = useState(false);

     useEffect(() => {
    const checkPermission = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/company/check-permission`,
        {},
        {
          params: { access: 'job_edit' },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );

      if (response.data.msg === 'Permission granted.') {
        setHasEditPermission(true);
      }
    } catch (error) {
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  checkPermission();
}, [navigate]);

  // Fetch jobs with permission check
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/tpo/jobs`, {
        params: { access: 'job_list' },
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setHasPermission(true);
      const jobsList = response.data.data || [];
      setJobs(jobsList);
      await fetchCompanies(jobsList);
      setLoading(false);
    } catch (err) {
      console.log("Error fetching jobs ", err);
      setHasPermission(false);
      setLoading(false);

      const status = err?.response?.status;
      const msg = err?.response?.data?.msg || err?.message || 'Unable to fetch jobs';
      setError(msg);
      if (status && status !== 403) {
        setToastMessage(msg);
        setShowToast(true);
      }
    }
  };

  // Checking for authentication and fetching user details
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setToastMessage('Please login to continue.');
      setShowToast(true);
      setTimeout(() => navigate('/login'), 800);
      return;
    }

    axios.get(`${BASE_URL}/user/detail`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        setCurrentUser({
          id: res.data.id,
          email: res.data.email,
          role: res.data.role,
        });
        // Only after we have user details, fetch jobs
        fetchJobs();
      })
      .catch(err => {
        console.log("Error in fetching user details => ", err);
        const status = err?.response?.status;
        const msg = err?.response?.data?.msg || err?.message || 'Error loading user data';
        setToastMessage(msg);
        setShowToast(true);

        if (status === 401) {
          setTimeout(() => navigate('/login'), 1000);
        } else {
          setLoading(false);
          setError(msg);
        }
      });
  }, [navigate]);

  const fetchCompanies = async (jobsList) => {
    const companyNames = { ...companies };
    const token = localStorage.getItem('token');

    for (const job of jobsList) {
      const companyId = job?.company;
      if (!companyId || companyNames[companyId]) continue;

      try {
        // use params instead of embedding companyId in string to be safe
        const response = await axios.get(`${BASE_URL}/company/company-data`, {
          params: { companyId },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        // response.data expected like: { company: { companyName: "7span", ... } }
        companyNames[companyId] = response.data.company?.companyName || 'Unknown Company';
        console.log("Company data fetched => ", response.data);
      } catch (err) {
        console.log("Error fetching company name => ", err);
        companyNames[companyId] = 'Unknown Company';
      }
    }
    setCompanies(companyNames);
  };

  // Open modal with safe fallback values
  const handleDeletePost = (jobId, cmpName, jbTitle, jobObj) => {
    const safeCmpName = cmpName || jobObj?.companyName || 'Unknown Company';
    const safeJbTitle = jbTitle || jobObj?.jobTitle || 'this job';
    setDataToParasModal(jobId);
    setModalBody({ cmpName: safeCmpName, jbTitle: safeJbTitle });
    setShowModal(true);
  };

  // Confirm deletion - using POST like your original code. If your API expects DELETE, switch to axios.delete.
  const confirmDelete = async (jobId) => {
    if (!jobId) {
      setToastMessage('Invalid job id.');
      setShowToast(true);
      setShowModal(false);
      return;
    }

    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(`${BASE_URL}/tpo/delete-job`, { jobId }, {
        params: { access: 'job_delete' },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setShowModal(false);
      await fetchJobs();

      if (response?.data?.msg) {
        setToastMessage(response.data.msg);
        setShowToast(true);
      }
    } catch (err) {
      console.error("Error deleting job ", err?.response || err);
      setShowModal(false);
      const msg = err?.response?.data?.msg || err?.message || 'Unable to delete post.';
      setToastMessage(msg);
      setShowToast(true);
    } finally {
      setIsDeleting(false);
      setDataToParasModal(null);
      setModalBody({ cmpName: '', jbTitle: '' });
    }
  };

  const closeModal = () => {
    if (isDeleting) return; // avoid closing while deleting
    setShowModal(false);
    setDataToParasModal(null);
    setModalBody({ cmpName: '', jbTitle: '' });
  };

  const { showToastPass, toastMessagePass } = location.state || { showToastPass: false, toastMessagePass: '' };

  useEffect(() => {
    if (showToastPass) {
      setToastMessage(toastMessagePass);
      setShowToast(showToastPass);
      navigate('.', { replace: true, state: {} });
    }
  }, [showToastPass, toastMessagePass, navigate]);

  return (
    <>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      <div className=''>
        {loading || !currentUser ? (
          <TablePlaceholder />
        ) : !hasPermission ? (
          <div className="flex justify-center items-center h-[80vh]">
            <div className="text-center p-8 bg-red-50 rounded-lg border border-red-100">
              <h2 className="text-xl text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-600">{error || 'You do not have permission to view this content.'}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto max-sm:text-sm max-sm:p-1">
            <div className="table-scrollbar">
              <Table striped bordered hover className='bg-white my-6 rounded-lg shadow w-full'>
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th><b>Company Name</b></th>
                    <th>Job Title</th>
                    <th>Annual CTC</th>
                    <th>Last date of Application</th>
                    <th>No. of Students Applied</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs?.length > 0 ? (
                    jobs.map((job, index) => {
                      const isMatched = job?.applicants?.find(student => student.studentId == currentUser.id);
                      const displayCompany = companies[job?.company] || job?.companyName || 'Loading...';
                      return (
                        <tr key={job?._id} className={`${isMatched ? 'table-success' : ''}`}>
                          <td>{index + 1}</td>
                          <td>
                            <b>
                              {displayCompany === 'Loading...' ? (
                                <Placeholder as="p" animation="glow"><Placeholder xs={12} /></Placeholder>
                              ) : displayCompany}
                            </b>
                          </td>
                          <td>{job?.jobTitle}</td>
                          <td>{job?.salary}</td>
                          <td>{job?.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('en-IN') : '-'}</td>
                          <td>{job?.applicants?.length || 0}</td>
                          <td>
                            <div className="flex justify-around items-center">
                              <div className="px-0.5">
                                <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={<Tooltip>View Post</Tooltip>}>
                                  <i
                                    className="fa-solid fa-circle-info text-2xl max-sm:text-lg cursor-pointer hover:text-blue-500"
                                    onClick={() => {
                                      const rolePaths = {
                                        'tpo_admin': `/tpo/job/${job._id}`,
                                        'management_admin': `/management/job/${job._id}`,
                                        'superuser': `/admin/job/${job._id}`,
                                        'student': `/student/job/${job._id}`,
                                      };
                                      navigate(rolePaths[currentUser.role] || '/');
                                    }}
                                  />
                                </OverlayTrigger>
                              </div>

                              {currentUser.role !== 'student' && (
                                <>
                                  <div className="px-0.5">
                                    <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={<Tooltip>Edit Post</Tooltip>}>
                                      <i
                                        className="fa-regular fa-pen-to-square text-2xl max-sm:text-lg cursor-pointer hover:text-green-500"
                                        onClick={() => {
                                          const rolePaths = {
                                            'tpo_admin': `/tpo/post-job/${job._id}`,
                                            'management_admin': `/management/post-job/${job._id}`,
                                            'superuser': `/admin/post-job/${job._id}`,
                                          };
                                          hasEditPermission ?
                                          navigate(rolePaths[currentUser.role] || '/') : setToastMessage("You don't have permission to edit job posts."); setShowToast(true);
                                        }}
                                      />
                                    </OverlayTrigger>
                                  </div>

                                  <div className="px-0.5">
                                    <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={<Tooltip>Delete Post</Tooltip>}>
                                      <i
                                        className="fa-regular fa-trash-can text-2xl max-sm:text-lg cursor-pointer hover:text-red-500"
                                        onClick={() => handleDeletePost(job?._id, companies[job?.company], job?.jobTitle, job)}
                                      />
                                    </OverlayTrigger>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">No Job Posts Found!</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* React-Bootstrap Modal (replaces ModalBox) */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete {modalBody?.cmpName ? ` - ${modalBody.cmpName}` : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this post <b>{modalBody?.jbTitle || 'this job'}</b>
          {modalBody?.cmpName ? ` from ${modalBody.cmpName}?` : '?'}
          {isDeleting && <div className="mt-2">Deleting...</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal} disabled={isDeleting}>
            Close
          </Button>
          <Button variant="danger" onClick={() => confirmDelete(dataToParasModal)} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AllJobPost;
