import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      
      // Redirect based on role
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
    <div className="min-h-[85vh] bg-bg flex flex-col items-center justify-center p-6 select-none relative">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/10">
              <span className="font-display font-extrabold text-xl">E</span>
            </div>
            <span className="font-bold text-2xl text-secondary-800 tracking-wide">Examify</span>
          </Link>
          <p className="text-secondary-400 text-sm font-medium">Learn Smarter, Test Better</p>
        </div>

        {/* Login Card */}
        <Card title="Sign In to Platform" subtitle="Enter your credentials below to enter the portal">
          
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs font-semibold animate-slide-up">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              icon={<Mail className="h-4.5 w-4.5" />}
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="saas-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <Input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                icon={<Lock className="h-4.5 w-4.5" />}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-secondary-500 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold">
                Register here
              </Link>
            </p>
          </div>
        </Card>

        {/* Demo Fast Login */}
        <div className="bg-white border border-secondary-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest text-center">Quick Demo Portals</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('admin@examify.com', 'admin123')}
              disabled={loading}
              className="py-2 px-1 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] uppercase tracking-wider text-center transition-colors disabled:opacity-50"
            >
              Admin
            </button>
            <button
              onClick={() => handleDemoLogin('teacher@examify.com', 'teacher123')}
              disabled={loading}
              className="py-2 px-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] uppercase tracking-wider text-center transition-colors disabled:opacity-50"
            >
              Teacher
            </button>
            <button
              onClick={() => handleDemoLogin('student@examify.com', 'student123')}
              disabled={loading}
              className="py-2 px-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-wider text-center transition-colors disabled:opacity-50"
            >
              Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
