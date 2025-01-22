import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthToken } from '../api/api';

const ProtectedRoute = ({ children }) => {
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/tasks" />;
  }

  return children;
};

export default ProtectedRoute;
