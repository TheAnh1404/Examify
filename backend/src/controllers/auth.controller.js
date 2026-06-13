import * as authService from '../services/auth.service.js';
import * as settingsService from '../services/settings.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    if (!settings.registrationOpen) {
      return errorResponse(res, 'Self-registration is currently disabled', 403);
    }

    const { fullName, email, password } = req.body;
    if (!fullName?.trim() || !email?.trim() || !password) {
      return errorResponse(res, 'Full name, email, and password are required', 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return errorResponse(res, 'Email address is invalid', 400);
    }
    if (password.length < 8) {
      return errorResponse(res, 'Password must be at least 8 characters', 400);
    }

    const data = await authService.register({ fullName, email, password, role: 'STUDENT' });
    return successResponse(res, data, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    return successResponse(res, data, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    return successResponse(res, req.user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // For JWT, logout is usually handled on client side by removing token.
    // Optionally, you can blacklist the token here if you have a store.
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return errorResponse(res, 'Email is required', 400);
    }

    const resetToken = await authService.forgotPassword(email);

    if (!resetToken) {
      return successResponse(res, null, 'If this email exists, a password reset link has been generated');
    }

    // In development, return the link in the response
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    return successResponse(res, { resetLink }, 'Password reset link generated successfully');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token) return errorResponse(res, 'Token is required', 400);
    if (!newPassword) return errorResponse(res, 'New password is required', 400);
    if (!confirmPassword) return errorResponse(res, 'Confirm password is required', 400);
    
    if (newPassword !== confirmPassword) {
      return errorResponse(res, 'Passwords do not match', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    await authService.resetPassword(token, newPassword);

    return successResponse(res, null, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};
