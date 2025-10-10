import React, { useState } from 'react';
import axios from 'axios';
import '../styles/RegisterPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const deviceTypes = ['Laptop', 'Router', 'Smartphone', 'Tablet'];
const manufacturers = ['Apple', 'Cisco', 'Dell', 'Garmin', 'Samsung'];
const statusOptions = ['Active', 'Inactive', 'Retired'];

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [status, setStatus] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const deviceDetails = {
      name,
      type,
      manufacturer,
      status,
      purchaseDate,
    };

    try {
      await axios.post('http://localhost:8083/devices', deviceDetails);
      toast.success('Device successfully registered!');
      setName('');
      setType('');
      setManufacturer('');
      setStatus('');
      setPurchaseDate('');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register the device.');
    }
  };

  return (
    <div className="register-bg">
      <div className="register-container">
        <h2 className="register-title">Register Device</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Device ID"
            value="Device ID will be auto-generated"
            className="register-input"
            disabled
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="update-input"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="register-input"
            required
          >
            <option value="">Type</option>
            {deviceTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            className="register-input"
            required
          >
            <option value="">Manufacturer</option>
            {manufacturers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="register-input"
            required
          >
            <option value="">Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <label className="update-label">Purchase Date</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="update-input"
            required
            max={new Date().toISOString().split('T')[0]}
          />
          <button type="submit" className="register-btn">Submit</button>
        </form>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default RegisterPage;
