import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'teacher': return '/teacher';
      case 'student': return '/student';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-panel max-w-md w-full p-8 flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-6">
          <HelpCircle className="h-10 w-10" />
        </div>
        
        <h1 className="font-display font-bold text-4xl text-slate-100 mb-2">404</h1>
        <h2 className="font-semibold text-lg text-slate-300 mb-2">Không tìm thấy trang</h2>
        <p className="text-slate-400 text-sm mb-8">
          Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>

        <button
          onClick={() => navigate(getDashboardPath())}
          className="glow-button w-full flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay về bảng điều khiển
        </button>
      </div>
    </div>
  );
};

export default NotFound;
