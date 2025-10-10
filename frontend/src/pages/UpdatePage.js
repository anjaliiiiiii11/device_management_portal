import React, { useState } from 'react';
import '../styles/UpdatePage.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const deviceTypes = ['Laptop', 'Router', 'Smartphone', 'Tablet'];
const manufacturers = ['Apple', 'Cisco', 'Dell', 'Garmin', 'Samsung'];
const statusOptions = ['Active', 'Inactive', 'Retired'];

const UpdatePage = () => {
  const [deviceId, setDeviceId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [status, setStatus] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedDevice = {};
    if (name) updatedDevice.name = name;
    if (type) updatedDevice.type = type;
    if (manufacturer) updatedDevice.manufacturer = manufacturer;
    if (status) updatedDevice.status = status;
    if (purchaseDate) updatedDevice.purchaseDate = purchaseDate;

    try {
      await axios.patch(
        `http://localhost:8083/devices/${deviceId}/update`,
        updatedDevice
      );
      toast.success('Device updated successfully!');
      setDeviceId('');
      setName('');
      setType('');
      setManufacturer('');
      setStatus('');
      setPurchaseDate('');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update device.');
    }
  };

  return (
    <div className="update-bg">
      <div className="update-container">
        <h2 className="update-title">Update Device Details</h2>
        <form className="update-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Device ID (TELXXXXXX)"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="update-input"
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="update-input"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="update-input"
          >
            <option value="">Select Type</option>
            {deviceTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            className="update-input"
          >
            <option value="">Select Manufacturer</option>
            {manufacturers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="update-input"
          >
            <option value="">Select Status</option>
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
            max={new Date().toISOString().split('T')[0]}
          />
          <button type="submit" className="update-btn">Submit</button>
        </form>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default UpdatePage;
