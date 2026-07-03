import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { subjectService } from '../../services/subjectService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { ArrowLeft, User, Mail, Lock, ShieldAlert, CheckCircle, BookOpen } from 'lucide-react';
import { authService } from '../../services/authService';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser() || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    status: 'ACTIVE'
  });

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [teachingAssignments, setTeachingAssignments] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [res, subjectResponse] = await Promise.all([
          userService.getById(id),
          subjectService.getAll()
        ]);
        setSubjects(subjectResponse.data);
        setTeachingAssignments(Object.fromEntries(
          (res.data.teachingSubjects || []).map((assignment) => [
            String(assignment.subjectId),
            assignment.note || ''
          ])
        ));
        setFormData({
          name: res.data.name,
          email: res.data.email,
          role: res.data.role.toUpperCase(),
          status: res.data.status,
          password: '' // blank by default (only change if entered)
        });
      } catch (err) {
        console.error(err);
        setError('Không thể tải thông tin người dùng.');
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
      setError('Họ tên và email là bắt buộc.');
      return;
    }
    if (formData.password && formData.password.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setSaveLoading(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status
      };
      if (formData.password) payload.password = formData.password;

      await userService.update(id, payload);
      if (formData.role === 'TEACHER') {
        await userService.updateTeachingSubjects(id, Object.entries(teachingAssignments).map(([subjectId, note]) => ({
          subjectId: Number(subjectId),
          note
        })));
      }
      setSuccess('Cập nhật tài khoản thành công.');
      
      setTimeout(() => {
        navigate('/admin/users');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật người dùng.');
    } finally {
      setSaveLoading(false);
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

  const updateAssignmentNote = (subjectId, note) => {
    setTeachingAssignments((current) => ({ ...current, [subjectId]: note }));
  };

  if (loading) return <Loading message="Đang tải thông tin người dùng..." />;

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
            title="Chỉnh sửa hồ sơ người dùng"
            subtitle="Cập nhật quyền hệ thống, vai trò và thông tin truy cập."
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

      <Card title="Thông tin tài khoản" subtitle={`Đang chỉnh sửa hồ sơ ID: ${id}`}>
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
            label="Mật khẩu tài khoản (để trống nếu không đổi)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Nhập mật khẩu mới"
            icon={<Lock className="h-4.5 w-4.5" />}
          />

          <Select 
            label="Vai trò truy cập"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            disabled={Number(id) === Number(currentUser.id)}
            options={[
              { value: 'STUDENT', label: 'Học sinh' },
              { value: 'TEACHER', label: 'Giáo viên' },
              { value: 'ADMIN', label: 'Quản trị viên' }
            ]}
            required
          />
          {Number(id) === Number(currentUser.id) && (
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Bạn không thể tự thay đổi vai trò quản trị của mình.</p>
          )}

          <Select
            label="Trạng thái tài khoản"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            disabled={Number(id) === Number(currentUser.id)}
            options={[
              { value: 'ACTIVE', label: 'Hoạt động' },
              { value: 'LOCKED', label: 'Đã khóa' }
            ]}
            required
          />

          {formData.role === 'TEACHER' && (
            <div className="space-y-3 pt-4 border-t border-secondary-200">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary-600" />
                <div>
                  <h4 className="text-sm font-bold text-secondary-800">Môn giảng dạy</h4>
                  <p className="text-xs text-secondary-500">Giáo viên chỉ có thể tạo câu hỏi và bài thi cho các môn đã chọn.</p>
                </div>
              </div>

              {subjects.length === 0 ? (
                <p className="text-xs text-warning-700 bg-warning-50 border border-warning-100 rounded-xl p-3">
                  Chưa có môn học. Hãy tạo môn học trước khi phân quyền giảng dạy.
                </p>
              ) : (
                <div className="space-y-2">
                  {subjects.map((subject) => {
                    const selected = Object.hasOwn(teachingAssignments, subject.id);
                    return (
                      <div key={subject.id} className="rounded-xl border border-secondary-200 p-3 space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleTeachingSubject(subject.id)}
                            className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm font-semibold text-secondary-800">
                            {subject.code} - {subject.name}
                          </span>
                        </label>
                        {selected && (
                          <input
                            value={teachingAssignments[subject.id]}
                            onChange={(event) => updateAssignmentNote(subject.id, event.target.value)}
                            placeholder="Ghi chú phân công, lớp hoặc trách nhiệm..."
                            className="saas-input text-sm"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-secondary-200">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/users')}
              className="flex-1"
              disabled={saveLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saveLoading}
              className="flex-1"
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditUser;
