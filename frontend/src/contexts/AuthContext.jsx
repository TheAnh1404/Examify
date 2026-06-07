import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('examify_token'));
  const [loading, setLoading] = useState(true);

  // Validate token on boot
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          console.error('Initial auth validation failed:', error);
          // Token expired or invalid
          localStorage.removeItem('examify_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;
      
      localStorage.setItem('examify_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please try again.';
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await API.post('/auth/register', { name, email, password, role });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('examify_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed. Please try again.';
    }
  };

  const logout = () => {
    localStorage.removeItem('examify_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
