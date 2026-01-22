// App.jsx - Improved Version
import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Login from './Login';
import Dashboard from './Dashboard';
import SignUp from './Signup';
import { UserProvider, useUser } from './UserContext';
import employeeAPI from './Api';

// Views constants to avoid magic strings
const VIEWS = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  DASHBOARD: 'dashboard',
};

const AppContent = () => {
  const { currentUser, login, logout } = useUser();
  const [view, setView] = useState(currentUser ? VIEWS.DASHBOARD : VIEWS.LOGIN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = e.target.formBasicEmail.value;
    const password = e.target.formBasicPassword.value;

    try {
      const user = await employeeAPI.login(email, password);
      login(user);
      setView(VIEWS.DASHBOARD);
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setView(VIEWS.LOGIN);
  };

  const showSignUp = () => {
    setError('');
    setView(VIEWS.SIGNUP);
  };

  const showLogin = () => {
    setError('');
    setView(VIEWS.LOGIN);
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh' }}
    >
      {view === VIEWS.DASHBOARD && (
        <Dashboard onLogout={handleLogout} currentUser={currentUser} />
      )}

      {view === VIEWS.LOGIN && (
        <Login
          onLogin={handleLogin}
          onSignUpClick={showSignUp}
          loading={loading}
          error={error}
        />
      )}

      {view === VIEWS.SIGNUP && (
        <SignUp onBackToLogin={showLogin} />
      )}
    </Container>
  );
};

const App = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;