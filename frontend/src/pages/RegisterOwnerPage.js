import React, { useState } from 'react';
import axios from 'axios';
import '../styles/OwnersPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterOwnerPage = () => {
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');

  const handleRegisterOwner = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:8083/owners', {
        name: ownerName,
        contactInfo: ownerContact,
      });

      toast.success(' Owner registered successfully!');
      setOwnerName('');
      setOwnerContact('');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register owner.');
    }
  };

  return (
    <div className="owners-bg">
      <div className="owners-container">
        <h2 className="owners-title">Register a New Owner</h2>
        <form className="owners-form" onSubmit={handleRegisterOwner}>
          <input
            type="text"
            placeholder="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="owners-input"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            value={ownerContact}
            onChange={(e) => setOwnerContact(e.target.value)}
            className="owners-input"
            required
          />
          <button type="submit" className="owners-btn">Register Owner</button>
        </form>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default RegisterOwnerPage;
