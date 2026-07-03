import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, User, Mail, Lock, UserCheck, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const user = await register(name, email, password, role);
      
      // Redirect based on role
      if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-500/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* App Title Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-4 shadow-lg shadow-brand-500/5">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-100 tracking-wide">
            Tham gia <span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">Examify</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">Tạo tài khoản học tập của bạn</p>
        </div>

        {/* Register Form Card */}
        <div className="glass-panel p-8 mb-6">
          <h2 className="font-semibold text-lg text-slate-200 mb-6">Đăng ký</h2>
          
          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="glass-input pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Địa chỉ email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nguyenvana@example.com"
                  className="glass-input pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="glass-input pl-11"
                  required
                />
              </div>
            </div>

            {/* Role Radio Cards */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Tôi đăng ký với vai trò:</label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <div
                  onClick={() => setRole('student')}
                  className={`
                    cursor-pointer p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-200
                    ${role === 'student'
                      ? 'border-brand-500 bg-brand-500/5 text-slate-100 shadow-md shadow-brand-500/5'
                      : 'border-dark-700 bg-dark-900/40 text-slate-400 hover:border-dark-600 hover:text-slate-300'}
                  `}
                >
                  <GraduationCap className={`h-6 w-6 mb-2 ${role === 'student' ? 'text-brand-400' : 'text-slate-500'}`} />
                  <span className="text-sm font-semibold">Học sinh</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Làm bài và xem phản hồi</span>
                </div>

                <div
                  onClick={() => setRole('teacher')}
                  className={`
                    cursor-pointer p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-200
                    ${role === 'teacher'
                      ? 'border-indigo-500 bg-indigo-500/5 text-slate-100 shadow-md shadow-indigo-500/5'
                      : 'border-dark-700 bg-dark-900/40 text-slate-400 hover:border-dark-600 hover:text-slate-300'}
                  `}
                >
                  <UserCheck className={`h-6 w-6 mb-2 ${role === 'teacher' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="text-sm font-semibold">Giáo viên</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Tạo bài thi và xem điểm</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow-button w-full mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors duration-150">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
