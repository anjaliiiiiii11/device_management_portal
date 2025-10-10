import React, { useState, useContext, useRef, useEffect } from 'react';
import axios from 'axios';
import '../styles/AuthPage.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function SignUpPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    surname: ''
  });

  const [validations, setValidations] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false
  });

  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const passwordRef = useRef(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const getPasswordValidations = (password) => ({
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@#$]/.test(password),
    hasMinLength: password.length >= 7
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === 'password') {
      setValidations(getPasswordValidations(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8083/api/auth/register', form);
      const token = res.data.token;
      if (token) {
        login(token);
        alert('Registration successful');
        navigate('/profile');
      } else {
        alert('Registration succeeded, but no token received.');
      }
    } catch (err) {
      alert('Registration failed');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (passwordRef.current && !passwordRef.current.contains(event.target)) {
        setShowPasswordRules(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allValid = Object.values(validations).every(Boolean);

  return (
    <div className="auth-container">
      <img src="/Telstra-Logo.png" alt="Logo" className="auth-logo" />
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <input
          name="username"
          placeholder="First Name"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="surname"
          placeholder="Last Name"
          value={form.surname}
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          placeholder="Enter your email address"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          ref={passwordRef}
          name="password"
          type="password"
          placeholder="Create your password"
          value={form.password}
          onChange={handleChange}
          onFocus={() => setShowPasswordRules(true)}
          required
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$])(?=.*\d).{7,}$"
          title="Password must be at least 7 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@, #, or $)"
          className={allValid ? 'valid-password' : ''}
        />

        {showPasswordRules && (
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
        )}

        <button
  type="submit"
  className={`primary-button ${form.username && form.surname && form.email && form.password ? 'active' : 'inactive'}`}
  disabled={!form.username || !form.surname || !form.email || !form.password}
>
  Create Account
</button>

      </form>
    </div>
  );
}

export default SignUpPage;
