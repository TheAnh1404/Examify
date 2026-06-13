import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classroomService } from '../../services/classroomService';
import { authService } from '../../services/authService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { GraduationCap, Users, BookOpen, UserPlus, Mail, Trash2, ArrowLeft, School, Calendar, ChevronRight } from 'lucide-react';

const ClassroomDetail = () => {
  const { id: classroomId } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const isTeacher = user?.role === 'TEACHER';

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Student State
  const [studentEmail, setStudentEmail] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  
  // Remove Confirm
  const [removeConfirm, setRemoveConfirm] = useState({ isOpen: false, studentId: null, studentName: '' });

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

  useEffect(() => {
    fetchClassroom();
  }, [classroomId]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentEmail) return;
    setAddingStudent(true);
    try {
      await classroomService.addStudent(classroomId, studentEmail);
      setStudentEmail('');
      fetchClassroom();
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingStudent(false);
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

  if (loading) return <Loading message="Entering virtual classroom..." />;
  if (error) return (
    <div className="p-8 text-center space-y-4">
      <p className="text-danger-600 font-bold">{error}</p>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

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
              <h1 className="text-3xl font-black text-secondary-900 tracking-tight">{classroom.name}</h1>
              <Badge variant="slate" className="font-mono">{classroom.code}</Badge>
            </div>
            <p className="text-secondary-500 font-medium">{classroom.subject?.name} • {classroom.schoolName || 'Global'}</p>
          </div>
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

          {/* Student Roster */}
          <Card 
            title="Class Roster" 
            subtitle={`${classroom.students.length} students enrolled in this session`}
            actions={isTeacher && (
              <form onSubmit={handleAddStudent} className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Student email..." 
                  className="bg-secondary-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500 w-48 transition-all"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />
                <Button type="submit" variant="primary" size="sm" loading={addingStudent} icon={<UserPlus size={14} />}>
                  Enroll
                </Button>
              </form>
            )}
          >
            <DataTable 
              columns={studentColumns}
              data={classroom.students}
              loading={loading}
            />
          </Card>
        </div>

        {/* Right: Exams & Content */}
        <div className="space-y-8">
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
