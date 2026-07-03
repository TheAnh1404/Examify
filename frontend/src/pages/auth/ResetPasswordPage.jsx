import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, CheckCircle2 } from 'lucide-react';
import Logo from '../../components/common/Logo';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate criteria in real time
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const requirements = [
    { label: 'Tối thiểu 8 ký tự', met: hasMinLength },
    { label: 'Có chữ hoa', met: hasUppercase },
    { label: 'Có chữ thường', met: hasLowercase },
    { label: 'Có chữ số', met: hasNumber },
    { label: 'Có ký tự đặc biệt', met: hasSpecialChar }
  ];

  const allMet = requirements.every(r => r.met);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ các trường mật khẩu.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!allMet) {
      setError('Mật khẩu chưa đáp ứng đầy đủ yêu cầu bảo mật.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      // Simulate API call
      await authService.resetPassword('mock-token', password);
      setSuccess('Mật khẩu của bạn đã được cập nhật thành công.');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 select-none font-sans relative">
      
      {/* Small Top Header Logo */}
      <div className="flex items-center gap-2 mb-6">
        <Logo className="h-7 w-7" />
        <span className="font-extrabold text-[#2563EB] text-lg tracking-tight">Examify</span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[400px] bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/60 p-7 sm:p-8">
        
        {success ? (
          <div className="space-y-6 py-6 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="h-9 w-9 animate-[bounce_1s_infinite]" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-slate-900 tracking-tight">Cập nhật thành công</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                Mật khẩu đã được đặt lại. Đang chuyển về trang đăng nhập...
              </p>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_forwards]" style={{ width: '100%' }} />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Custom Shield Keyhole + Circular Reload Arrow vector */}
            <div className="flex justify-center select-none py-1">
              <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background circles */}
                <circle cx="65" cy="65" r="50" fill="#EEF2FF" />
                
                {/* Blue Shield Graphic */}
                <g filter="url(#shield-shadow)">
                  <path d="M65 35C65 35 84 39 84 64C84 81 65 95 65 95C65 95 46 81 46 64C46 39 65 35 65 35Z" fill="url(#shield-grad)" />
                </g>

                {/* Keyhole symbol in shield */}
                <circle cx="65" cy="58" r="5" fill="#A7F3D0" />
                <path d="M62.5 62.5L67.5 62.5L69 74.5L61 74.5Z" fill="#A7F3D0" />

                {/* Green Rotating/Reloading Circular Arrow Around Shield */}
                <path d="M 65 20 A 45 45 0 1 1 31 35" stroke="#10B981" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                {/* Arrow Head */}
                <polygon points="60,14 69,20 60,26" fill="#10B981" />

                {/* Definitions */}
                <defs>
                  <linearGradient id="shield-grad" x1="46" y1="35" x2="84" y2="95" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818CF8" />
                    <stop offset="1" stopColor="#4F46E5" />
                  </linearGradient>
                  <filter id="shield-shadow" x="40" y="32" width="50" height="70" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#312E81" floodOpacity="0.2" />
                  </filter>
                </defs>
              </svg>
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-900 mb-1">Tạo mật khẩu mới</h1>
              <p className="text-slate-400 text-[11px] leading-relaxed px-4">
                Vui lòng tạo mật khẩu mới an toàn cho tài khoản của bạn.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            {/* New Password input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  required
                  className="w-full pl-3.5 pr-10 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Checklist Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5 select-none">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {req.met ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0 block" />
                  )}
                  <span className={`text-[11px] font-bold transition-colors ${req.met ? 'text-slate-800' : 'text-slate-400'}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Confirm Password input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  className="w-full pl-3.5 pr-10 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md shadow-blue-500/10 mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                'Cập nhật mật khẩu'
              )}
            </button>
          </form>
        )}
      </div>

      {/* Page Footer */}
      <div className="mt-8 text-slate-400 text-xs text-center font-medium">
        &copy; 2024 Examify Education Systems. Mọi quyền được bảo lưu.
      </div>
    </div>
  );
};

export default ResetPasswordPage;
