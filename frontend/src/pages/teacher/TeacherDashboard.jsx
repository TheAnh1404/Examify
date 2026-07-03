import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { examService } from '../../services/examService';
import { subjectService } from '../../services/subjectService';
import { classroomService } from '../../services/classroomService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { 
  BookOpen, 
  FolderLock, 
  Award, 
  CheckCircle, 
  Plus, 
  Eye, 
  Trash2, 
  ShieldAlert, 
  Users, 
  ClipboardList,
  ArrowRight,
  TrendingUp,
  BarChart3,
  GraduationCap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [teachingSubjects, setTeachingSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
        dashboardService.getTeacherStats(),
        examService.getAll(),
        subjectService.getAll(),
        classroomService.getAll()
      ])
      .then(([statsRes, examsRes, subjectsRes, classroomsRes]) => {
        if (!active) return;
        setStats(statsRes.data);
        setExams(examsRes.data);
        setTeachingSubjects(subjectsRes.data);
        setClassrooms(classroomsRes.data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError('Không thể tải dữ liệu bảng điều khiển giáo viên.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDeleteExam = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn bài thi "${title}"?`)) return;
    try {
      setError('');
      await examService.delete(id);
      setExams(prev => prev.filter(e => e.id !== id));
      const statsRes = await dashboardService.getTeacherStats();
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message || 'Không thể xóa bài thi.');
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Đang tải cổng giáo viên..." />
    </div>
  );

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-danger-50 border border-danger-100 text-danger-700 flex items-center gap-4 animate-fade-in">
        <ShieldAlert className="h-6 w-6 shrink-0" />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const { stats: metrics } = stats;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-extrabold text-secondary-900 tracking-tight mb-2">Cổng giáo viên</h1>
          <p className="text-secondary-500 font-medium">Tạo bài thi, quản lý ngân hàng câu hỏi và xem kết quả làm bài.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/teacher/questions')}
            icon={<FolderLock size={18} />}
          >
            Ngân hàng câu hỏi
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/teacher/exams/create')}
            icon={<Plus size={20} />}
            className="shadow-xl shadow-primary-500/30"
          >
            Tạo bài thi
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Bài thi đã công bố"
          value={metrics.totalExams} 
          icon={BookOpen} 
          description="Tổng bài thi đang hoạt động"
        />
        <StatCard 
          title="Tổng lượt nộp"
          value={metrics.totalSubmissions} 
          icon={ClipboardList} 
          description="Lượt làm các bài thi của bạn"
        />
        <StatCard 
          title="Tỷ lệ đạt TB"
          value={`${metrics.passRate}%`} 
          icon={CheckCircle} 
          description="Chỉ số hoàn thành của học sinh"
        />
        <StatCard 
          title="Học sinh"
          value={metrics.totalStudents} 
          icon={Users} 
          description="Học sinh đã tham gia"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Exams Table Panel */}
        <Card 
          title="Bài thi đang hoạt động"
          subtitle="Tổng quan bài thi đã công bố và lượt làm bài"
          className="lg:col-span-2 shadow-xl shadow-secondary-200/20"
          bodyClassName="p-0"
        >
          {exams.length === 0 ? (
            <div className="p-16 text-center">
              <div className="h-20 w-20 rounded-3xl bg-secondary-50 text-secondary-200 flex items-center justify-center mx-auto mb-6 ring-1 ring-secondary-100">
                <BookOpen className="h-10 w-8" />
              </div>
              <h4 className="text-secondary-900 font-extrabold text-lg mb-2 tracking-tight">Chưa có bài thi</h4>
              <p className="text-secondary-400 text-sm font-bold uppercase tracking-wide mb-8">Hãy bắt đầu bằng cách tạo bài thi đầu tiên.</p>
              <Button variant="primary" onClick={() => navigate('/teacher/exams/create')}>
                Tạo bài thi đầu tiên
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary-50/30 border-b border-secondary-50">
                    <th className="px-8 py-5 text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.15em]">Thông tin bài thi</th>
                    <th className="px-8 py-5 text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.15em]">Môn học</th>
                    <th className="px-8 py-5 text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.15em] text-center">Số liệu</th>
                    <th className="px-8 py-5 text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.15em] text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-primary-50/30 transition-all group">
                      <td className="px-8 py-6">
                        <Link to={`/teacher/exams/${exam.id}`} className="font-extrabold text-secondary-900 hover:text-primary-600 transition-colors block mb-1.5 tracking-tight text-base">
                          {exam.title}
                        </Link>
                        <div className="flex items-center gap-4 text-[10px] text-secondary-400 font-extrabold uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> {exam.duration}m</span>
                          <span className="h-1 w-1 rounded-full bg-secondary-200"></span>
                          <span>{exam.totalMarks} điểm</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="indigo">{exam.subjectName}</Badge>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-base font-extrabold text-secondary-900">{exam.totalAttempts || 0}</span>
                          <span className="text-[9px] text-secondary-400 font-extrabold uppercase tracking-widest">Lượt làm</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/teacher/exams/${exam.id}`)}
                            icon={<Eye size={16} />}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/teacher/exams/${exam.id}/questions`)}
                            icon={<FolderLock size={16} />}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteExam(exam.id, exam.title)}
                            icon={<Trash2 size={16} />}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Operations links */}
        <div className="space-y-8">
          <Card title="Thao tác nhanh" subtitle="Các tác vụ thường dùng" className="shadow-xl shadow-secondary-200/20">
            <div className="space-y-4">
              {[
                { to: '/teacher/classrooms', icon: GraduationCap, color: 'text-indigo-500 bg-indigo-50', label: 'Quản lý lớp học' },
                { to: '/teacher/questions', icon: FolderLock, color: 'text-primary-500 bg-primary-50', label: 'Ngân hàng câu hỏi' },
                { to: '/teacher/questions/create', icon: Plus, color: 'text-accent-500 bg-accent-50', label: 'Câu hỏi mới' },
                { to: '/teacher/results', icon: Award, color: 'text-indigo-500 bg-indigo-50', label: 'Kết quả học sinh' }
              ].map((link, idx) => (
                <Link 
                  key={idx}
                  to={link.to} 
                  className="flex items-center justify-between p-5 rounded-2xl border border-secondary-50 bg-white hover:bg-secondary-50 hover:border-secondary-100 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-[1.25rem] ${link.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                      <link.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-extrabold text-secondary-900">{link.label}</span>
                  </div>
                  <ArrowRight className="h-5 w-5 text-secondary-200 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </Card>

          <Card title="Lớp học gần đây" subtitle="Các lớp học bạn quản lý" className="shadow-xl shadow-secondary-200/20" bodyClassName="p-0">
            {classrooms.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <GraduationCap className="h-8 w-8 text-secondary-200 mx-auto" />
                <p className="text-[10px] text-secondary-400 font-black uppercase tracking-widest">Chưa có lớp học</p>
              </div>
            ) : (
              <div className="divide-y divide-secondary-50">
                {classrooms.slice(0, 3).map((cls) => (
                  <div key={cls.id} className="p-5 hover:bg-secondary-50 transition-all flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/teacher/classrooms/${cls.id}`)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-secondary-900 text-xs truncate group-hover:text-primary-600 transition-colors">{cls.name}</p>
                        <p className="text-[9px] text-secondary-400 font-bold uppercase tracking-widest mt-0.5">{cls.studentCount} học sinh - {cls.subject?.name}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-secondary-200 group-hover:text-primary-500 transition-all" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Môn giảng dạy" subtitle="Được quản trị viên phân công" className="shadow-xl shadow-secondary-200/20">
            <div className="space-y-3">
              {teachingSubjects.map((subject) => (
                <div key={subject.id} className="rounded-xl border border-secondary-100 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-secondary-900">{subject.name}</span>
                    <Badge variant="indigo">{subject.code}</Badge>
                  </div>
                  <p className="text-xs text-secondary-500 mt-2">
                    {subject.assignmentNote || 'Không có ghi chú phân công.'}
                  </p>
                </div>
              ))}
              {teachingSubjects.length === 0 && (
                <p className="text-sm text-secondary-500 text-center py-4">Chưa được phân công môn giảng dạy.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
