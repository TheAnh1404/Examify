import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please input your email address.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      const res = await authService.forgotPassword(email);
      setSuccess(res.message || 'Reset instructions sent to email.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Error processing forgot password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-bg flex flex-col items-center justify-center p-6 select-none relative">
      <div className="max-w-md w-full space-y-6">
        
        {/* Title Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">E</div>
            <span className="font-bold text-2xl text-secondary-800 tracking-wide">Examify</span>
          </Link>
          <p className="text-secondary-400 text-sm font-medium font-sans">Password recovery center</p>
        </div>

        {/* Form Card */}
        <Card title="Reset Password" subtitle="Input your email, and we will send a password reset route link">
          
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs font-semibold animate-slide-up">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 p-3.5 rounded-lg bg-accent-50 border border-accent-100 text-accent-700 text-xs font-semibold animate-slide-up">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{success}</span>
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

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-2"
            >
              Send Instructions
            </Button>
          </form>

          <div className="mt-5 text-center flex items-center justify-center">
            <Link to="/login" className="text-xs text-secondary-500 hover:text-primary-600 font-semibold flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
