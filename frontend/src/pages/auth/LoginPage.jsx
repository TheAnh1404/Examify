import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, Lock, Eye, EyeOff, AlertCircle, GraduationCap, User, Shield, Clock, CheckCircle } from 'lucide-react';
import Logo from '../../components/common/Logo';

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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row select-none overflow-hidden font-sans">
      
      {/* Left Section: Branding & Mockup Illustration */}
      <div className="hidden md:flex md:w-[50%] bg-gradient-to-br from-[#1E40AF] via-[#0F172A] to-[#0F172A] p-12 lg:p-16 flex-col justify-between relative text-white">
        
        {/* Logo and App Title */}
        <div className="flex items-center gap-3 relative z-10">
          <Logo className="h-9 w-9 bg-white rounded-lg p-0.5" />
          <span className="font-bold text-white text-xl tracking-tight">Examify</span>
        </div>

        {/* Hero Copy & Dashboard Mockup */}
        <div className="relative z-10 max-w-md my-auto space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
              Learn Smarter, <br />Test Better.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed font-normal">
              Empowering Institutions with secure, scalable, and intelligent assessment solutions.
            </p>
          </div>
          
          {/* Dashboard Schematic Card */}
          <div className="relative mx-auto w-full max-w-sm aspect-[4/3] bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-sm shadow-2xl">
            {/* Mock Header */}
            <div className="h-5 bg-white/10 rounded-md w-full flex items-center px-2 gap-1.5 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <div className="h-3 bg-white/5 rounded flex-1 ml-2" />
            </div>

            {/* Mock Dashboard Grid */}
            <div className="flex-1 flex gap-3 min-h-0">
              {/* Mock Sidebar */}
              <div className="w-1/4 bg-white/5 rounded-lg p-2 flex flex-col gap-2">
                <div className="h-2 bg-white/10 rounded w-3/4" />
                <div className="h-2 bg-white/10 rounded w-1/2" />
                <div className="h-2 bg-white/15 rounded w-5/6" />
                <div className="h-2 bg-white/10 rounded w-2/3" />
              </div>

              {/* Mock Core Panels */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Horizontal stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-white/5 rounded-lg border border-white/5 p-2 flex flex-col justify-between">
                    <div className="h-1 bg-white/10 rounded w-1/2" />
                    <div className="h-2.5 bg-white/20 rounded w-3/4" />
                  </div>
                  <div className="h-10 bg-white/5 rounded-lg border border-white/5 p-2 flex flex-col justify-between">
                    <div className="h-1 bg-white/10 rounded w-1/2" />
                    <div className="h-2.5 bg-white/20 rounded w-2/3" />
                  </div>
                </div>

                {/* Big Panel */}
                <div className="flex-1 bg-white/5 rounded-lg border border-white/5 p-2 flex flex-col gap-2">
                  <div className="h-2 bg-white/10 rounded w-1/3" />
                  <div className="h-2 bg-white/10 rounded w-full" />
                  <div className="h-2 bg-white/10 rounded w-5/6" />
                  <div className="h-2 bg-white/10 rounded w-4/5" />
                </div>
              </div>
            </div>

            {/* Floating Badge 1: Exam in Progress (Bottom Left) */}
            <div className="absolute bottom-[20%] left-[-20px] bg-white text-slate-800 shadow-xl shadow-black/20 border border-slate-100 rounded-full px-4 py-2.5 flex items-center gap-3 shrink-0 transform -translate-x-2 transition-all hover:scale-105 select-none">
              <div className="h-6 w-6 rounded-full bg-red-50 flex items-center justify-center text-red-500 animate-pulse">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Exam in Progress</span>
                <span className="text-xs font-black text-red-500 tracking-tight leading-tight mt-0.5">12:45</span>
              </div>
            </div>

            {/* Floating Badge 2: Progress Check (Middle Right) */}
            <div className="absolute top-[40%] right-[-15px] bg-white text-slate-800 shadow-xl shadow-black/20 border border-slate-100 rounded-xl p-3 flex items-center gap-2.5 w-[150px] shrink-0 transition-all hover:scale-105 select-none">
              <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle className="h-3.5 w-3.5" strokeWidth={3} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="h-1.5 bg-slate-100 rounded-full w-full" />
                <div className="h-1 bg-slate-100 rounded-full w-2/3" />
                <div className="h-1 bg-emerald-500 rounded-full w-4/5" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-slate-400 text-xs font-medium">
          &copy; 2024 Examify Inc. All rights reserved.
        </div>
      </div>

      {/* Right Section: Welcome back card */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-[#FAFBFC] md:bg-white overflow-y-auto">
        <div className="w-full max-w-[420px] bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/40 p-6 sm:p-8 md:p-9">
          
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Welcome back</h1>
            <p className="text-slate-500 text-sm font-medium">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
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

            {/* Checkbox and Forgot password link */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1 pb-2">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 transition"
                />
                <span className="font-semibold text-slate-500 text-xs sm:text-sm">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Quick Sign-In Divider */}
          <div className="relative my-6 text-center select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Or login as
            </span>
          </div>

          {/* Quick login grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { role: 'Admin', email: 'admin@examify.com', pass: 'admin123', icon: Shield, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100/50 hover:border-purple-200' },
              { role: 'Teacher', email: 'teacher@examify.com', pass: 'teacher123', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100/50 hover:border-blue-200' },
              { role: 'Student', email: 'student@examify.com', pass: 'student123', icon: User, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100/50 hover:border-emerald-200' }
            ].map((item) => (
              <button
                key={item.role}
                onClick={() => handleDemoLogin(item.email, item.pass)}
                disabled={loading}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-slate-100 bg-white transition-all disabled:opacity-50 hover:shadow-sm ${item.color}`}
              >
                <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-current/10 shrink-0">
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-[10px] font-bold tracking-wide text-slate-600">{item.role}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center text-xs sm:text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
