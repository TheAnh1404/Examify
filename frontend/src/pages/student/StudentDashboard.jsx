import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { examService } from '../../services/examService';
import { attemptService } from '../../services/attemptService';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { BookOpen, ClipboardList, Award, CheckCircle, ArrowRight, Play, Eye, ShieldAlert } from 'lucide-react';

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

  if (loading) return <Loading message="Assembling student portal..." />;
  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
        <ShieldAlert className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  // Filter exams that are available (not taken yet)
  const completedExamIds = attempts.map(a => a.examId);
  const availableExams = exams.filter(e => !completedExamIds.includes(e.id));

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Student Learning Portal" 
        subtitle="Review assigned assessments, test your skills, and check instant graded scorecards."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard 
          title="Exams Completed" 
          value={metrics.examsTaken} 
          icon={<ClipboardList className="h-5 w-5" />} 
        />
        <StatCard 
          title="Average Score" 
          value={`${metrics.averageScore}%`} 
          icon={<Award className="h-5 w-5 text-primary-600" />} 
        />
        <StatCard 
          title="Passing Ratio" 
          value={`${metrics.passRate}%`} 
          icon={<CheckCircle className="h-5 w-5 text-accent-600" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Available Exams */}
        <Card 
          title="Available Examinations" 
          subtitle="Assessments ready to take. Select an exam to view directions."
          actions={
            <Link to="/student/exams" className="text-xs text-primary-600 hover:text-primary-750 font-bold flex items-center gap-1">
              Browse All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {availableExams.length === 0 ? (
            <p className="text-xs text-secondary-450 font-medium text-center py-6">
              All published examinations completed! Keep up the good work.
            </p>
          ) : (
            <div className="divide-y divide-secondary-200">
              {availableExams.map((exam) => (
                <div key={exam.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm text-secondary-800 truncate">{exam.title}</h4>
                    <p className="text-xs text-secondary-400 mt-1 flex flex-wrap items-center gap-3 font-medium">
                      <span>{exam.duration} mins</span>
                      <span>•</span>
                      <span>{exam.questionCount} Questions</span>
                      <span>•</span>
                      <span className="font-bold text-primary-600">{exam.totalMarks} points</span>
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/student/exams/${exam.id}/instruction`)}
                    icon={<Play className="h-3.5 w-3.5" />}
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
          title="My Submissions Log" 
          subtitle="Audit scorecard summaries and check answers keys"
          actions={
            <Link to="/student/attempts" className="text-xs text-primary-600 hover:text-primary-750 font-bold flex items-center gap-1">
              View History
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {attempts.length === 0 ? (
            <p className="text-xs text-secondary-450 font-medium text-center py-6">
              No completed test logs recorded yet. Take an available quiz.
            </p>
          ) : (
            <div className="divide-y divide-secondary-200">
              {attempts.map((sub) => {
                const subPct = sub.examTotalMarks > 0 ? (sub.score / sub.examTotalMarks) * 100 : 0;
                const isPass = sub.status.toUpperCase() === 'PASS';
                
                return (
                  <div key={sub.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-secondary-800 truncate">{sub.examTitle}</h4>
                      <p className="text-xs text-secondary-500 mt-1.5 flex flex-wrap items-center gap-3 font-medium">
                        <span className="font-bold">{sub.score} / {sub.examTotalMarks} pts</span>
                        <span>({subPct.toFixed(0)}%)</span>
                        <span>•</span>
                        {isPass ? (
                          <span className="text-accent-600 font-bold uppercase tracking-wider text-[10px]">Pass</span>
                        ) : (
                          <span className="text-red-500 font-bold uppercase tracking-wider text-[10px]">Fail</span>
                        )}
                      </p>
                    </div>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/student/results/${sub.id}`)}
                      icon={<Eye className="h-3.5 w-3.5 text-secondary-500" />}
                    >
                      Review
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
