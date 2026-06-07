import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const user = await login(email, password);
      
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-500/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* App Title Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-4 shadow-lg shadow-brand-500/5">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-100 tracking-wide">
            Welcome back to <span className="bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">Examify</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">Enterprise Multiple-Choice Exam Platform</p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel p-8 mb-6">
          <h2 className="font-semibold text-lg text-slate-200 mb-6">Sign In</h2>
          
          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="glass-input pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input pl-11"
                  required
                />
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
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors duration-150">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Fill Box */}
        <div className="glass-panel p-5 border-dashed border-dark-700/80 bg-dark-900/20">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3.5 text-center">Demo Quick-Fill Credentials</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickFill('admin@examify.com', 'admin123')}
              className="px-2.5 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-xs font-medium transition-all duration-200"
            >
              System Admin
            </button>
            <button
              onClick={() => handleQuickFill('teacher@examify.com', 'teacher123')}
              className="px-2.5 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 text-xs font-medium transition-all duration-200"
            >
              Dr. Sarah (Teacher)
            </button>
            <button
              onClick={() => handleQuickFill('student@examify.com', 'student123')}
              className="px-2.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-xs font-medium transition-all duration-200"
            >
              Alex (Student)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
