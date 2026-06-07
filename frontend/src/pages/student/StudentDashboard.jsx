import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { examService } from '../../services/examService';
import { attemptService } from '../../services/attemptService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { BookOpen, ClipboardList, Award, CheckCircle2, ArrowRight, Play, Eye, ShieldAlert, TrendingUp, Calendar } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { id: 'usr-student', name: 'Student' };

  const [metrics, setMetrics] = useState(null);
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [metricsRes, examsRes, attemptsRes] = await Promise.all([
        dashboardService.getStudentStats(user.id),
        examService.getAll(),
        attemptService.getByStudent(user.id)
      ]);
      setMetrics(metricsRes.data);
      setExams(examsRes.data);
      setAttempts(attemptsRes.data);
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="h1 mb-1">Learning Portal</h1>
          <p className="p">Review assigned assessments, test your skills, and check instant scorecards.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/student/exams')} icon={<BookOpen className="h-4 w-4" />} className="shadow-lg shadow-primary-500/20">
          Browse Catalog
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Available Exams */}
        <Card 
          title="Available Assessments" 
          subtitle="Tests ready for you to attempt"
          bodyClassName="p-0"
          actions={
            <Link to="/student/exams" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 uppercase tracking-widest">
              Browse All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {availableExams.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-12 w-12 rounded-xl bg-secondary-50 text-secondary-300 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-secondary-900">All caught up!</p>
              <p className="text-xs text-secondary-500 mt-1">No pending examinations assigned.</p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-100">
              {availableExams.slice(0, 4).map((exam) => (
                <div key={exam.id} className="p-6 hover:bg-secondary-50/30 transition-all flex items-center justify-between gap-4 group">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-secondary-900 truncate group-hover:text-primary-600 transition-colors">{exam.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Badge variant="slate" className="text-[9px]">{exam.subjectName}</Badge>
                      <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">{exam.duration} mins</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/student/exams/${exam.id}/instruction`)}
                    icon={<Play className="h-3 w-3 fill-current" />}
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
          actions={
            <Link to="/student/attempts" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 uppercase tracking-widest">
              Full History
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {attempts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-12 w-12 rounded-xl bg-secondary-50 text-secondary-300 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-secondary-900">No attempts yet</p>
              <p className="text-xs text-secondary-500 mt-1">Start your first exam to see results.</p>
            </div>
          ) : (
            <div className="divide-y divide-secondary-100">
              {attempts.slice(0, 4).map((sub) => {
                const subPct = sub.examTotalMarks > 0 ? (sub.score / sub.examTotalMarks) * 100 : 0;
                const isPass = sub.status.toUpperCase() === 'PASS';
                
                return (
                  <div key={sub.id} className="p-6 hover:bg-secondary-50/30 transition-all flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-secondary-900 truncate">{sub.examTitle}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant={isPass ? 'success' : 'danger'} dot>{sub.status}</Badge>
                        <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">{sub.score} / {sub.examTotalMarks} pts ({subPct.toFixed(0)}%)</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/student/results/${sub.id}`)}
                      icon={<Eye className="h-3.5 w-3.5" />}
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
