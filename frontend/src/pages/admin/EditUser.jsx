import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { ArrowLeft, User, Mail, Lock, ShieldAlert, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser() || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userService.getById(id);
        setFormData({
          name: res.data.name,
          email: res.data.email,
          role: res.data.role.toUpperCase(),
          password: '' // blank by default (only change if entered)
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load user credentials.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError('Name and Email are required.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setSaveLoading(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      if (formData.password) payload.password = formData.password;

      await userService.update(id, payload);
      setSuccess(`User account updated successfully.`);
      
      setTimeout(() => {
        navigate('/admin/users');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update user.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <Loading message="Loading user details..." />;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 shrink-0">
        <Link 
          to="/admin/users" 
          className="p-2 rounded-lg bg-white border border-secondary-300 hover:bg-secondary-50 text-secondary-500 hover:text-secondary-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <PageHeader 
            title="Edit User Profile" 
            subtitle="Modify system permissions, role indicators, and access credentials."
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-105 text-red-700 text-sm animate-slide-up">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-accent-50 border border-accent-100 text-accent-700 text-sm animate-slide-up">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <Card title="Account Details" subtitle={`Modifying profile ID: ${id}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="John Doe"
            required
            icon={<User className="h-4.5 w-4.5" />}
          />

          <Input 
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john.doe@example.com"
            required
            icon={<Mail className="h-4.5 w-4.5" />}
          />

          <Input 
            label="Account Password (Leave blank to keep current)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            icon={<Lock className="h-4.5 w-4.5" />}
          />

          <Select 
            label="System Access Role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            disabled={id === currentUser.id}
            options={[
              { value: 'STUDENT', label: 'Student Taker' },
              { value: 'TEACHER', label: 'Instructor/Teacher' },
              { value: 'ADMIN', label: 'System Administrator' }
            ]}
            required
          />
          {id === currentUser.id && (
            <p className="text-[10px] text-amber-600 font-semibold mt-1">You cannot modify your own administrative role indicator.</p>
          )}

          <div className="flex gap-3 pt-4 border-t border-secondary-200">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/users')}
              className="flex-1"
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saveLoading}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditUser;
