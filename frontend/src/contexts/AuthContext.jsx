import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { authService } from '../services/authService';

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
          const res = await API.get('/auth/profile');
          if (res.data && res.data.data) {
            setUser({
              id: res.data.data.id,
              name: res.data.data.fullName,
              email: res.data.data.email,
              role: res.data.data.role
            });
            localStorage.setItem('examify_user', JSON.stringify({
              id: res.data.data.id,
              name: res.data.data.fullName,
              email: res.data.data.email,
              role: res.data.data.role
            }));
          }
        } catch (error) {
          console.log('Kiểm tra xác thực từ backend thất bại', error.message || error);
          localStorage.removeItem('examify_token');
          localStorage.removeItem('examify_role');
          localStorage.removeItem('examify_user');
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
      const data = await authService.login(email, password);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error.message || 'Đăng nhập không thành công. Vui lòng thử lại.';
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const data = await authService.register(name, email, password, role);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error.message || 'Đăng ký không thành công. Vui lòng thử lại.';
    }
  };

  const logout = () => {
    authService.logout();
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
