import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classroomService } from '../../services/classroomService';
import { authService } from '../../services/authService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import { GraduationCap, Users, BookOpen, UserPlus, Trash2, ArrowLeft, School, Search, Check, ChevronRight, Clock, CheckCircle, XCircle, MessageSquare, UserCheck, Inbox } from 'lucide-react';

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

  // Also fetch enrollment count on initial load for badge
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
      // Refresh both enrollment requests and classroom data
      await Promise.all([fetchEnrollmentRequests(), fetchClassroom()]);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (loading) return <Loading message="Entering virtual classroom..." />;
  if (error) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-danger-600 font-bold">{error}</p>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const pendingEnrollmentCount = enrollmentRequests.length;

  const studentColumns = [
    {
      header: 'Student',
      accessor: 'student',
      render: (val) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-secondary-100 flex items-center justify-center overflow-hidden">
            {val.avatarUrl ? (
              <img src={val.avatarUrl} alt={val.fullName} className="h-full w-full object-cover" />
            ) : (
              <Users className="h-4.5 w-4.5 text-secondary-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-secondary-900 text-sm">{val.fullName}</p>
            <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest">{val.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Institution',
      accessor: 'student.schoolName',
      render: (val) => <span className="text-xs font-bold text-secondary-500">{val || 'Global'}</span>
    },
    {
      header: 'Joined Date',
      accessor: 'joinedAt',
      render: (val) => <span className="text-xs font-bold text-secondary-500">{new Date(val).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      render: (_, row) => isTeacher && (
        <button
          onClick={() => setRemoveConfirm({ isOpen: true, studentId: row.studentId, studentName: row.student.fullName })}
          className="p-2 text-secondary-400 hover:text-danger-600 transition-colors"
        >
          <Trash2 className="h-4.5 w-4.5" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {classroom.bannerUrl && (
        <div className="h-48 md:h-64 w-full rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
          <img src={classroom.bannerUrl} alt={classroom.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-10 left-10">
            <Badge variant="primary" className="mb-3 px-4 py-1.5 text-xs tracking-widest uppercase bg-primary-600/90 backdrop-blur-md border-none">{classroom.subject?.name}</Badge>
            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">{classroom.name}</h1>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-2xl bg-white border border-secondary-100 flex items-center justify-center text-secondary-400 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {!classroom.bannerUrl && (
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-secondary-900 tracking-tight">{classroom.name}</h1>
                <Badge variant="slate" className="font-mono">{classroom.code}</Badge>
              </div>
              <p className="text-secondary-500 font-medium">{classroom.subject?.name} • {classroom.schoolName || 'Global'}</p>
            </div>
          )}
          {classroom.bannerUrl && (
             <div>
                <p className="text-secondary-500 font-medium">Code: <span className="font-mono font-bold text-secondary-900">{classroom.code}</span> • {classroom.schoolName || 'Global Institution'}</p>
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Info & Students */}
        <div className="lg:col-span-2 space-y-8">

          {/* Instructor Card (For Student) */}
          {!isTeacher && (
            <Card title="Instructor Information" className="bg-primary-600 text-white border-none shadow-xl shadow-primary-500/20">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                  {classroom.teacher?.avatarUrl ? (
                    <img src={classroom.teacher.avatarUrl} alt={classroom.teacher.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <GraduationCap className="h-10 w-10 text-white" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-primary-200 text-[10px] font-black uppercase tracking-[0.2em]">Primary Instructor</p>
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
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'roster'
                    ? 'bg-white text-secondary-900 shadow-lg shadow-secondary-200/50'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                Class Roster
              </button>
              <button
                onClick={() => setActiveTab('enrollments')}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 ${
                  activeTab === 'enrollments'
                    ? 'bg-white text-secondary-900 shadow-lg shadow-secondary-200/50'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                Enrollment Requests
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
              title="Class Roster"
              subtitle={`${classroom.students.length} students enrolled in this session`}
              actions={isTeacher && (
                <Button onClick={() => setIsAddModalOpen(true)} variant="primary" size="sm" icon={<UserPlus size={14} />}>
                  Enroll Student
                </Button>
              )}
            >
              <DataTable
                columns={studentColumns}
                data={classroom.students}
                loading={loading}
              />
            </Card>
          )}

          {/* Tab: Enrollment Requests (Teacher) */}
          {isTeacher && activeTab === 'enrollments' && (
            <Card
              title="Pending Enrollment Requests"
              subtitle={`${pendingEnrollmentCount} students waiting for approval`}
            >
              {enrollmentLoading ? (
                <Loading message="Loading enrollment requests..." />
              ) : enrollmentRequests.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-secondary-50 flex items-center justify-center mx-auto">
                    <Inbox className="h-8 w-8 text-secondary-200" />
                  </div>
                  <div>
                    <p className="font-bold text-secondary-500">No Pending Requests</p>
                    <p className="text-xs text-secondary-400 font-medium mt-1">All enrollment requests have been processed.</p>
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
                              Pending
                            </Badge>
                          </div>
                          <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest truncate">{req.student.email}</p>
                          <div className="flex items-center gap-4 mt-1.5">
                            <span className="text-[10px] text-secondary-400 font-bold flex items-center gap-1.5">
                              <School className="h-3 w-3" />
                              {req.student.schoolName || 'Global'}
                            </span>
                            <span className="text-[10px] text-secondary-400 font-bold flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          disabled={processingRequestId === req.id}
                          onClick={() => handleUpdateEnrollment(req.id, 'APPROVED')}
                          className="h-11 px-5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center gap-2 transition-all duration-300 disabled:opacity-50 font-bold text-xs shadow-sm hover:shadow-lg hover:shadow-emerald-500/20"
                          title="Approve"
                        >
                          {processingRequestId === req.id ? (
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <CheckCircle className="h-4.5 w-4.5" />
                              Approve
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

        {/* Right: Exams & Content */}
        <div className="space-y-8">
          {/* Stats Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-secondary-50 shadow-sm">
              <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Students</p>
              <h4 className="text-2xl font-black text-secondary-900">{classroom.students.length}</h4>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-secondary-50 shadow-sm">
              <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-1">Assessments</p>
              <h4 className="text-2xl font-black text-secondary-900">{classroom.exams?.length || 0}</h4>
            </div>
          </div>

          {isTeacher && pendingEnrollmentCount > 0 && activeTab !== 'enrollments' && (
            <div
              onClick={() => setActiveTab('enrollments')}
              className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 cursor-pointer hover:bg-amber-100 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-amber-900">{pendingEnrollmentCount} Pending Request{pendingEnrollmentCount > 1 ? 's' : ''}</p>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-0.5">Click to review</p>
                </div>
              </div>
            </div>
          )}

          <Card
            title="Assigned Assessments"
            subtitle="Tests linked to this classroom"
            bodyClassName="p-0"
          >
            {classroom.exams?.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <BookOpen className="h-8 w-8 text-secondary-200 mx-auto" />
                <p className="text-[10px] text-secondary-400 font-black uppercase tracking-widest">No active exams</p>
              </div>
            ) : (
              <div className="divide-y divide-secondary-50">
                {classroom.exams.map(({ exam }) => (
                  <div key={exam.id} className="p-6 hover:bg-secondary-50 transition-all flex items-center justify-between group">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-secondary-900 text-sm truncate group-hover:text-primary-600 transition-colors">{exam.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant={exam.status === 'PUBLISHED' ? 'success' : 'slate'} size="sm" className="text-[8px]">{exam.status}</Badge>
                        <span className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">{exam.durationMinutes}m</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(isTeacher ? `/teacher/exams/${exam.id}` : `/student/exams/${exam.id}/instruction`)}
                      className="h-8 w-8 rounded-lg bg-secondary-100 flex items-center justify-center text-secondary-500 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Classroom Logs" className="bg-secondary-900 text-white border-none shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="h-1 w-1 rounded-full bg-primary-400 mt-2 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                <div>
                  <p className="text-xs font-bold text-secondary-100">Class Created</p>
                  <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest mt-0.5">{new Date(classroom.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-1 w-1 rounded-full bg-emerald-400 mt-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                <div>
                  <p className="text-xs font-bold text-secondary-100">Live Session Active</p>
                  <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest mt-0.5">Monitoring Enabled</p>
                </div>
              </div>
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
        title="Enroll New Student"
      >
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search by Name, Email, ID, or School..."
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
                  {searchQuery.length < 2 ? 'Enter at least 2 characters to search' : 'No students found matching your query'}
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
                        <p className="text-[10px] text-primary-600 font-bold uppercase tracking-[0.1em] mt-1">{student.schoolName || 'Global Institution'}</p>
                      </div>
                    </div>
                    {isAlreadyIn ? (
                      <div className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <Check size={14} />
                        Enrolled
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        loading={addingStudentId === student.id}
                        onClick={() => handleEnrollStudent(student.id)}
                        className="px-6 rounded-xl shadow-lg shadow-primary-500/20"
                      >
                        Enroll
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-4 border-t border-secondary-50 flex justify-between items-center">
             <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest">Showing up to 10 results</p>
             <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={removeConfirm.isOpen}
        onClose={() => setRemoveConfirm({ ...removeConfirm, isOpen: false })}
        onConfirm={handleRemoveStudent}
        title="Unenroll Student"
        message={`Are you sure you want to remove ${removeConfirm.studentName} from this classroom? This will not delete their exam attempts.`}
        confirmText="Yes, Remove"
        type="danger"
      />
    </div>
  );
};

export default ClassroomDetail;
