import React, { useState } from 'react';
import axios from 'axios';
import '../styles/UpdateOwnerPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpdateOwnerPage = () => {
  const [ownerId, setOwnerId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');

  const handleUpdateOwner = async (e) => {
    e.preventDefault();

    const updatedOwner = {};
    if (ownerName) updatedOwner.name = ownerName;
    if (ownerContact) updatedOwner.contactInfo = ownerContact;

    try {
      await axios.patch(`http://localhost:8083/owners/${ownerId}`, updatedOwner);
      toast.success('Owner details updated successfully!');
      setOwnerId('');
      setOwnerName('');
      setOwnerContact('');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update owner details.');
    }
  };

  return (
    <div className="update-owner-bg">
      <div className="update-owner-container">
        <h2 className="update-owner-title">Update Owner Details</h2>
        <form className="update-owner-form" onSubmit={handleUpdateOwner}>
          <input
            type="text"
            placeholder="Owner ID"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="update-owner-input"
            required
          />
          <input
            type="text"
            placeholder="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="update-owner-input"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={ownerContact}
            onChange={(e) => setOwnerContact(e.target.value)}
            className="update-owner-input"
          />
          <button type="submit" className="update-owner-btn">Update Owner</button>
        </form>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default UpdateOwnerPage;
