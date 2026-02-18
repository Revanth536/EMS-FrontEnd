import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import employeeAPI from './Api';

const Dashboard = ({ onLogout, currentUser }) => {
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmployees = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const data = await employeeAPI.getAllEmployees();
      setEmployeeData(data);
    } catch (err) {
      setError(err.message || 'Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="w-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Employee Dashboard</h1>
          {currentUser && (
            <p className="text-muted mb-0">
              Welcome back, {currentUser.firstName || currentUser.email}!
            </p>
          )}
        </div>
        <Button variant="outline-danger" onClick={onLogout}>
          Logout
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-info border-top border-4 text-center p-3">
            <Card.Title>Total Employees</Card.Title>
            <h2>
              {loading ? <Spinner animation="border" size="sm" /> : employeeData.length}
            </h2>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-primary border-top border-4 text-center p-3">
            <Card.Title>Personal Details</Card.Title>
            <Card.Text>Manage your profile info.</Card.Text>
            <Button variant="primary" size="sm">Access Details</Button>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm border-success border-top border-4 text-center p-3">
            <Card.Title>Payslips</Card.Title>
            <Card.Text>View payment history.</Card.Text>
            <Button variant="success" size="sm">View Payslips</Button>
          </Card>
        </Col>
      </Row>

      <Row className="mt-2">
        <Col>
          <Card className="shadow-sm p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0">Employee Directory</Card.Title>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => fetchEmployees(true)}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                    Refreshing...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
                <p className="mt-2 text-muted">Loading employees...</p>
              </div>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeData.length > 0 ? (
                    employeeData.map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.id}</td>
                        <td>{emp.firstName}</td>
                        <td>{emp.email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-4">
                        No employees found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
