import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Logo from '../../components/common/Logo';

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
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your input.');
      return;
    }

    if (strengthScore < 4) {
      setError('Password does not meet all security requirements.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      // Default register as STUDENT as requested by design layouts (no role dropdown in view)
      const data = await authService.register(name, email, password, 'STUDENT');
      
      const roleUpper = data.user.role.toUpperCase();
      if (roleUpper === 'TEACHER') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email address.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine strength colors for individual segments
  const getSegmentColor = (index) => {
    if (strengthScore === 0 || index >= strengthScore) return 'bg-slate-100';
    if (strengthScore === 1) return 'bg-red-500';
    if (strengthScore === 2) return 'bg-amber-500';
    if (strengthScore === 3) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row select-none overflow-hidden font-sans">
      
      {/* Left Section: Blue Grid Background and Centered Logo Card */}
      <div 
        className="hidden md:flex md:w-[50%] p-12 flex-col items-center justify-center relative text-white shrink-0 select-none"
        style={{
          backgroundColor: '#2563EB',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: 'center center'
        }}
      >
        {/* Centered White Card */}
        <div className="bg-white text-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl shadow-blue-900/30 w-full max-w-[340px] border border-slate-100/10">
          <Logo className="h-20 w-20 mb-6 shadow-md shadow-blue-500/15" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Examify</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-4">Learn Smarter, Test Better</p>
          <p className="text-slate-400 font-medium text-[11px] leading-relaxed text-center px-2">
            Join thousands of students and educators transforming the way assessments are created and managed.
          </p>
        </div>
      </div>

      {/* Right Section: Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-[#FAFBFC] md:bg-white overflow-y-auto">
        <div className="w-full max-w-[420px] bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/40 p-6 sm:p-8">
          
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Create Account</h1>
            <p className="text-slate-500 text-sm font-medium">Sign up to start building smarter exams.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                required
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
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

              {/* Password Strength Indicator Bars */}
              <div className="h-1.5 w-full flex gap-1 rounded-full overflow-hidden mt-1.5 select-none">
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${getSegmentColor(0)}`} />
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${getSegmentColor(1)}`} />
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${getSegmentColor(2)}`} />
                <div className={`h-full flex-1 rounded-full transition-all duration-300 ${getSegmentColor(3)}`} />
              </div>

              {/* Guidelines Box */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 mt-2 select-none">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password must contain:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                  
                  {/* Min length */}
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full shrink-0 transition-colors ${hasMinLength ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={hasMinLength ? 'text-slate-700' : 'text-slate-400'}>8+ characters</span>
                  </div>

                  {/* Uppercase */}
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full shrink-0 transition-colors ${hasUppercase ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={hasUppercase ? 'text-slate-700' : 'text-slate-400'}>1 uppercase</span>
                  </div>

                  {/* Number */}
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full shrink-0 transition-colors ${hasNumber ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={hasNumber ? 'text-slate-700' : 'text-slate-400'}>1 number</span>
                  </div>

                  {/* Special character */}
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full shrink-0 transition-colors ${hasSpecialChar ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={hasSpecialChar ? 'text-slate-700' : 'text-slate-400'}>1 special char</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md shadow-blue-500/10 mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs sm:text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
