import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import '../styles/Navbar.css';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    console.log('Logging out, navigating with showLogoutSuccess'); // Debug log
    navigate('/', { state: { showLogoutSuccess: true } }); // Navigate with state to trigger toast
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">
          <img src="/Telstra-Logo.png" alt="DeviceManager Logo" className="logo" />
        </Link>
      </div>

      {isLoggedIn && (
        <div className="navbar-center">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <div className="nav-dropdown">
            <div className="nav-link">Devices ▾</div>
            <div className="nav-submenu">
              <Link to="/show-devices" className="nav-subitem">Show All</Link>
              <Link to="/register-device" className="nav-subitem">Register</Link>
              <Link to="/update-device" className="nav-subitem">Update</Link>
            </div>
          </div>
          <div className="nav-dropdown">
            <div className="nav-link">Owners ▾</div>
            <div className="nav-submenu">
              <Link to="/show-owners" className="nav-subitem">Show All</Link>
              <Link to="/register-owner" className="nav-subitem">Register</Link>
              <Link to="/update-owner" className="nav-subitem">Update</Link>
            </div>
          </div>
        </div>
      )}

      <div className="navbar-right">
        {isLoggedIn ? (
          <>
            <NotificationBell /> {/* ✅ Show bell when logged in */}
            <div className="user-dropdown">
              <button
                className="icon-button"
                title="User Menu"
                onClick={() => setShowUserMenu(prev => !prev)}
              >
                <FaUser size={24} />
              </button>
              {showUserMenu && (
                <div className="user-submenu">
                  <button className="user-subitem" onClick={() => navigate('/profile')}>Profile</button>
                  <button className="user-subitem" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/auth" state={{ mode: 'login' }}>
              <button className="auth-button">Login</button>
            </Link>
            <Link to="/auth" state={{ mode: 'signup' }}>
              <button className="auth-button">Signup</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
