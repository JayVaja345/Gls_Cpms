import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';
import { BASE_URL } from '../../config/backend_url';

function Home() {
  document.title = 'CPMS | Admin Dashboard';

  const [countUsers, setCountUsers] = useState({});
  const [alumniCount, setAlumniCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit] = useState(5);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditType, setAuditType] = useState(''); // '', 'created', 'updated', 'deleted'
  
  const getActionMeta = (actionType = '') => {
    const type = String(actionType).toUpperCase();
    if (type.includes('DELETE')) return { label: 'Deleted', color: 'bg-red-100 text-red-700 border-red-300', bar: 'bg-red-500' };
    if (type.includes('UPDATE') || type.includes('APPROV') || type.includes('STATUS')) return { label: 'Updated', color: 'bg-blue-100 text-blue-700 border-blue-300', bar: 'bg-blue-500' };
    if (type.includes('CREATE') || type.includes('POST') || type.includes('ADD')) return { label: 'Created', color: 'bg-green-100 text-green-700 border-green-300', bar: 'bg-green-500' };
    return { label: 'Activity', color: 'bg-gray-100 text-gray-700 border-gray-300', bar: 'bg-gray-500' };
  };

  const formatTimestamp = (value) => {
    try {
      const d = new Date(value);
      return d.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch {
      return String(value || '');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/all-users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        setCountUsers(response.data);
      } catch (error) {
        console.log("Home.jsx => ", error);
      } finally {
        setLoading(false);
      }
    }

    const fetchAlumniCount = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/admin/alumni`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        setAlumniCount(response.data.alumni.length);
      } catch (error) {
        console.log("Home.jsx => fetchAlumniCount => ", error);
      }
    }

    fetchUser();
    fetchAlumniCount();
  }, []);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setAuditLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/audit/logs`, {
          params: { page: auditPage, limit: auditLimit, email: auditSearch || undefined, type: auditType || undefined },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        setAuditLogs(response.data.logs || []);
        setAuditTotalPages(response.data.totalPages || 1);
      } catch (error) {
        console.log("Home.jsx (audit logs) => ", error);
      } finally {
        setAuditLoading(false);
      }
    }

    fetchAuditLogs();
  }, [auditPage, auditLimit, auditSearch, auditType]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center h-72 items-center">
          <i className="fa-solid fa-spinner fa-spin text-3xl max-sm:text-2xl" />
        </div>
      ) : (
        <div className="mt-10">
          <div className="  flex flex-col gap-20 justify-center items-center flex-wrap">
            <div className="  w-full px-10 flex flex-wrap justify-evenly items-center gap-4">
              <Link className='text-black no-underline' to='../admin/management'>
                <div className="bg-slate-300/30 shadow h-44 w-60 text-center flex flex-col justify-evenly items-center rounded-md cursor-pointer border-2 border-gray-600 transition-all ease-in-out hover:bg-slate-400/30  max-sm:h-32 max-sm:w-44">
                  <span className='text-3xl max-sm:text-2xl'>Management Admin</span>
                  <span className='text-3xl max-sm:text-2xl'>{countUsers.managementUsers}</span>
                </div>
              </Link>
              <Link className='text-black no-underline' to='../admin/tpo'>
                <div className="bg-slate-300/30 shadow h-44 w-60 text-center flex flex-col justify-evenly items-center rounded-md cursor-pointer border-2 border-gray-600 transition-all ease-in-out hover:bg-slate-400/30  max-sm:h-32 max-sm:w-44">
                  <span className='text-3xl max-sm:text-2xl'>TPO Admin</span>
                  <span className='text-3xl max-sm:text-2xl'>{countUsers.tpoUsers}</span>
                </div>
              </Link>
              <Link className='text-black no-underline' to='../admin/student'>
                <div className="bg-slate-300/30 shadow h-44 w-60 text-center flex flex-col justify-evenly items-center rounded-md cursor-pointer border-2 border-gray-600 transition-all ease-in-out hover:bg-slate-400/30  max-sm:h-32 max-sm:w-44">
                  <span className='text-3xl max-sm:text-2xl'>Student User</span>
                  <span className='text-3xl max-sm:text-2xl'>{countUsers.studentUsers}</span>
                </div>
              </Link>
              <div className="bg-slate-300/30 shadow h-44 w-60 text-center flex flex-col justify-evenly items-center rounded-md cursor-pointer border-2 border-gray-600 transition-all ease-in-out hover:bg-slate-400/30  max-sm:h-32 max-sm:w-44">
                <span className='text-3xl max-sm:text-2xl'>Superuser</span>
                <span className='text-3xl max-sm:text-2xl'>{countUsers.superUsers}</span>
              </div>
              <Link className='text-black no-underline' to='../admin/alumni'>
                <div className="bg-slate-300/30 shadow h-44 w-60 text-center flex flex-col justify-evenly items-center rounded-md cursor-pointer border-2 border-gray-600 transition-all ease-in-out hover:bg-slate-400/30  max-sm:h-32 max-sm:w-44">
                  <span className='text-3xl max-sm:text-2xl'>Alumni Records</span>
                  <span className='text-3xl max-sm:text-2xl'>{alumniCount}</span>
                </div>
              </Link>
            </div>
            {
              countUsers.studentApprovalPendingUsers !== 0 &&
              (
                <div className="bg-red-500 rounded">
                  <Link className='text-black no-underline' to='../admin/approve-student'>
                    <div className="bg-slate-300/30 shadow h-44 w-80 text-center flex flex-col justify-evenly items-center rounded-md cursor-pointer border-2 border-gray-600 transition-all ease-in-out hover:bg-slate-400/30 max-sm:h-32 max-sm:w-56">
                      <span className='text-3xl max-sm:text-2xl'>
                        Student Approval Pending
                        <Badge bg="secondary" pill className='mx-2'>Action Needed</Badge>
                      </span>
                      <span className='text-3xl max-sm:text-2xl'>{countUsers.studentApprovalPendingUsers}</span>
                    </div>
                  </Link>
                </div>
              )
            }

          </div>

          {/* Audit Logs Section */}
          <div className="mt-16 px-6">
            <div className="mb-4 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-3xl font-semibold">Audit Logs</h2>
                <p className="text-gray-600">High-level system activities for Super Admin visibility</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={auditType}
                  onChange={(e) => { setAuditPage(1); setAuditType(e.target.value); }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="">All actions</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                </select>
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => { setAuditPage(1); setAuditSearch(e.target.value); }}
                  placeholder="Search by email..."
                  className="border rounded px-2 py-1 text-sm"
                />
                {auditSearch && (
                  <button
                    className="px-2 py-1 text-xs border rounded"
                    onClick={() => { setAuditSearch(''); setAuditPage(1); }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            {auditLoading ? (
              <div className="flex justify-center h-40 items-center">
                <i className="fa-solid fa-spinner fa-spin text-2xl" />
              </div>
            ) : (
              <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-auto max-h-96">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 text-xs sticky top-0">
                      <tr>
                        <th className="text-left font-medium px-4 py-3 w-1/5">Action</th>
                        <th className="text-left font-medium px-4 py-3 w-2/5">Description</th>
                        <th className="text-left font-medium px-4 py-3 w-1/5">Performed By</th>
                        <th className="text-right font-medium px-4 py-3 w-1/5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-6 text-gray-600">No audit logs found.</td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => {
                          const meta = getActionMeta(log.actionType);
                          return (
                            <tr key={log._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span className={`h-4 w-1 rounded ${meta.bar}`} />
                                  <span className={`px-2 py-0.5 text-xs rounded border ${meta.color}`}>{meta.label}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-800">{log.description}</td>
                              <td className="px-4 py-3 text-gray-700">{log.performedBy} <span className="text-gray-500">({log.role})</span></td>
                              <td className="px-4 py-3 text-right text-gray-600">{formatTimestamp(log.timestamp)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600">Page {auditPage} of {auditTotalPages}</div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1 text-xs border rounded disabled:opacity-50"
                      onClick={() => setAuditPage((p) => Math.max(p - 1, 1))}
                      disabled={auditPage <= 1}
                    >
                      Prev
                    </button>
                    <button
                      className="px-3 py-1 text-xs border rounded disabled:opacity-50"
                      onClick={() => setAuditPage((p) => Math.min(p + 1, auditTotalPages))}
                      disabled={auditPage >= auditTotalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
      }
    </>
  )
}

export default Home
