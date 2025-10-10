import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
 
const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toastShownRef = useRef(false);
 
  useEffect(() => {
    // Reset toastShownRef on mount to allow toasts for new navigations
    toastShownRef.current = false;
 
    const token = localStorage.getItem('jwt');
    setIsLoggedIn(!!token);
 
    console.log('HomePage useEffect, location.state:', location.state); // Debug log
 
    // Show toast for login or logout success
    if (location.state?.showLoginSuccess && !toastShownRef.current) {
      toast.success('Login Successful!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      toastShownRef.current = true;
      navigate('/', { replace: true, state: {} });
    } else if (location.state?.showLogoutSuccess && !toastShownRef.current) {
      toast.success('Logged out successfully', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      toastShownRef.current = true;
      navigate('/', { replace: true, state: {} });
    }
  }, [location, navigate]);
 
  const login = (token) => {
    localStorage.setItem('jwt', token);
    setIsLoggedIn(true);
  };
 
  const logout = () => {
    localStorage.removeItem('jwt');
    setIsLoggedIn(false);
  };
 
  return (
    <div className="home-container">
      <div className="home-text">
        <h1>Welcome to Device Management Portal</h1>
        <div>
          <p>
            One stop destination for effective Device Management. Manage and Monitor devices at your convenience.
          </p>
          <p>{isLoggedIn ? '' : 'Sign in to get started!'}</p>
        </div>
      </div>
      <div className="home-image">
        <Link to="/">
          <img src="/homepage.png" alt="Device Management" />
        </Link>
      </div>
    </div>
  );
};
 
export default HomePage;