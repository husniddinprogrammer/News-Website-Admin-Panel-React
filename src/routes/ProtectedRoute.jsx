import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import authService from '../services/authService';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { isAuthenticated, setAuth, logout } = useAuthStore();
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) return;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      setChecking(false);
      return;
    }

    authService
      .refresh(refreshToken)
      .then(({ data }) => {
        const { user, accessToken, refreshToken: newRT } = data.data;
        setAuth(user, accessToken, newRT);
      })
      .catch(() => {
        logout();
      })
      .finally(() => setChecking(false));
  }, []); // eslint-disable-line

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
