import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config/backend_url';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';

function AlumniStats() {
  document.title = 'CPMS | Alumni Statistics';

  const [stats, setStats] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [totalAlumni, setTotalAlumni] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [passingYears, setPassingYears] = useState([]);

  useEffect(() => {
    fetchPassingYears();
    fetchStats();
  }, [selectedYear]);

  const fetchPassingYears = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/alumni/years`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      setPassingYears(response.data.years);
    } catch (error) {
      console.log("AlumniStats.jsx => fetchPassingYears => ", error);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const url = selectedYear 
        ? `${BASE_URL}/admin/alumni/stats?passingYear=${selectedYear}`
        : `${BASE_URL}/admin/alumni/stats`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      setStats(response.data.stats);
      setDepartmentStats(response.data.departmentStats);
      setTotalAlumni(response.data.totalAlumni);
    } catch (error) {
      console.log("AlumniStats.jsx => fetchStats => ", error);
      alert("Error fetching statistics!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Placed': '#28a745',
      'Higher Studies': '#007bff',
      'Entrepreneur': '#ffc107',
      'Not Placed': '#6c757d',
      'Other': '#17a2b8'
    };
    return colors[status] || '#6c757d';
  };

  const calculatePlacementPercentage = () => {
    if (totalAlumni === 0) return 0;
    const placedStat = stats.find(s => s._id === 'Placed');
    const placedCount = placedStat ? placedStat.count : 0;
    return ((placedCount / totalAlumni) * 100).toFixed(2);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Alumni Placement Statistics</h2>
        <Form.Select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="">All Years</option>
          {passingYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Form.Select>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <i className="fa-solid fa-spinner fa-spin fa-3x" />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center shadow-sm">
                <Card.Body>
                  <h3 className="text-primary">{totalAlumni}</h3>
                  <p className="text-muted mb-0">Total Alumni</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center shadow-sm">
                <Card.Body>
                  <h3 className="text-success">
                    {stats.find(s => s._id === 'Placed')?.count || 0}
                  </h3>
                  <p className="text-muted mb-0">Placed</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center shadow-sm">
                <Card.Body>
                  <h3 className="text-info">
                    {calculatePlacementPercentage()}%
                  </h3>
                  <p className="text-muted mb-0">Placement Rate</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center shadow-sm">
                <Card.Body>
                  <h3 className="text-warning">
                    ₹{stats.find(s => s._id === 'Placed')?.maxPackage?.toFixed(2) || 0} LPA
                  </h3>
                  <p className="text-muted mb-0">Highest Package</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Placement Status Distribution */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Placement Status Distribution</h5>
            </Card.Header>
            <Card.Body>
              {stats.length === 0 ? (
                <p className="text-center text-muted">No data available</p>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Percentage</th>
                      <th>Avg Package (LPA)</th>
                      <th>Max Package (LPA)</th>
                      <th>Min Package (LPA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat) => (
                      <tr key={stat._id}>
                        <td>
                          <Badge 
                            bg=""
                            style={{ 
                              backgroundColor: getStatusColor(stat._id),
                              color: 'white'
                            }}
                          >
                            {stat._id}
                          </Badge>
                        </td>
                        <td>{stat.count}</td>
                        <td>
                          {((stat.count / totalAlumni) * 100).toFixed(2)}%
                        </td>
                        <td>
                          {stat.avgPackage 
                            ? `₹${stat.avgPackage.toFixed(2)}` 
                            : '-'}
                        </td>
                        <td>
                          {stat.maxPackage 
                            ? `₹${stat.maxPackage.toFixed(2)}` 
                            : '-'}
                        </td>
                        <td>
                          {stat.minPackage 
                            ? `₹${stat.minPackage.toFixed(2)}` 
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/* Department-wise Statistics */}
          <Card className="mb-4">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Department-wise Statistics</h5>
            </Card.Header>
            <Card.Body>
              {departmentStats.length === 0 ? (
                <p className="text-center text-muted">No data available</p>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Total Students</th>
                      <th>Placed</th>
                      <th>Placement Rate</th>
                      <th>Avg Package (LPA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentStats.map((dept) => (
                      <tr key={dept._id}>
                        <td><strong>{dept._id}</strong></td>
                        <td>{dept.total}</td>
                        <td>{dept.placed}</td>
                        <td>
                          <Badge 
                            bg={
                              (dept.placed / dept.total) * 100 >= 75 
                                ? 'success' 
                                : (dept.placed / dept.total) * 100 >= 50 
                                ? 'warning' 
                                : 'danger'
                            }
                          >
                            {((dept.placed / dept.total) * 100).toFixed(2)}%
                          </Badge>
                        </td>
                        <td>
                          {dept.avgPackage 
                            ? `₹${dept.avgPackage.toFixed(2)}` 
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/* Package Distribution */}
          {stats.find(s => s._id === 'Placed') && (
            <Row>
              <Col md={4}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <h5>Average Package</h5>
                    <h3 className="text-primary">
                      ₹{stats.find(s => s._id === 'Placed')?.avgPackage?.toFixed(2) || 0} LPA
                    </h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <h5>Highest Package</h5>
                    <h3 className="text-success">
                      ₹{stats.find(s => s._id === 'Placed')?.maxPackage?.toFixed(2) || 0} LPA
                    </h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <h5>Lowest Package</h5>
                    <h3 className="text-warning">
                      ₹{stats.find(s => s._id === 'Placed')?.minPackage?.toFixed(2) || 0} LPA
                    </h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}
    </div>
  );
}

export default AlumniStats;
