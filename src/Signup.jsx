// Signup.jsx - With Password Validation
import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import employeeAPI from './api';

const SignUp = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: '' 
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength calculator
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

  // Get password strength color and label
  const getPasswordStrengthInfo = (strength) => {
    if (strength === 0) return { variant: 'secondary', label: '' };
    if (strength < 40) return { variant: 'danger', label: 'Weak' };
    if (strength < 70) return { variant: 'warning', label: 'Fair' };
    if (strength < 90) return { variant: 'info', label: 'Good' };
    return { variant: 'success', label: 'Strong' };
  };

  // Password validation rules
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('One special character');
    }
    
    return errors;
  };

  // Client-side validation
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        errors.password = `Password must contain: ${passwordErrors.join(', ')}`;
      }
    }

    // Confirm password validation
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

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await employeeAPI.createEmployee({
        firstName: formData.name,
        email: formData.email,
        password: formData.password, // Now sending password
      });

      setStatus({
        type: 'success',
        message: 'Account created successfully! Redirecting to login...',
      });

      // Reset form
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setPasswordStrength(0);

      // Redirect after 2 seconds
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
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
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' });
    }

    // Update password strength in real-time
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
          {/* Name Field */}
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

          {/* Email Field */}
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

          {/* Password Field */}
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
              />
              <Button
                variant="link"
                className="position-absolute end-0 top-0 text-decoration-none"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{ fontSize: '0.9rem' }}
              >
                {showPassword ? '🙈 Hide' : '👁️ Show'}
              </Button>
            </div>
            <Form.Control.Feedback type="invalid">
              {validationErrors.password}
            </Form.Control.Feedback>
            
            {/* Password Strength Indicator */}
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
                  Password should contain: 8+ characters, uppercase, lowercase, number, special character
                </Form.Text>
              </div>
            )}
          </Form.Group>

          {/* Confirm Password Field */}
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

          {/* Submit Button */}
          <Button
            variant="success"
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          {/* Back to Login */}
          <div className="text-center">
            <span className="text-muted">Already have an account? </span>
            <Button
              variant="link"
              className="p-0 text-decoration-none"
              onClick={onBackToLogin}
              disabled={loading}
            >
              Login here
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SignUp;