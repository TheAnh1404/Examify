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
      .catch(err => setError(err.message || 'Không thể tải danh sách môn học.'));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
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
      setSuccess(`Đã tạo tài khoản cho "${res.data.name}".`);
      
      setTimeout(() => {
        navigate('/admin/users');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Không thể tạo người dùng.');
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
            title="Tạo hồ sơ người dùng"
            subtitle="Cấp tài khoản truy cập hệ thống cho học sinh, giáo viên hoặc quản trị viên."
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

      <Card title="Thông tin tài khoản" subtitle="Nhập thông tin để tạo hồ sơ người dùng">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Họ và tên"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nguyễn Văn A"
            required
            icon={<User className="h-4.5 w-4.5" />}
          />

          <Input 
            label="Địa chỉ email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="nguyenvana@example.com"
            required
            icon={<Mail className="h-4.5 w-4.5" />}
          />

          <Input 
            label="Mật khẩu tài khoản"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Tối thiểu 8 ký tự"
            minLength={8}
            required
            icon={<Lock className="h-4.5 w-4.5" />}
          />

          <Select 
            label="Vai trò truy cập"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            options={[
              { value: 'STUDENT', label: 'Học sinh' },
              { value: 'TEACHER', label: 'Giáo viên' },
              { value: 'ADMIN', label: 'Quản trị viên' }
            ]}
            required
          />

          {formData.role === 'TEACHER' && (
            <div className="space-y-3 pt-4 border-t border-secondary-200">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary-600" />
                <div>
                  <h4 className="text-sm font-bold text-secondary-800">Môn giảng dạy</h4>
                  <p className="text-xs text-secondary-500">Chọn các môn giáo viên này được phép giảng dạy.</p>
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
                        placeholder="Ghi chú phân công, lớp hoặc trách nhiệm..."
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
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1"
            >
              Tạo tài khoản
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateUser;
