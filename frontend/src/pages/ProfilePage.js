import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import '../styles/ProfilePage.css';
import { FaQuestionCircle } from 'react-icons/fa';

const ProfilePage = () => {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      // Option 1: Decode token directly
      try {
        const decoded = jwtDecode(token);
        setUser({
          email: decoded.sub, // 'sub' is the subject (email)
          username: decoded.username,
          role: decoded.role || 'USER',
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [token]);

  return (
    <div className="profile-page">
      <h2>User Profile</h2>
      {user ? (
        <div className="profile-details">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}

      <div className="help-box">
        <h5>Need Help? <FaQuestionCircle style={{ marginLeft: '140px', color: '#6C63FF' }} /></h5>
        <p>
          For additional assistance, please contact 
          <a href="mailto:support@devicemanager.com"> IT@devicemanager.com</a>.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;