import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { examService } from '../../services/examService';
import { attemptService } from '../../services/attemptService';
import { classroomService } from '../../services/classroomService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { BookOpen, ClipboardList, Award, CheckCircle2, ArrowRight, Play, Eye, ShieldAlert, TrendingUp, Calendar, GraduationCap, ChevronRight } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { id: 'usr-student', name: 'Student' };

  const [metrics, setMetrics] = useState(null);
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [metricsRes, examsRes, attemptsRes, classroomsRes] = await Promise.all([
        dashboardService.getStudentStats(user.id),
        examService.getAll(),
        attemptService.getByStudent(user.id),
        classroomService.getAll()
      ]);
      setMetrics(metricsRes.data);
      setExams(examsRes.data);
      setAttempts(attemptsRes.data);
      setClassrooms(classroomsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch student dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user.id]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Assembling student portal..." />
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

  const completedExamIds = attempts.map(a => a.examId);
  const availableExams = exams.filter(e => !completedExamIds.includes(e.id));

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-extrabold text-secondary-900 tracking-tight mb-2">Learning Portal</h1>
          <p className="text-secondary-500 font-medium">Review assigned assessments, test your skills, and check instant scorecards.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/student/exams')} icon={<BookOpen size={18} />} className="shadow-xl shadow-primary-500/30">
          Browse Catalog
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <StatCard 
          title="Exams Completed" 
          value={metrics.examsTaken} 
          icon={ClipboardList} 
          description="Total attempts recorded"
        />
        <StatCard 
          title="Average Score" 
          value={`${metrics.averageScore}%`} 
          icon={TrendingUp} 
          trendValue="+2.5%"
          trendType="up"
          description="Overall performance"
        />
        <StatCard 
          title="Passing Ratio" 
          value={`${metrics.passRate}%`} 
          icon={CheckCircle2} 
          description="Success rate metric"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* My Classrooms Overview */}
        <Card 
          title="My Active Classrooms" 
          subtitle="Quick access to your enrolled academic sessions"
          bodyClassName="p-0"
          className="shadow-xl shadow-secondary-200/20"
          actions={
            <Link to="/student/classrooms" className="text-[10px] font-extrabold text-primary-500 hover:text-primary-700 flex items-center gap-2 uppercase tracking-widest transition-all">
              Manage All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {classrooms.length === 0 ? (
            <div className="p-16 text-center">
              <GraduationCap className="h-8 w-8 text-secondary-200 mx-auto mb-4" />
              <p className="text-xs text-secondary-400 font-bold uppercase tracking-widest">No classes joined yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-50">
              {classrooms.slice(0, 3).map((cls) => (
                <div key={cls.id} className="p-6 hover:bg-primary-50/30 transition-all flex items-center justify-between gap-6 group cursor-pointer" onClick={() => navigate(`/student/classrooms/${cls.id}`)}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-secondary-900 text-sm truncate group-hover:text-primary-600 transition-colors">{cls.name}</h4>
                      <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-0.5">{cls.teacher?.fullName} • {cls.subject?.name}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-secondary-300 group-hover:text-primary-500 transition-all" />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Subject Performance Analysis */}
        <Card 
          title="Performance by Subject" 
          subtitle="Your average score breakdown per category"
          className="shadow-xl shadow-secondary-200/20"
        >
          {metrics.performanceBySubject?.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-8 w-8 text-secondary-200 mx-auto mb-4" />
              <p className="text-xs text-secondary-400 font-bold uppercase tracking-widest">No subject data yet.</p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {metrics.performanceBySubject.map((item, idx) => {
                const percentage = Number(item.averageScore) * 10;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                      <span className="text-secondary-600">{item.subject}</span>
                      <span className="text-secondary-900">{item.averageScore} / 10</span>
                    </div>
                    <div className="h-2.5 w-full bg-secondary-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-600 rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Available Exams */}
        <Card 
          title="Available Assessments" 
          subtitle="Tests ready for you to attempt"
          bodyClassName="p-0"
          className="shadow-xl shadow-secondary-200/20"
          actions={
            <Link to="/student/exams" className="text-[10px] font-extrabold text-primary-500 hover:text-primary-700 flex items-center gap-2 uppercase tracking-widest transition-all">
              Browse All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {availableExams.length === 0 ? (
            <div className="p-16 text-center">
              <div className="h-16 w-16 rounded-3xl bg-secondary-50 text-secondary-200 flex items-center justify-center mx-auto mb-6 ring-1 ring-secondary-100">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-extrabold text-secondary-900 uppercase tracking-tight">All caught up!</p>
              <p className="text-xs text-secondary-400 font-bold uppercase tracking-widest mt-2">No pending examinations assigned.</p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-50">
              {availableExams.slice(0, 4).map((exam) => (
                <div key={exam.id} className="p-8 hover:bg-primary-50/30 transition-all flex items-center justify-between gap-6 group">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-secondary-900 truncate group-hover:text-primary-600 transition-colors tracking-tight text-base">{exam.title}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="slate">{exam.subjectName}</Badge>
                      <span className="text-[9px] font-extrabold text-secondary-400 uppercase tracking-[0.15em]">{exam.duration} mins</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/student/exams/${exam.id}/instruction`)}
                    icon={<Play size={14} className="fill-current" />}
                  >
                    Start
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* History Attempts List */}
        <Card 
          title="Recent Results" 
          subtitle="Latest graded scorecard summaries"
          bodyClassName="p-0"
          className="shadow-xl shadow-secondary-200/20"
          actions={
            <Link to="/student/attempts" className="text-[10px] font-extrabold text-primary-500 hover:text-primary-700 flex items-center gap-2 uppercase tracking-widest transition-all">
              Full History
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {attempts.length === 0 ? (
            <div className="p-16 text-center">
              <div className="h-16 w-16 rounded-3xl bg-secondary-50 text-secondary-200 flex items-center justify-center mx-auto mb-6 ring-1 ring-secondary-100">
                <Calendar className="h-8 w-8" />
              </div>
              <p className="text-sm font-extrabold text-secondary-900 uppercase tracking-tight">No attempts yet</p>
              <p className="text-xs text-secondary-400 font-bold uppercase tracking-widest mt-2">Start your first exam to see results.</p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-50">
              {attempts.slice(0, 4).map((sub) => {
                const subPct = sub.examTotalMarks > 0 ? (sub.score / sub.examTotalMarks) * 100 : 0;
                const isPass = sub.status.toUpperCase() === 'PASS';
                
                return (
                  <div key={sub.id} className="p-8 hover:bg-primary-50/30 transition-all flex items-center justify-between gap-6">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-secondary-900 truncate tracking-tight text-base">{sub.examTitle}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant={isPass ? 'success' : 'danger'} dot>{sub.status}</Badge>
                        <span className="text-[9px] font-extrabold text-secondary-400 uppercase tracking-[0.15em]">{sub.score} / {sub.examTotalMarks} pts ({subPct.toFixed(0)}%)</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/student/results/${sub.id}`)}
                      icon={<Eye size={14} />}
                    >
                      Report
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
