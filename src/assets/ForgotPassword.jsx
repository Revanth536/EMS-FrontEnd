import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import employeeAPI from './Api';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await employeeAPI.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirmation screen shown after successful submission
  if (submitted) {
    return (
      <Card style={{ width: '420px' }} className="shadow-sm p-4">
        <Card.Body className="text-center">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
          <h4 className="mb-3">Check your email</h4>
          <p className="text-muted mb-1">
            We sent a password reset link to:
          </p>
          <p className="fw-semibold mb-4">{email}</p>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Didn't receive it? Check your spam folder, or{' '}
            <Button
              variant="link"
              className="p-0 text-decoration-none"
              style={{ fontSize: '0.9rem' }}
              onClick={() => { setSubmitted(false); setError(''); }}
            >
              try again
            </Button>
            .
          </p>
          <Button
            variant="outline-secondary"
            className="w-100 mt-3"
            onClick={onBackToLogin}
          >
            Back to Login
          </Button>
        </Card.Body>
      </Card>
    );
  }

  // Step 1: Email entry form
  return (
    <Card style={{ width: '420px' }} className="shadow-sm p-4">
      <Card.Body>
        <h2 className="text-center mb-2">Forgot Password?</h2>
        <p className="text-muted text-center mb-4" style={{ fontSize: '0.95rem' }}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              className="p-0 text-decoration-none text-secondary"
              onClick={onBackToLogin}
              disabled={loading}
            >
              ← Back to Login
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ForgotPassword;
