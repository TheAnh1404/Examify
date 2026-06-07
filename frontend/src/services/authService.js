import API from './api';
import { db } from '../data/mockData';

export const authService = {
  login: async (email, password) => {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || user.password !== password) {
      return Promise.reject(new Error('Invalid email address or password.'));
    }

    // Set mock session details
    const mockToken = `mock-jwt-token-for-${user.id}`;
    localStorage.setItem('examify_token', mockToken);
    localStorage.setItem('examify_role', user.role);
    localStorage.setItem('examify_user', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }));

    return {
      token: mockToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
    // Later integration:
    // const res = await API.post('/auth/login', { email, password });
    // return res.data;
  },

  register: async (name, email, password, role) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return Promise.reject(new Error('Email is already registered.'));
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      password,
      role: role.toUpperCase(),
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.save('users');

    const mockToken = `mock-jwt-token-for-${newUser.id}`;
    localStorage.setItem('examify_token', mockToken);
    localStorage.setItem('examify_role', newUser.role);
    localStorage.setItem('examify_user', JSON.stringify({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }));

    return {
      token: mockToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    };
  },

  logout: () => {
    localStorage.removeItem('examify_token');
    localStorage.removeItem('examify_role');
    localStorage.removeItem('examify_user');
    return Promise.resolve(true);
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('examify_user');
    return user ? JSON.parse(user) : null;
  },

  forgotPassword: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      return Promise.reject(new Error('No account found with this email.'));
    }
    return { message: 'Reset link has been dispatched to your inbox.' };
  },

  resetPassword: async (token, newPassword) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    // in mock, just return success
    return { message: 'Password reset successful.' };
  }
};
