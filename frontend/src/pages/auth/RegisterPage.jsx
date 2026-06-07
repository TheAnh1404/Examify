import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' or 'TEACHER'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all input fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const data = await authService.register(name, email, password, role);
      
      const roleUpper = data.user.role.toUpperCase();
      if (roleUpper === 'TEACHER') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email address.');
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
          <p className="text-secondary-400 text-sm font-medium">Create a new SaaS account</p>
        </div>

        {/* Register Card */}
        <Card title="Create Account" subtitle="Fill in details to set up your profile credentials">
          
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs font-semibold animate-slide-up">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              icon={<User className="h-4.5 w-4.5" />}
            />

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

            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              icon={<Lock className="h-4.5 w-4.5" />}
            />

            {/* Role Select Options Card layout */}
            <div className="space-y-1.5">
              <label className="saas-label">Registering as a:</label>
              <div className="grid grid-cols-2 gap-3.5 mt-1">
                <div
                  onClick={() => setRole('STUDENT')}
                  className={`
                    cursor-pointer p-4 rounded-xl border-2 text-center flex flex-col items-center gap-1 transition-all duration-150
                    ${role === 'STUDENT'
                      ? 'border-primary-500 bg-primary-50/20 text-secondary-800'
                      : 'border-secondary-200 hover:border-secondary-300 text-secondary-400 hover:text-secondary-500'}
                  `}
                >
                  <span className="text-sm font-semibold">Student</span>
                  <span className="text-[10px] text-secondary-400">Take exams & get reports</span>
                </div>
                
                <div
                  onClick={() => setRole('TEACHER')}
                  className={`
                    cursor-pointer p-4 rounded-xl border-2 text-center flex flex-col items-center gap-1 transition-all duration-150
                    ${role === 'TEACHER'
                      ? 'border-primary-500 bg-primary-50/20 text-secondary-800'
                      : 'border-secondary-200 hover:border-secondary-300 text-secondary-400 hover:text-secondary-500'}
                  `}
                >
                  <span className="text-sm font-semibold">Teacher</span>
                  <span className="text-[10px] text-secondary-400">Build exams & check scores</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-4"
            >
              Register
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-secondary-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
