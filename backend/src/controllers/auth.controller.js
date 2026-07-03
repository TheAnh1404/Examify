import * as authService from '../services/auth.service.js';
import * as settingsService from '../services/settings.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    if (!settings.registrationOpen) {
      return errorResponse(res, 'Hệ thống hiện không cho phép tự đăng ký', 403);
    }

    const { fullName, email, password } = req.body;
    if (!fullName?.trim() || !email?.trim() || !password) {
      return errorResponse(res, 'Vui lòng nhập họ tên, email và mật khẩu', 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return errorResponse(res, 'Địa chỉ email không hợp lệ', 400);
    }
    if (password.length < 8) {
      return errorResponse(res, 'Mật khẩu phải có ít nhất 8 ký tự', 400);
    }

    const data = await authService.register({ fullName, email, password, role: 'STUDENT' });
    return successResponse(res, data, 'Đăng ký tài khoản thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    return successResponse(res, data, 'Đăng nhập thành công');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    return successResponse(res, req.user, 'Lấy hồ sơ cá nhân thành công');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // For JWT, logout is usually handled on client side by removing token.
    // Optionally, you can blacklist the token here if you have a store.
    return successResponse(res, null, 'Đăng xuất thành công');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return errorResponse(res, 'Vui lòng nhập email', 400);
    }

    const resetToken = await authService.forgotPassword(email);

    if (!resetToken) {
      return successResponse(res, null, 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được tạo');
    }

    // In development, return the link in the response
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    return successResponse(res, { resetLink }, 'Tạo liên kết đặt lại mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token) return errorResponse(res, 'Vui lòng cung cấp token', 400);
    if (!newPassword) return errorResponse(res, 'Vui lòng nhập mật khẩu mới', 400);
    if (!confirmPassword) return errorResponse(res, 'Vui lòng xác nhận mật khẩu', 400);
    
    if (newPassword !== confirmPassword) {
      return errorResponse(res, 'Mật khẩu xác nhận không khớp', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'Mật khẩu phải có ít nhất 6 ký tự', 400);
    }

    await authService.resetPassword(token, newPassword);

    return successResponse(res, null, 'Đặt lại mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};
