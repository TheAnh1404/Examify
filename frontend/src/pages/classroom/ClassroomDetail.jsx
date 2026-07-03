import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classroomService } from '../../services/classroomService';
import { authService } from '../../services/authService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import { GraduationCap, Users, BookOpen, UserPlus, Trash2, ArrowLeft, School, Search, Check, ChevronRight, Clock, CheckCircle, XCircle, MessageSquare, UserCheck, Inbox, Copy, FileText, CalendarDays } from 'lucide-react';
import { formatStatus } from '../../utils/i18n';

const ClassroomDetail = () => {
  const { id: classroomId } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isTeacher = user?.role === 'TEACHER';

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState('roster');

  // Add Student State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingStudentId, setAddingStudentId] = useState(null);

  // Remove Confirm
  const [removeConfirm, setRemoveConfirm] = useState({ isOpen: false, studentId: null, studentName: '' });

  // Enrollment Requests (Teacher)
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  // Copy Code
  const [codeCopied, setCodeCopied] = useState(false);

  const fetchClassroom = async () => {
    try {
      setLoading(true);
      const res = await classroomService.getById(classroomId);
      setClassroom(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentRequests = async () => {
    if (!isTeacher) return;
    try {
      setEnrollmentLoading(true);
      const res = await classroomService.getEnrollmentRequests(classroomId);
      setEnrollmentRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  useEffect(() => {
    fetchClassroom();
  }, [classroomId]);

  useEffect(() => {
    if (isTeacher && activeTab === 'enrollments') {
      fetchEnrollmentRequests();
    }
  }, [activeTab, isTeacher, classroomId]);

  // Fetch enrollment count on initial load for badge
  useEffect(() => {
    if (isTeacher) {
      fetchEnrollmentRequests();
    }
  }, [classroomId, isTeacher]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setSearching(true);
        try {
          const res = await classroomService.searchStudents(searchQuery);
          setSearchResults(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleEnrollStudent = async (studentId) => {
    setAddingStudentId(studentId);
    try {
      await classroomService.addStudent(classroomId, { studentId });
      fetchClassroom();
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingStudentId(null);
    }
  };

  const handleRemoveStudent = async () => {
    try {
      await classroomService.removeStudent(classroomId, removeConfirm.studentId);
      setRemoveConfirm({ isOpen: false, studentId: null, studentName: '' });
      fetchClassroom();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateEnrollment = async (requestId, status) => {
    setProcessingRequestId(requestId);
    try {
      await classroomService.updateEnrollmentStatus(requestId, { status });
      await Promise.all([fetchEnrollmentRequests(), fetchClassroom()]);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(classroom.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = classroom.code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  if (loading) return <Loading message="Đang vào lớp học..." />;
  if (error) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-danger-600 font-bold">{error}</p>
      <Button onClick={() => navigate(-1)}>Quay lại</Button>
    </div>
  );

  const pendingEnrollmentCount = enrollmentRequests.length;

  // DataTable columns — render receives (row, rowIdx) per DataTable API
  const studentColumns = [
    {
      header: 'Học sinh',
      key: 'student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary-100 flex items-center justify-center overflow-hidden">
            {row.student?.avatarUrl ? (
              <img src={row.student.avatarUrl} alt={row.student.fullName} className="h-full w-full object-cover" />
            ) : (
              <Users className="h-5 w-5 text-secondary-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-secondary-900 text-sm">{row.student?.fullName}</p>
            <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest">{row.student?.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Cơ sở',
      key: 'schoolName',
      render: (row) => <span className="text-xs font-bold text-secondary-500">{row.student?.schoolName || 'Cơ sở giáo dục'}</span>
    },
    {
      header: 'Ngày tham gia',
      key: 'joinedAt',
      render: (row) => (
        <div className="flex items-center gap-2 text-secondary-500">
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="text-xs font-bold">{new Date(row.joinedAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      )
    },
    ...(isTeacher ? [{
      header: '',
      key: 'actions',
      render: (row) => (
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRemoveConfirm({ isOpen: true, studentId: row.studentId, studentName: row.student?.fullName });
            }}
            className="p-2.5 rounded-xl text-secondary-300 hover:text-red-500 hover:bg-red-50 transition-all"
            title={`Xóa ${row.student?.fullName}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }] : [])
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      {classroom.bannerUrl ? (
        <div className="h-48 md:h-64 w-full rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
          <img src={classroom.bannerUrl} alt={classroom.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/80 via-secondary-900/20 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-end justify-between">
              <div>
                <Badge variant="primary" className="mb-3 px-4 py-1.5 text-xs tracking-widest uppercase bg-primary-600/90 backdrop-blur-md border-none">{classroom.subject?.name}</Badge>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">{classroom.name}</h1>
              </div>
              <button
                onClick={handleCopyCode}
                className="hidden md:flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
                title="Sao chép mã lớp"
              >
                <span className="font-mono font-bold text-sm tracking-widest">{classroom.code}</span>
                {codeCopied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4 text-white/70" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-3 bg-gradient-to-r from-primary-500 via-primary-600 to-indigo-600 w-full rounded-full" />
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-2xl bg-white border border-secondary-100 flex items-center justify-center text-secondary-400 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              {!classroom.bannerUrl && (
                <h1 className="text-2xl md:text-3xl font-black text-secondary-900 tracking-tight">{classroom.name}</h1>
              )}
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary-50 hover:bg-primary-50 border border-secondary-100 hover:border-primary-200 transition-all group"
                title="Sao chép mã lớp"
              >
                <span className="font-mono font-bold text-xs text-secondary-600 group-hover:text-primary-600 tracking-widest">{classroom.code}</span>
                {codeCopied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-secondary-400 group-hover:text-primary-500" />
                )}
              </button>
            </div>
            <p className="text-secondary-500 font-medium text-sm">
              {classroom.subject?.name} - {classroom.schoolName || 'Cơ sở giáo dục'}
              {classroom.description && <span className="text-secondary-400"> - {classroom.description}</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Main Content */}
        <div className="lg:col-span-2 space-y-8">

          {/* Instructor Card (For Student) */}
          {!isTeacher && (
            <Card className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none shadow-xl shadow-primary-500/20">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 shrink-0">
                  {classroom.teacher?.avatarUrl ? (
                    <img src={classroom.teacher.avatarUrl} alt={classroom.teacher.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <GraduationCap className="h-10 w-10 text-white/80" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <p className="text-primary-200 text-[10px] font-black uppercase tracking-[0.2em]">Giáo viên phụ trách</p>
                  <h3 className="text-2xl font-black tracking-tight">{classroom.teacher?.fullName}</h3>
                  <p className="text-primary-100 text-sm font-medium opacity-80">{classroom.teacher?.email}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Tabs for Teacher */}
          {isTeacher && (
            <div className="flex gap-2 p-1.5 bg-secondary-50 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab('roster')}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'roster'
                    ? 'bg-white text-secondary-900 shadow-lg shadow-secondary-200/50'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                <Users className="h-4 w-4" />
                Danh sách lớp
                <span className="text-[10px] font-black text-secondary-400 bg-secondary-100 px-2 py-0.5 rounded-lg">
                  {classroom.students.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('enrollments')}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'enrollments'
                    ? 'bg-white text-secondary-900 shadow-lg shadow-secondary-200/50'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                Yêu cầu tham gia
                {pendingEnrollmentCount > 0 && (
                  <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {pendingEnrollmentCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Tab: Class Roster */}
          {(activeTab === 'roster' || !isTeacher) && (
            <Card
              title="Danh sách lớp"
              subtitle={`${classroom.students.length} học sinh trong lớp`}
              actions={isTeacher && (
                <Button onClick={() => setIsAddModalOpen(true)} variant="primary" size="sm" icon={<UserPlus size={14} />}>
                  Thêm học sinh
                </Button>
              )}
            >
              <DataTable
                columns={studentColumns}
                data={classroom.students}
                loading={loading}
                emptyMessage="Chưa có học sinh nào."
                pageSize={8}
              />
            </Card>
          )}

          {/* Tab: Enrollment Requests (Teacher) */}
          {isTeacher && activeTab === 'enrollments' && (
            <Card
              title="Yêu cầu tham gia đang chờ"
              subtitle={`${pendingEnrollmentCount} học sinh đang chờ duyệt`}
            >
              {enrollmentLoading ? (
                <Loading message="Đang tải yêu cầu tham gia..." />
              ) : enrollmentRequests.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-secondary-50 flex items-center justify-center mx-auto">
                    <Inbox className="h-8 w-8 text-secondary-200" />
                  </div>
                  <div>
                    <p className="font-bold text-secondary-500">Không có yêu cầu chờ duyệt</p>
                    <p className="text-xs text-secondary-400 font-medium mt-1">Tất cả yêu cầu tham gia đã được xử lý.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollmentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-5 rounded-2xl bg-white border border-secondary-100 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="h-14 w-14 rounded-2xl bg-secondary-100 flex items-center justify-center overflow-hidden shrink-0">
                          {req.student.avatarUrl ? (
                            <img src={req.student.avatarUrl} alt={req.student.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <Users className="h-7 w-7 text-secondary-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-black text-secondary-900 truncate">{req.student.fullName}</h4>
                            <Badge variant="warning" className="text-[8px] tracking-widest uppercase shrink-0 flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              Đang chờ
                            </Badge>
                          </div>
                          <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest truncate">{req.student.email}</p>
                          <div className="flex items-center gap-4 mt-1.5">
                            <span className="text-[10px] text-secondary-400 font-bold flex items-center gap-1.5">
                              <School className="h-3 w-3" />
                              {req.student.schoolName || 'Cơ sở giáo dục'}
                            </span>
                            <span className="text-[10px] text-secondary-400 font-bold flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {new Date(req.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {req.message && (
                            <div className="mt-3 flex items-start gap-2 bg-secondary-50 rounded-xl px-3.5 py-2.5">
                              <MessageSquare className="h-3.5 w-3.5 text-secondary-400 mt-0.5 shrink-0" />
                              <p className="text-xs text-secondary-600 font-medium line-clamp-2">{req.message}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 ml-4 shrink-0">
                        <button
                          disabled={processingRequestId === req.id}
                          onClick={() => handleUpdateEnrollment(req.id, 'REJECTED')}
                          className="h-11 w-11 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-lg hover:shadow-red-500/20"
                          title="Từ chối"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          disabled={processingRequestId === req.id}
                          onClick={() => handleUpdateEnrollment(req.id, 'APPROVED')}
                          className="h-11 px-5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center gap-2 transition-all duration-300 disabled:opacity-50 font-bold text-xs shadow-sm hover:shadow-lg hover:shadow-emerald-500/20"
                          title="Duyệt"
                        >
                          {processingRequestId === req.id ? (
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <CheckCircle className="h-4.5 w-4.5" />
                              Duyệt
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-secondary-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center mb-4">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Học sinh</p>
              <h4 className="text-3xl font-black text-secondary-900">{classroom.students.length}</h4>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-secondary-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Bài thi</p>
              <h4 className="text-3xl font-black text-secondary-900">{classroom.exams?.length || 0}</h4>
            </div>
          </div>

          {/* Pending Enrollment Notification */}
          {isTeacher && pendingEnrollmentCount > 0 && activeTab !== 'enrollments' && (
            <div
              onClick={() => setActiveTab('enrollments')}
              className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-[2rem] p-6 cursor-pointer hover:shadow-lg hover:shadow-amber-500/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-amber-900">{pendingEnrollmentCount} yêu cầu chờ duyệt</p>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-0.5">Nhấn để xem</p>
                </div>
              </div>
            </div>
          )}

          {/* Class Code Card (Teacher) */}
          {isTeacher && (
            <div className="bg-white p-6 rounded-[2rem] border border-secondary-50 shadow-sm">
              <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-3">Chia sẻ mã lớp</p>
              <div className="flex items-center justify-between bg-secondary-50 rounded-2xl px-5 py-4">
                <span className="font-mono font-black text-xl tracking-[0.2em] text-secondary-900">{classroom.code}</span>
                <button
                  onClick={handleCopyCode}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                    codeCopied
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-white text-secondary-500 hover:bg-primary-50 hover:text-primary-600 shadow-sm'
                  }`}
                  title="Sao chép mã"
                >
                  {codeCopied ? <Check className="h-4.5 w-4.5" /> : <Copy className="h-4.5 w-4.5" />}
                </button>
              </div>
              <p className="text-[10px] text-secondary-400 font-medium mt-2.5">Chia sẻ mã này để học sinh gửi yêu cầu tham gia lớp.</p>
            </div>
          )}

          {/* Assigned Assessments */}
          <Card
            title="Bài thi được giao"
            subtitle="Các bài thi liên kết với lớp học này"
            bodyClassName="p-0"
          >
            {classroom.exams?.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <BookOpen className="h-8 w-8 text-secondary-200 mx-auto" />
                <p className="text-[10px] text-secondary-400 font-black uppercase tracking-widest">Chưa có bài thi hoạt động</p>
              </div>
            ) : (
              <div className="divide-y divide-secondary-50">
                {classroom.exams.map(({ exam }) => (
                  <div key={exam.id} className="px-6 py-5 hover:bg-secondary-50/50 transition-all flex items-center justify-between group cursor-pointer" onClick={() => navigate(isTeacher ? `/teacher/exams/${exam.id}` : `/student/exams/${exam.id}/instruction`)}>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-secondary-900 text-sm truncate group-hover:text-primary-600 transition-colors">{exam.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant={exam.status === 'PUBLISHED' ? 'success' : exam.status === 'CLOSED' ? 'danger' : 'slate'} size="sm" className="text-[8px]">{formatStatus(exam.status)}</Badge>
                        <span className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {exam.durationMinutes}m
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-secondary-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Classroom Info */}
          <Card title="Thông tin lớp học" className="bg-secondary-900 text-white border-none shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-400 mt-2 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                <div>
                  <p className="text-xs font-bold text-secondary-100">Ngày tạo</p>
                  <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest mt-0.5">{new Date(classroom.createdAt).toLocaleDateString('vi-VN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                <div>
                  <p className="text-xs font-bold text-secondary-100">Trạng thái</p>
                  <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest mt-0.5">{formatStatus(classroom.status || 'ACTIVE')}</p>
                </div>
              </div>
              {classroom.teacher && (
                <div className="flex items-start gap-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                  <div>
                    <p className="text-xs font-bold text-secondary-100">Giáo viên</p>
                    <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest mt-0.5">{classroom.teacher.fullName}</p>
                  </div>
                </div>
              )}
              {classroom.description && (
                <div className="flex items-start gap-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                  <div>
                    <p className="text-xs font-bold text-secondary-100">Mô tả</p>
                    <p className="text-[10px] text-secondary-400 font-medium mt-0.5 leading-relaxed">{classroom.description}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
        title="Thêm học sinh vào lớp"
      >
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, ID hoặc trường..."
              className="w-full pl-12 pr-4 py-4 bg-secondary-50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-secondary-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {searchResults.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Users className="h-10 w-10 text-secondary-100 mx-auto" />
                <p className="text-sm font-bold text-secondary-400">
                  {searchQuery.length < 2 ? 'Nhập ít nhất 2 ký tự để tìm kiếm' : 'Không tìm thấy học sinh phù hợp'}
                </p>
              </div>
            ) : (
              searchResults.map((student) => {
                const isAlreadyIn = classroom.students.some(s => s.studentId === student.id);
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-secondary-50 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-secondary-100 flex items-center justify-center overflow-hidden">
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt={student.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <Users className="h-6 w-6 text-secondary-400" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-black text-secondary-900 leading-tight">{student.fullName}</h5>
                        <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest mt-0.5">{student.email}</p>
                        <p className="text-[10px] text-primary-600 font-bold uppercase tracking-[0.1em] mt-1">{student.schoolName || 'Cơ sở giáo dục'}</p>
                      </div>
                    </div>
                    {isAlreadyIn ? (
                      <div className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <Check size={14} />
                        Đã tham gia
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        loading={addingStudentId === student.id}
                        onClick={() => handleEnrollStudent(student.id)}
                        className="px-6 rounded-xl shadow-lg shadow-primary-500/20"
                      >
                        Thêm
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-4 border-t border-secondary-50 flex justify-between items-center">
             <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest">Hiển thị tối đa 10 kết quả</p>
             <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Đóng</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={removeConfirm.isOpen}
        onClose={() => setRemoveConfirm({ ...removeConfirm, isOpen: false })}
        onConfirm={handleRemoveStudent}
        title="Xóa học sinh khỏi lớp"
        message={`Bạn có chắc muốn xóa ${removeConfirm.studentName} khỏi lớp học này? Thao tác này không xóa các lượt làm bài của học sinh.`}
        confirmText="Xác nhận xóa"
        type="danger"
      />
    </div>
  );
};

export default ClassroomDetail;
