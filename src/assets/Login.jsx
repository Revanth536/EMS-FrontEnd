import React from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

const Login = ({ onLogin, onSignUpClick, onForgotPasswordClick, loading, error }) => {
  return (
    <Card style={{ width: '400px' }} className="shadow-sm p-4">
      <Card.Body>
        <h2 className="text-center mb-4">Login</h2>

        {error && (
          <Alert variant="danger" dismissible>
            {error}
          </Alert>
        )}

        <Form onSubmit={onLogin}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              required
              disabled={loading}
              autoComplete="email"
            />
            <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              required
              disabled={loading}
              autoComplete="current-password"
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
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>

          <div className="d-flex justify-content-between">
            <Button
              variant="link"
              className="p-0 text-decoration-none"
              onClick={onForgotPasswordClick}
              disabled={loading}
            >
              Forgot Password?
            </Button>
            <Button
              variant="link"
              className="p-0 text-decoration-none text-secondary"
              onClick={onSignUpClick}
              disabled={loading}
            >
              Sign Up
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default Login;
