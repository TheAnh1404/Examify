import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please input all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      const res = await authService.resetPassword('mock-token', password);
      setSuccess(res.message || 'Password updated successfully!');
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-bg flex flex-col items-center justify-center p-6 select-none relative">
      <div className="max-w-md w-full space-y-6">
        
        <div className="flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">E</div>
          <span className="font-bold text-2xl text-secondary-800 tracking-wide mt-2">Examify</span>
        </div>

        <Card title="Update Password" subtitle="Configure a new password profile credential">
          
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3.5 rounded-lg bg-red-50 border border-red-100 text-red-700 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 p-3.5 rounded-lg bg-accent-50 border border-accent-100 text-accent-700 text-xs font-semibold">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              icon={<Lock className="h-4.5 w-4.5" />}
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              icon={<Lock className="h-4.5 w-4.5" />}
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-2"
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
