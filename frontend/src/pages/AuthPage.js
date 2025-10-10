import React, { useState } from 'react';
import SignInPage from './SignInPage';
import SignUpPage from './SignUpPage';
import '../styles/AuthPage.css';

import { useLocation } from 'react-router-dom';

const AuthPage = () => {
  const location = useLocation();
  const mode = location.state?.mode;

  const [isSignIn, setIsSignIn] = useState(mode !== 'signup');
  return (
    <div className={`auth-wrapper ${isSignIn ? 'row-normal' : 'row-reverse'}`}>
      <div className="auth-form-section">
        {isSignIn ? <SignInPage /> : <SignUpPage />}
      </div>
     <button
  className="toggle-round-btn"
  onClick={() => setIsSignIn(!isSignIn)}
  aria-label="Toggle Sign In/Sign Up"
>
  {isSignIn ? (
    <>
      <span title="Switch to Sign Up">&#8594;</span>
      <span style={{ marginLeft: '8px', fontSize: '16px' }}>Sign Up</span>
    </>
  ) : (
    <>
      <span title="Switch to Sign In">&#8592;</span>
      <span style={{ marginLeft: '8px', fontSize: '16px' }}>Sign In</span>
    </>
  )}
</button>
      <div className="auth-image-section">
        <img src="/login.jpg" alt="Tech Devices" />
      </div>
    </div>
  );
};

export default AuthPage;

