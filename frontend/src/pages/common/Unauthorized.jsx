import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Unauthorized = () => {
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
        <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
          <ShieldAlert className="h-10 w-10" />
        </div>
        
        <h1 className="font-display font-bold text-2xl text-slate-100 mb-2">Không có quyền truy cập</h1>
        <p className="text-slate-400 text-sm mb-8">
          Bạn không có quyền truy cập trang này.
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

export default Unauthorized;
