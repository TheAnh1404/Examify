import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('examify_role');

  if (!role || !allowedRoles.includes(role.toUpperCase())) {
    // Redirect to 403 Forbidden page if role is not authorized
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default RoleBasedRoute;
