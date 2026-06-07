import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import Logo from '../../components/common/Logo';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please input your registered email address.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      const res = await authService.forgotPassword(email);
      setSuccess(res.message || 'Recovery instructions sent to your email.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Error processing password recovery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 select-none font-sans relative">
      
      {/* Top Small Logo */}
      <div className="flex items-center gap-2 mb-6">
        <Logo className="h-7 w-7" />
        <span className="font-extrabold text-[#2563EB] text-lg tracking-tight">Examify</span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/60 p-7 sm:p-8 text-center">
        
        {success ? (
          <div className="space-y-6 py-4">
            <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-slate-900 tracking-tight">Check your email</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                We've sent recovery instructions to your inbox. Please check your spam folder if it doesn't arrive in a few minutes.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 rounded-lg font-semibold text-sm transition shadow-md shadow-blue-500/10"
            >
              Back to Sign In
            </button>
            <button 
              onClick={() => setSuccess('')}
              className="text-xs text-slate-400 font-bold hover:text-blue-600 transition"
            >
              Resend Link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Custom Envelope Shield Graphic */}
            <div className="flex justify-center select-none py-1">
              <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-sm">
                {/* Circular soft blue glow background */}
                <circle cx="65" cy="65" r="50" fill="url(#bg-glow)" opacity="0.4" />
                <circle cx="65" cy="65" r="40" fill="url(#bg-inner-glow)" opacity="0.6" />
                
                {/* Envelope Body */}
                <rect x="25" y="42" width="80" height="52" rx="10" fill="white" stroke="#60A5FA" strokeWidth="3" />
                {/* Envelope Flap Fold lines */}
                <path d="M26.5 44L65 68L103.5 44" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M26.5 92L55 70" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M103.5 92L75 70" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Shield Overlay in center */}
                <g filter="url(#shield-shadow)">
                  <path d="M65 52C65 52 75 55 75 66C75 74 65 81 65 81C65 81 55 74 55 66C55 55 65 52 65 52Z" fill="url(#shield-gradient)" />
                  <path d="M65 52C65 52 75 55 75 66C75 74 65 81 65 81C65 81 55 74 55 66C55 55 65 52 65 52Z" stroke="#F59E0B" strokeWidth="1.5" />
                </g>
                
                {/* Key inside Shield */}
                <circle cx="65" cy="62" r="3" stroke="#D97706" strokeWidth="1.5" />
                <path d="M65 65V74M65 69H68M65 72H68" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />

                {/* SVG Definitions */}
                <defs>
                  <radialGradient id="bg-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(65 65) rotate(90) scale(50)">
                    <stop stopColor="#DBEAFE" />
                    <stop offset="1" stopColor="#DBEAFE" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="bg-inner-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(65 65) rotate(90) scale(40)">
                    <stop stopColor="#93C5FD" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#93C5FD" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="shield-gradient" x1="55" y1="52" x2="75" y2="81" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FBBF24" />
                    <stop offset="1" stopColor="#D97706" />
                  </linearGradient>
                  <filter id="shield-shadow" x="50" y="48" width="30" height="40" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#1E3A8A" floodOpacity="0.25" />
                  </filter>
                </defs>
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-1.5">Forgot Password?</h1>
              <p className="text-slate-500 text-xs leading-relaxed px-4">
                Enter your email address and we'll send you a password reset link.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold text-left">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="border-t border-slate-100 mt-6 pt-4" />

            {/* Return Link */}
            <div className="flex justify-center text-xs">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-1.5 font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Page Footer */}
      <div className="mt-8 text-slate-400 text-xs text-center font-medium">
        &copy; 2024 Examify Education Systems. All rights reserved.
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
