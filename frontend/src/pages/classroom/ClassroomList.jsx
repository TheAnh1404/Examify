import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { classroomService } from '../../services/classroomService';
import { subjectService } from '../../services/subjectService';
import { authService } from '../../services/authService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { GraduationCap, Users, Plus, Search, School, ArrowRight, User, LogIn, Clock, XCircle, CheckCircle, Send, MessageSquare } from 'lucide-react';

const ClassroomList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Student: Tab state
  const [activeTab, setActiveTab] = useState('classes');
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Student: Join Modal State
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [classPreview, setClassPreview] = useState(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Create Modal State (Teacher)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    subjectId: '',
    schoolName: user?.schoolName || '',
    bannerUrl: '',
    description: ''
  });

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const res = await classroomService.getAll({ search: searchQuery });
      setClassrooms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    if (!isTeacher) return;
    try {
      const res = await subjectService.getAll();
      setSubjects(res.data.map(s => ({ value: s.id, label: s.name })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyRequests = useCallback(async () => {
    if (!isStudent) return;
    try {
      setRequestsLoading(true);
      const res = await classroomService.getMyRequests();
      setMyRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestsLoading(false);
    }
  }, [isStudent]);

  useEffect(() => {
    fetchClassrooms();
    fetchSubjects();
  }, [searchQuery]);

  useEffect(() => {
    if (isStudent && activeTab === 'requests') {
      fetchMyRequests();
    }
  }, [activeTab, isStudent, fetchMyRequests]);

  // Debounced code check
  useEffect(() => {
    if (!classCode || classCode.length < 3) {
      setClassPreview(null);
      setCodeError('');
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingCode(true);
      setCodeError('');
      setClassPreview(null);
      try {
        const res = await classroomService.checkCode(classCode.trim());
        setClassPreview(res.data);
      } catch (err) {
        setCodeError(err.message);
      } finally {
        setCheckingCode(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [classCode]);

  const handleJoinRequest = async () => {
    if (!classPreview) return;
    setSubmittingJoin(true);
    try {
      await classroomService.enrollRequest({
        classroomId: classPreview.id,
        message: joinMessage.trim() || undefined
      });
      setJoinSuccess(true);
      setTimeout(() => {
        handleCloseJoinModal();
        if (activeTab === 'requests') {
          fetchMyRequests();
        }
      }, 1500);
    } catch (err) {
      setCodeError(err.message);
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false);
    setClassCode('');
    setClassPreview(null);
    setCodeError('');
    setJoinMessage('');
    setJoinSuccess(false);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.code.trim()) delete payload.code;
      if (!payload.bannerUrl.trim()) delete payload.bannerUrl;

      await classroomService.create(payload);
      setIsModalOpen(false);
      setFormData({ name: '', code: '', subjectId: '', schoolName: user?.schoolName || '', bannerUrl: '', description: '' });
      fetchClassrooms();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = myRequests.filter(r => r.status === 'PENDING').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" className="text-[10px] tracking-widest uppercase flex items-center gap-1.5"><Clock className="h-3 w-3" />Đang chờ</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" className="text-[10px] tracking-widest uppercase flex items-center gap-1.5"><XCircle className="h-3 w-3" />Từ chối</Badge>;
      case 'APPROVED':
        return <Badge variant="success" className="text-[10px] tracking-widest uppercase flex items-center gap-1.5"><CheckCircle className="h-3 w-3" />Đã duyệt</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={isTeacher ? "Lớp học của tôi" : "Lớp đã tham gia"}
        subtitle={isTeacher ? "Quản lý lớp học, môn học và tiến độ học sinh." : "Truy cập lớp đã đăng ký và gửi yêu cầu tham gia lớp mới."}
        actions={
          <>
            {isTeacher && (
              <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={<Plus className="h-4.5 w-4.5" />}>
                Tạo lớp học
              </Button>
            )}
            {isStudent && (
              <Button variant="primary" onClick={() => setIsJoinModalOpen(true)} icon={<LogIn className="h-4.5 w-4.5" />}>
                Tham gia lớp
              </Button>
            )}
          </>
        }
      />

      {/* Student Tabs */}
      {isStudent && (
        <div className="flex gap-2 p-1.5 bg-secondary-50 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'classes'
                ? 'bg-white text-secondary-900 shadow-lg shadow-secondary-200/50'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Lớp của tôi
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 ${
              activeTab === 'requests'
                ? 'bg-white text-secondary-900 shadow-lg shadow-secondary-200/50'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Chờ duyệt
            {pendingCount > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Tab: My Classes (or Teacher view) */}
      {(isTeacher || activeTab === 'classes') && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Tìm theo tên lớp, mã lớp hoặc trường..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-secondary-100 rounded-2xl focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none transition-all font-medium text-secondary-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <Loading message="Đang tải danh sách lớp học..." />
          ) : classrooms.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Không tìm thấy lớp học"
              description={searchQuery ? "Hãy thử thay đổi từ khóa tìm kiếm." : (isTeacher ? "Hãy bắt đầu bằng cách tạo lớp học đầu tiên." : "Bạn chưa tham gia lớp học nào. Hãy dùng 'Tham gia lớp' để bắt đầu.")}
              action={isTeacher && !searchQuery ? (
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>Tạo lớp đầu tiên</Button>
              ) : (isStudent && !searchQuery ? (
                <Button variant="primary" onClick={() => setIsJoinModalOpen(true)} icon={<LogIn className="h-4 w-4" />}>Tham gia lớp</Button>
              ) : null)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {classrooms.map((cls) => (
                <Card
                  key={cls.id}
                  className="group hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 border-none bg-white p-0 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`${location.pathname}/${cls.id}`)}
                >
                  {cls.bannerUrl ? (
                    <div className="h-32 w-full overflow-hidden">
                      <img src={cls.bannerUrl} alt={cls.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                  ) : (
                    <div className="h-3 bg-primary-600 w-full" />
                  )}

                  <div className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="h-14 w-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <GraduationCap className="h-7 w-7" />
                      </div>
                      <Badge variant="slate" className="font-mono text-[10px] tracking-widest uppercase">{cls.code}</Badge>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-1">{cls.name}</h3>
                      <p className="text-sm font-bold text-secondary-400 mt-1 uppercase tracking-wider">{cls.subject?.name}</p>
                    </div>

                    <div className="space-y-3.5 pt-4 border-t border-secondary-50">
                      <div className="flex items-center gap-3 text-xs font-bold text-secondary-500">
                        <School className="h-4 w-4 text-secondary-300" />
                        <span className="truncate">{cls.schoolName || 'Cơ sở giáo dục'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-secondary-500">
                        <User className="h-4 w-4 text-secondary-300" />
                        <span>{isTeacher ? `${cls.studentCount} học sinh đã tham gia` : `Giáo viên: ${cls.teacher?.fullName}`}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 py-4 bg-secondary-50/50 flex items-center justify-between group-hover:bg-primary-50 transition-colors">
                    <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest group-hover:text-primary-600">Xem lớp học</span>
                    <ArrowRight className="h-4 w-4 text-secondary-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Waiting Approval (Student only) */}
      {isStudent && activeTab === 'requests' && (
        <>
          {requestsLoading ? (
            <Loading message="Đang tải yêu cầu tham gia..." />
          ) : myRequests.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Chưa có yêu cầu tham gia"
              description="Bạn chưa gửi yêu cầu tham gia lớp nào. Hãy dùng 'Tham gia lớp' để tìm và gửi yêu cầu."
              action={
                <Button variant="primary" onClick={() => setIsJoinModalOpen(true)} icon={<LogIn className="h-4 w-4" />}>Tham gia lớp</Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white rounded-[2rem] border overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    req.status === 'PENDING' ? 'border-amber-100 hover:shadow-amber-500/10' :
                    req.status === 'REJECTED' ? 'border-red-100 hover:shadow-red-500/10' :
                    'border-emerald-100 hover:shadow-emerald-500/10'
                  }`}
                >
                  <div className={`h-2 w-full ${
                    req.status === 'PENDING' ? 'bg-amber-400' :
                    req.status === 'REJECTED' ? 'bg-red-400' :
                    'bg-emerald-400'
                  }`} />
                  <div className="p-7 space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      {getStatusBadge(req.status)}
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-secondary-900 line-clamp-1">{req.classroom.name}</h3>
                      <p className="text-xs font-bold text-secondary-400 mt-1 uppercase tracking-wider">{req.classroom.subject?.name}</p>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center gap-2.5 font-bold text-secondary-500">
                        <User className="h-3.5 w-3.5 text-secondary-300" />
                        <span>{req.classroom.teacher?.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-bold text-secondary-500">
                        <School className="h-3.5 w-3.5 text-secondary-300" />
                        <span>{req.classroom.schoolName || 'Cơ sở giáo dục'}</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-bold text-secondary-400">
                        <Clock className="h-3.5 w-3.5 text-secondary-300" />
                        <span>{new Date(req.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {req.message && (
                      <div className="bg-secondary-50 rounded-xl p-3.5">
                        <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1.5">Lời nhắn của bạn</p>
                        <p className="text-xs text-secondary-600 font-medium line-clamp-2">{req.message}</p>
                      </div>
                    )}

                    {req.status === 'REJECTED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setClassCode(req.classroom.code);
                          setIsJoinModalOpen(true);
                        }}
                      >
                        Gửi lại yêu cầu
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Join a Class Modal (Student) */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={handleCloseJoinModal}
        title="Tham gia lớp học"
      >
        <div className="space-y-6">
          {joinSuccess ? (
            <div className="py-12 text-center space-y-4 animate-fade-in">
              <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-secondary-900">Đã gửi yêu cầu!</h3>
              <p className="text-sm text-secondary-500 font-medium">Yêu cầu tham gia của bạn đã được gửi. Giáo viên sẽ xét duyệt trong thời gian sớm nhất.</p>
            </div>
          ) : (
            <>
              {/* Class Code Input */}
              <div>
                <label className="block text-xs font-black text-secondary-500 uppercase tracking-widest mb-2.5">
                  Nhập mã lớp
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Ví dụ: MAT3XKPR"
                    className="w-full pl-12 pr-4 py-4 bg-secondary-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-mono font-bold text-secondary-900 text-lg tracking-wider uppercase"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    autoFocus
                  />
                  {checkingCode && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {codeError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <p className="text-sm font-bold text-red-600">{codeError}</p>
                </div>
              )}

              {/* Class Preview */}
              {classPreview && (
                <div className="bg-white border-2 border-primary-100 rounded-[1.5rem] overflow-hidden animate-fade-in">
                  {classPreview.bannerUrl && (
                    <div className="h-24 w-full overflow-hidden">
                      <img src={classPreview.bannerUrl} alt={classPreview.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-black text-secondary-900">{classPreview.name}</h3>
                        <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mt-1">{classPreview.subject?.name}</p>
                      </div>
                      <Badge variant="primary" className="font-mono text-[10px]">{classPreview.code}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 text-xs font-bold text-secondary-500">
                        <User className="h-4 w-4 text-secondary-300" />
                        <span>{classPreview.teacher?.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-bold text-secondary-500">
                        <Users className="h-4 w-4 text-secondary-300" />
                      <span>{classPreview._count?.students || 0} học sinh</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-bold text-secondary-500 col-span-2">
                        <School className="h-4 w-4 text-secondary-300" />
                        <span>{classPreview.schoolName || 'Cơ sở giáo dục'}</span>
                      </div>
                    </div>

                    {classPreview.description && (
                      <p className="text-xs text-secondary-500 font-medium leading-relaxed">{classPreview.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Join Message (Optional) */}
              {classPreview && (
                <div>
                  <label className="block text-xs font-black text-secondary-500 uppercase tracking-widest mb-2.5">
                    <MessageSquare className="h-3.5 w-3.5 inline mr-1.5" />
                    Lời nhắn cho giáo viên (không bắt buộc)
                  </label>
                  <textarea
                    placeholder="Giới thiệu bản thân hoặc lý do bạn muốn tham gia lớp..."
                    className="w-full px-5 py-4 bg-secondary-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-secondary-900 text-sm resize-none"
                    rows={3}
                    value={joinMessage}
                    onChange={(e) => setJoinMessage(e.target.value)}
                    maxLength={500}
                  />
                  <p className="text-[10px] text-secondary-400 font-bold mt-1.5 text-right">{joinMessage.length}/500</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={handleCloseJoinModal}>Hủy</Button>
                {classPreview && (
                  <Button
                    variant="primary"
                    onClick={handleJoinRequest}
                    loading={submittingJoin}
                    icon={<Send className="h-4 w-4" />}
                  >
                    Gửi yêu cầu tham gia
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Create Modal (Teacher) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo lớp học"
      >
        <form onSubmit={handleCreateClass} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên lớp"
              placeholder="Ví dụ: Toán 10A1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Mã lớp (không bắt buộc)"
              placeholder="Tự động tạo nếu để trống"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>
          <Select
            label="Môn học"
            options={subjects}
            value={formData.subjectId}
            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            placeholder="Chọn môn học"
            required
          />
          <Input
            label="URL ảnh bìa (không bắt buộc)"
            value={formData.bannerUrl}
            onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />
          <Input
            label="Trường / Cơ sở"
            value={formData.schoolName}
            onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
            placeholder="Ví dụ: Trường THPT Quốc tế"
          />
          <Input
            label="Mô tả ngắn"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Mô tả ngắn về mục tiêu lớp học..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" variant="primary" loading={submitting}>Tạo lớp học</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassroomList;
