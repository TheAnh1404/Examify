import API from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('examify_token', token);
      localStorage.setItem('examify_role', user.role);
      localStorage.setItem('examify_user', JSON.stringify({
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role
      }));

      return { user, token };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra thông tin đăng nhập.';
      throw new Error(message, { cause: error });
    }
  },

  register: async (fullName, email, password, role) => {
    try {
      const response = await API.post('/auth/register', { fullName, email, password, role });
      const { user, token } = response.data.data;

      localStorage.setItem('examify_token', token);
      localStorage.setItem('examify_role', user.role);
      localStorage.setItem('examify_user', JSON.stringify({
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role
      }));

      return { user, token };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử địa chỉ email khác.';
      throw new Error(message, { cause: error });
    }
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
    try {
      const response = await API.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.';
      throw new Error(message, { cause: error });
    }
  },

  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      const response = await API.post('/auth/reset-password', { token, newPassword, confirmPassword });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể đặt lại mật khẩu.';
      throw new Error(message, { cause: error });
    }
  }
};
