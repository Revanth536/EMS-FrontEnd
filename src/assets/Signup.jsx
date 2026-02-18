import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import employeeAPI from './Api';

const SignUp = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthInfo = (strength) => {
    if (strength === 0) return { variant: 'secondary', label: '' };
    if (strength < 40) return { variant: 'danger', label: 'Weak' };
    if (strength < 70) return { variant: 'warning', label: 'Fair' };
    if (strength < 90) return { variant: 'info', label: 'Good' };
    return { variant: 'success', label: 'Strong' };
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[^a-zA-Z0-9]/.test(password)) errors.push('One special character');
    return errors;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        errors.password = `Password must contain: ${passwordErrors.join(', ')}`;
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!validateForm()) return;

    setLoading(true);

    try {
      await employeeAPI.createEmployee({
        firstName: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setStatus({
        type: 'success',
        message: 'Account created successfully! Redirecting to login...',
      });

      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setPasswordStrength(0);

      setTimeout(() => { onBackToLogin(); }, 2000);
    } catch (error) {
      setStatus({
        type: 'danger',
        message: error.message || 'Registration failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const strengthInfo = getPasswordStrengthInfo(passwordStrength);

  return (
    <Card style={{ width: '450px' }} className="shadow-sm p-4">
      <Card.Body>
        <h2 className="text-center mb-4">Create Account</h2>

        {status.message && (
          <Alert variant={status.type} dismissible onClose={() => setStatus({ type: '', message: '' })}>
            {status.message}
          </Alert>
        )}

        <Form onSubmit={handleSignUp}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
              isInvalid={!!validationErrors.name}
              autoComplete="name"
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={loading}
              isInvalid={!!validationErrors.email}
              autoComplete="email"
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={loading}
                isInvalid={!!validationErrors.password}
                autoComplete="new-password"
                style={{ paddingRight: '90px' }}
              />
              <Button
                variant="link"
                className="position-absolute end-0 top-0 text-decoration-none"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{ fontSize: '0.85rem' }}
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            </div>
            <Form.Control.Feedback type="invalid">
              {validationErrors.password}
            </Form.Control.Feedback>

            {formData.password && (
              <div className="mt-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Password Strength:</small>
                  <small className={`text-${strengthInfo.variant} fw-bold`}>
                    {strengthInfo.label}
                  </small>
                </div>
                <ProgressBar
                  now={passwordStrength}
                  variant={strengthInfo.variant}
                  style={{ height: '5px' }}
                />
                <Form.Text className="text-muted d-block mt-1" style={{ fontSize: '0.8rem' }}>
                  8+ characters, uppercase, lowercase, number, special character
                </Form.Text>
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              disabled={loading}
              isInvalid={!!validationErrors.confirmPassword}
              autoComplete="new-password"
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.confirmPassword}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="success" type="submit" className="w-100 mb-3" disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <div className="text-center">
            <span className="text-muted">Already have an account? </span>
            <Button variant="link" className="p-0 text-decoration-none" onClick={onBackToLogin} disabled={loading}>
              Login here
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SignUp;
