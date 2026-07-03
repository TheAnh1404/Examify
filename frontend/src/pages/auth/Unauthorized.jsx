import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

const Unauthorized = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('examify_role');

  const getDashboardRedirect = () => {
    if (!role) return '/login';
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'TEACHER') return '/teacher/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="bg-white border border-secondary-205 rounded-2xl shadow-lg max-w-md w-full p-8 flex flex-col items-center">
        <div className="h-16 w-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-6 shrink-0 shadow-sm">
          <ShieldAlert className="h-10 w-10" />
        </div>
        
        <h1 className="font-display font-extrabold text-2xl text-secondary-800 tracking-tight">403 Không có quyền truy cập</h1>
        <p className="text-secondary-500 text-sm mt-2 mb-8 leading-relaxed font-medium">
          Bạn không có quyền truy cập khu vực này.
        </p>

        <Button
          onClick={() => navigate(getDashboardRedirect())}
          variant="primary"
          className="w-full"
          icon={<ArrowLeft className="h-4.5 w-4.5" />}
        >
          Quay về bảng điều khiển
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
