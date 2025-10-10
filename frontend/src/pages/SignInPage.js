import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
 
function SignInPage() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
 
  const [validations, setValidations] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false,
  });
 
  const getPasswordValidations = (password) => ({
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@#$]/.test(password),
    hasMinLength: password.length >= 7,
  });
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8083/api/auth/login', { email, password });
      const token = res.data.token;
      login(token);
      localStorage.setItem('jwt', token); // Standardized to 'jwt'
      // Navigate to home with state to trigger toast
      navigate('/', { state: { showLoginSuccess: true } });
    } catch (err) {
      toast.error('Login failed', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
 
  const handlePasswordReset = async (e) => {
    e.preventDefault();
 
    if (newPassword !== confirmPassword) {
      setResetMessage('Passwords do not match');
      return;
    }
 
    try {
      await axios.patch('http://localhost:8083/api/auth/changepassword', {
        email,
        newPassword,
      });
      setResetMessage('Password updated successfully');
      setShowResetForm(false);
    } catch (error) {
      setResetMessage('Failed to update password');
    }
  };
 
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setValidations(getPasswordValidations(value));
  };
 
  return (
    <div className="auth-container">
      <img src="/Telstra-Logo.png" alt="Logo" className="auth-logo" />
      <form onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={7}
        />
        <input
          type="submit"
          className={`primary-button ${email && password ? 'active' : 'inactive'}`}
          value="Sign In"
          disabled={!email || !password}
        />
        <p className="forgot-password" onClick={() => setShowResetForm(!showResetForm)}>
          Forgot Password?
        </p>
 
        <div className="divider">or</div>
        <button
          type="button"
          className="google-button"
          onClick={() => {
            window.location.href =
              'http://localhost:8083/oauth2/authorization/google?prompt=select_account+consent';
          }}
        >
          Sign in with
          <img
            src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
            alt="Google logo"
          />
        </button>
      </form>
 
      {showResetForm && (
        <form onSubmit={handlePasswordReset} className="reset-form">
          <h3>Reset Password</h3>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
 
          <div className="password-rules">
            <p><strong>Password must include:</strong></p>
            <ul>
              <li style={{ color: validations.hasUppercase ? 'green' : 'red' }}>
                At least 1 uppercase letter (A–Z)
              </li>
              <li style={{ color: validations.hasLowercase ? 'green' : 'red' }}>
                At least 1 lowercase letter (a–z)
              </li>
              <li style={{ color: validations.hasNumber ? 'green' : 'red' }}>
                At least 1 number (0–9)
              </li>
              <li style={{ color: validations.hasSpecialChar ? 'green' : 'red' }}>
                At least 1 special character (@, #, or $)
              </li>
              <li style={{ color: validations.hasMinLength ? 'green' : 'red' }}>
                Minimum length of 7 characters
              </li>
            </ul>
          </div>
 
          <div className="modal-buttons">
            <button type="submit">Submit</button>
            <button type="button" onClick={() => setShowResetForm(false)}>Cancel</button>
          </div>
          {resetMessage && <p className="reset-message">{resetMessage}</p>}
        </form>
      )}
    </div>
  );
}
 
export default SignInPage;