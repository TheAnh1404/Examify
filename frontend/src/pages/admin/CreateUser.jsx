import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { subjectService } from '../../services/subjectService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { ArrowLeft, User, Mail, Lock, ShieldAlert, CheckCircle, BookOpen } from 'lucide-react';

const CreateUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [teachingAssignments, setTeachingAssignments] = useState({});

  useEffect(() => {
    subjectService.getAll()
      .then(response => setSubjects(response.data))
      .catch(err => setError(err.message || 'Failed to load subjects.'));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required inputs.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      const res = await userService.create({
        ...formData,
        teachingAssignments: formData.role === 'TEACHER'
          ? Object.entries(teachingAssignments).map(([subjectId, note]) => ({ subjectId: Number(subjectId), note }))
          : []
      });
      setSuccess(`User account for "${res.data.name}" provisioned successfully.`);
      
      setTimeout(() => {
        navigate('/admin/users');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTeachingSubject = (subjectId) => {
    setTeachingAssignments((current) => {
      const next = { ...current };
      if (Object.hasOwn(next, subjectId)) delete next[subjectId];
      else next[subjectId] = '';
      return next;
    });
  };

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
            title="Create User Profile" 
            subtitle="Provision system access credentials for students, instructors, or administrators."
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-slide-up">
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

      <Card title="Account Details" subtitle="Submit user metadata to create record">
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
            label="Account Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Minimum 8 characters"
            minLength={8}
            required
            icon={<Lock className="h-4.5 w-4.5" />}
          />

          <Select 
            label="System Access Role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            options={[
              { value: 'STUDENT', label: 'Student Taker' },
              { value: 'TEACHER', label: 'Instructor/Teacher' },
              { value: 'ADMIN', label: 'System Administrator' }
            ]}
            required
          />

          {formData.role === 'TEACHER' && (
            <div className="space-y-3 pt-4 border-t border-secondary-200">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary-600" />
                <div>
                  <h4 className="text-sm font-bold text-secondary-800">Teaching Subjects</h4>
                  <p className="text-xs text-secondary-500">Register the subjects this teacher is allowed to teach.</p>
                </div>
              </div>
              {subjects.map((subject) => {
                const selected = Object.hasOwn(teachingAssignments, subject.id);
                return (
                  <div key={subject.id} className="rounded-xl border border-secondary-200 p-3 space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleTeachingSubject(subject.id)}
                        className="h-4 w-4 rounded border-secondary-300 text-primary-600"
                      />
                      <span className="text-sm font-semibold text-secondary-800">{subject.code} - {subject.name}</span>
                    </label>
                    {selected && (
                      <input
                        value={teachingAssignments[subject.id]}
                        onChange={(event) => setTeachingAssignments((current) => ({
                          ...current,
                          [subject.id]: event.target.value
                        }))}
                        placeholder="Assignment note, class, or responsibility..."
                        className="saas-input text-sm"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-secondary-200">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/users')}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1"
            >
              Create Account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateUser;
