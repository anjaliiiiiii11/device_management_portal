import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ResultsPage from './pages/ResultsPage';
import RegisterPage from './pages/RegisterPage';
import UpdatePage from './pages/UpdatePage';
import RegisterOwnerPage from './pages/RegisterOwnerPage';
import AuditLogsPage from './pages/AuditLogsPage';
import AuditLogsResultPage from './pages/AuditLogsResultPage';
import ShowDevices from './pages/ShowDevices';
import ShowOwners from './pages/ShowOwners';
import UpdateOwnerPage from './pages/UpdateOwnerPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import LoginSuccess from './pages/LoginSuccess';
import NotificationsPage from './pages/NotificationsPage';
import MainLayout from './component/MainLayout'; // ✅ Correct path

function AppContent() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/register" element={<SignUpPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/register-device" element={<RegisterPage />} />
        <Route path="/update-device" element={<UpdatePage />} />
        <Route path="/register-owner" element={<RegisterOwnerPage />} />
        <Route path="/audit-log/:deviceId" element={<AuditLogsPage />} />
        <Route path="/audit-logs-result" element={<AuditLogsResultPage />} />
        <Route path="/show-devices" element={<ShowDevices />} />
        <Route path="/show-owners" element={<ShowOwners />} />
        <Route path="/update-owner" element={<UpdateOwnerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chatbot" element={<HomePage />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
