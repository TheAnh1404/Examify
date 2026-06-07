import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, Lock, Eye, EyeOff, AlertCircle, GraduationCap, User, Shield, Clock, CheckCircle } from 'lucide-react';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const data = await authService.login(email, password);
      
      const roleUpper = data.user.role.toUpperCase();
      if (roleUpper === 'ADMIN') navigate('/admin/dashboard');
      else if (roleUpper === 'TEACHER') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setError('');
    setEmail(demoEmail);
    setPassword(demoPass);
    
    try {
      setLoading(true);
      const data = await authService.login(demoEmail, demoPass);
      const roleUpper = data.user.role.toUpperCase();
      if (roleUpper === 'ADMIN') navigate('/admin/dashboard');
      else if (roleUpper === 'TEACHER') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Demo sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row select-none overflow-hidden font-sans">
      
      {/* Left Section: Branding & Mockup Illustration */}
      <div className="hidden md:flex md:w-[50%] bg-[#0F172A] p-16 flex-col justify-between relative text-white border-r border-slate-800/50">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-[100px] -ml-24 -mb-24" />

        {/* Logo and App Title */}
        <div className="flex items-center gap-4 relative z-10">
          <Logo className="h-12 w-12 shadow-2xl" />
          <span className="font-extrabold text-white text-3xl tracking-tighter">Examify</span>
        </div>

        {/* Hero Copy & Dashboard Mockup */}
        <div className="relative z-10 max-w-md my-auto space-y-16">
          <div className="space-y-6">
            <h2 className="text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              Enterprise <br />Assessments.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed font-bold uppercase tracking-widest text-[11px]">
              The Gold Standard for secure, scalable, and intelligent assessment solutions.
            </p>
          </div>
          
          {/* Dashboard Schematic Card */}
          <div className="relative mx-auto w-full max-w-sm aspect-[4/3] bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-5 backdrop-blur-md shadow-2xl ring-1 ring-white/10">
            {/* Mock Header */}
            <div className="h-6 bg-white/10 rounded-lg w-full flex items-center px-3 gap-2 shrink-0">
              <span className="h-2 w-2 rounded-full bg-red-400/50" />
              <span className="h-2 w-2 rounded-full bg-yellow-400/50" />
              <span className="h-2 w-2 rounded-full bg-green-400/50" />
            </div>

            {/* Mock Dashboard Grid */}
            <div className="flex-1 flex gap-4 min-h-0">
              {/* Mock Sidebar */}
              <div className="w-1/4 bg-white/5 rounded-xl p-3 flex flex-col gap-3">
                <div className="h-2 bg-white/10 rounded w-full" />
                <div className="h-2 bg-white/10 rounded w-2/3" />
                <div className="h-2 bg-white/20 rounded w-5/6" />
              </div>

              {/* Mock Core Panels */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-12 bg-white/5 rounded-xl border border-white/5" />
                  <div className="h-12 bg-white/5 rounded-xl border border-white/5" />
                </div>
                <div className="flex-1 bg-white/5 rounded-xl border border-white/5" />
              </div>
            </div>

            {/* Floating Badge 1 */}
            <div className="absolute bottom-[20%] left-[-20px] bg-white text-slate-800 shadow-2xl shadow-black/40 border border-slate-100 rounded-2xl px-5 py-3 flex items-center gap-4 shrink-0 transform -translate-x-2 transition-all hover:scale-105 select-none ring-1 ring-black/5">
              <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 animate-pulse">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">Exam in Progress</span>
                <span className="text-sm font-black text-red-600 tracking-tight leading-none">12:45 remaining</span>
              </div>
            </div>

            {/* Floating Badge 2 */}
            <div className="absolute top-[40%] right-[-15px] bg-white text-slate-800 shadow-2xl shadow-black/40 border border-slate-100 rounded-[1.25rem] p-4 flex items-center gap-3 w-[160px] shrink-0 transition-all hover:scale-105 select-none ring-1 ring-black/5">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5" strokeWidth={3} />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="h-2 bg-slate-100 rounded-full w-full" />
                <div className="h-2 bg-emerald-500 rounded-full w-4/5 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em]">
          &copy; 2026 Examify Platforms Enterprise.
        </div>
      </div>

      {/* Right Section: Login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-[#F9FAFB] overflow-y-auto">
        <div className="w-full max-w-[460px] bg-white border border-secondary-50 rounded-[2.5rem] shadow-2xl shadow-secondary-200/50 p-10 sm:p-14">
          
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-secondary-900 tracking-tight mb-2">Welcome back</h1>
            <p className="text-secondary-400 text-sm font-bold uppercase tracking-widest">Sign in to your enterprise portal</p>
          </div>

          {error && (
            <div className="mb-8 flex items-start gap-3 p-5 rounded-2xl bg-danger-50 border border-danger-100 text-danger-700 text-xs font-bold">
              <AlertCircle className="h-5 w-5 shrink-0 text-danger-500" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.2em] ml-1">Corporate Email</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-300 group-focus-within:text-primary-500 transition-colors">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-12 pr-4 py-4 border border-secondary-200 rounded-2xl text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.2em] ml-1">Access Password</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-300 group-focus-within:text-primary-500 transition-colors">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            <div className="flex items-center justify-between text-xs pt-2 pb-2">
              <label className="flex items-center gap-2.5 text-secondary-500 cursor-pointer select-none group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="appearance-none h-5 w-5 rounded-lg border-2 border-secondary-200 checked:bg-primary-500 checked:border-primary-500 transition-all cursor-pointer"
                  />
                  <CheckCircle className={`absolute h-3.5 w-3.5 text-white pointer-events-none transition-opacity ${rememberMe ? 'opacity-100' : 'opacity-0'}`} />
                </div>
                <span className="font-bold text-secondary-400 uppercase tracking-widest text-[10px]">Stay logged in</span>
              </label>
              <Link to="/forgot-password" opacity-100 className="text-primary-500 hover:text-primary-700 font-extrabold uppercase tracking-widest text-[10px] transition-colors">
                Recover Access
              </Link>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full h-14 text-base shadow-xl shadow-primary-500/30"
            >
              Sign In to System
            </Button>
          </form>

          {/* Quick Sign-In Divider */}
          <div className="relative my-10 text-center select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-50" />
            </div>
            <span className="relative bg-white px-4 text-[9px] font-extrabold text-secondary-300 uppercase tracking-[0.25em]">
              Credential Presets
            </span>
          </div>

          {/* Quick login grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { role: 'Admin', email: 'admin@examify.com', pass: '123456', icon: Shield, color: 'text-primary-600 bg-primary-50 hover:bg-primary-100/50' },
              { role: 'Teacher', email: 'teacher@examify.com', pass: '123456', icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100/50' },
              { role: 'Student', email: 'student@examify.com', pass: '123456', icon: User, color: 'text-accent-600 bg-accent-50 hover:bg-accent-100/50' }
            ].map((item) => (
              <button
                key={item.role}
                onClick={() => handleDemoLogin(item.email, item.pass)}
                disabled={loading}
                className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border border-secondary-50 bg-white transition-all disabled:opacity-50 hover:shadow-xl hover:shadow-secondary-200/40 group ${item.color}`}
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-current/10 shrink-0 transition-transform group-hover:scale-110">
                  <item.icon size={20} />
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-secondary-500">{item.role}</span>
              </button>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-[11px] font-bold text-secondary-400 uppercase tracking-widest">
              New to the platform?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-700 font-extrabold transition-all ml-1">
                Establish Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
