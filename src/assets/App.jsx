import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Login from './Login';
import Dashboard from './Dashboard';
import SignUp from './Signup';
import ForgotPassword from './ForgotPassword';
import { UserProvider, useUser } from './UserContext';
import employeeAPI from './Api';

const VIEWS = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  DASHBOARD: 'dashboard',
  FORGOT_PASSWORD: 'forgot_password',
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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setView(VIEWS.LOGIN);
  };

  const showSignUp = () => { setError(''); setView(VIEWS.SIGNUP); };
  const showLogin = () => { setError(''); setView(VIEWS.LOGIN); };
  const showForgotPassword = () => { setError(''); setView(VIEWS.FORGOT_PASSWORD); };

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
          onForgotPasswordClick={showForgotPassword}
          loading={loading}
          error={error}
        />
      )}

      {view === VIEWS.SIGNUP && (
        <SignUp onBackToLogin={showLogin} />
      )}

      {view === VIEWS.FORGOT_PASSWORD && (
        <ForgotPassword onBackToLogin={showLogin} />
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
