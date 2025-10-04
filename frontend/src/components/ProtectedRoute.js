// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('admin_token');

  // If admin-only route, check for admin token
  if (adminOnly) {
    if (!adminToken) {
      return <Navigate to="/admin/login" replace />;
    }
  } else {
    // Normal user route
    if (!token) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
