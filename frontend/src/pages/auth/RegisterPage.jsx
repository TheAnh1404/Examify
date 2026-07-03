import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { AlertCircle, Eye, EyeOff, CheckCircle2, User, Mail, Lock } from 'lucide-react';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password criteria validations
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  let strengthScore = 0;
  if (password) {
    if (hasMinLength) strengthScore++;
    if (hasUppercase) strengthScore++;
    if (hasNumber) strengthScore++;
    if (hasSpecialChar) strengthScore++;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (strengthScore < 4) {
      setError('Mật khẩu chưa đáp ứng đầy đủ yêu cầu bảo mật.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const data = await authService.register(name, email, password, 'STUDENT');
      
      const roleUpper = data.user.role.toUpperCase();
      if (roleUpper === 'TEACHER') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử email khác.');
    } finally {
      setLoading(false);
    }
  };

  const getSegmentColor = (index) => {
    if (strengthScore === 0 || index >= strengthScore) return 'bg-secondary-100';
    if (strengthScore === 1) return 'bg-danger-500';
    if (strengthScore === 2) return 'bg-warning-500';
    if (strengthScore === 3) return 'bg-primary-400';
    return 'bg-accent-500';
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row select-none overflow-hidden font-sans">
      
      {/* Left Section: Visual Branding */}
      <div 
        className="hidden md:flex md:w-[50%] p-16 flex-col items-center justify-center relative text-white shrink-0 select-none overflow-hidden"
        style={{ backgroundColor: '#0F172A' }}
      >
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-[100px]" />

        {/* Centered Logo Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-[2.5rem] p-12 flex flex-col items-center justify-center shadow-2xl w-full max-w-[380px] z-10 ring-1 ring-white/10">
          <div className="h-24 w-24 rounded-3xl bg-primary-500 flex items-center justify-center mb-8 shadow-2xl shadow-primary-500/20 ring-4 ring-primary-500/10">
            <Logo className="h-14 w-14 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tighter mb-2">Examify</h2>
          <p className="text-primary-400 font-extrabold text-[10px] uppercase tracking-[0.25em] mb-6">Nền tảng giáo dục</p>
          <p className="text-slate-400 font-bold text-xs leading-relaxed text-center px-4 uppercase tracking-wide">
            Tổ chức kiểm tra trực tuyến an toàn, thông minh và dễ mở rộng cho nhà trường.
          </p>
        </div>
        
        {/* Footer info */}
        <div className="absolute bottom-16 text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em]">
          &copy; 2026 Examify Platforms Enterprise.
        </div>
      </div>

      {/* Right Section: Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-[#F9FAFB] overflow-y-auto">
        <div className="w-full max-w-[480px] bg-white border border-secondary-50 rounded-[2.5rem] shadow-2xl shadow-secondary-200/50 p-10 sm:p-14">
          
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-secondary-900 tracking-tight mb-2">Tạo tài khoản Examify</h1>
            <p className="text-secondary-400 text-sm font-bold uppercase tracking-widest">Tham gia nền tảng kiểm tra trực tuyến</p>
          </div>

          {error && (
            <div className="mb-8 flex items-start gap-3 p-5 rounded-2xl bg-danger-50 border border-danger-100 text-danger-700 text-xs font-bold">
              <AlertCircle className="h-5 w-5 shrink-0 text-danger-500" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.2em] ml-1">Họ và tên</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-300 group-focus-within:text-primary-500 transition-colors">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ tên đầy đủ"
                  required
                  className="w-full pl-12 pr-4 py-4 border border-secondary-200 rounded-2xl text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.2em] ml-1">Địa chỉ email</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-300 group-focus-within:text-primary-500 transition-colors">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ten@truong.edu.vn"
                  required
                  className="w-full pl-12 pr-4 py-4 border border-secondary-200 rounded-2xl text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.2em] ml-1">Mật khẩu</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-300 group-focus-within:text-primary-500 transition-colors">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu an toàn"
                  required
                  className="w-full pl-12 pr-12 py-4 border border-secondary-200 rounded-2xl text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-300 hover:text-secondary-600 transition-all p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength bars */}
              <div className="h-1.5 w-full flex gap-1.5 px-1 select-none">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-full flex-1 rounded-full transition-all duration-500 ${getSegmentColor(i)}`} />
                ))}
              </div>

              {/* Security Checklist */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-5 bg-secondary-50/50 rounded-2xl border border-secondary-50 mt-4">
                {[
                  { met: hasMinLength, label: 'Tối thiểu 8 ký tự' },
                  { met: hasUppercase, label: 'Chữ hoa' },
                  { met: hasNumber, label: 'Chữ số' },
                  { met: hasSpecialChar, label: 'Ký tự đặc biệt' }
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className={`h-3.5 w-3.5 transition-colors ${req.met ? 'text-accent-500' : 'text-secondary-200'}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${req.met ? 'text-secondary-700' : 'text-secondary-400'}`}>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.2em] ml-1">Xác nhận mật khẩu</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-300 group-focus-within:text-primary-500 transition-colors">
                  <Lock size={18} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                  className="w-full pl-12 pr-12 py-4 border border-secondary-200 rounded-2xl text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-300 hover:text-secondary-600 transition-all p-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full h-14 text-base shadow-xl shadow-primary-500/30 mt-4"
            >
              Tạo tài khoản
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[11px] font-bold text-secondary-400 uppercase tracking-widest">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-primary-500 hover:text-primary-700 font-extrabold transition-all ml-1">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
