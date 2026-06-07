import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { examService } from '../../services/examService';
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
  BarChart3
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, examsRes] = await Promise.all([
        dashboardService.getTeacherStats(),
        examService.getAll()
      ]);
      setStats(statsRes.data);
      setExams(examsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch teacher dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteExam = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete exam "${title}"?`)) return;
    try {
      setError('');
      await examService.delete(id);
      setExams(prev => prev.filter(e => e.id !== id));
      const statsRes = await dashboardService.getTeacherStats();
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to delete exam.');
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Assembling teacher portal..." />
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
          <h1 className="text-4xl font-extrabold text-secondary-900 tracking-tight mb-2">Instructor Hub</h1>
          <p className="text-secondary-500 font-medium">Author assessments, audit question banks, and review proctored submissions.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/teacher/questions')}
            icon={<FolderLock size={18} />}
          >
            Question Bank
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/teacher/exams/create')}
            icon={<Plus size={20} />}
            className="shadow-xl shadow-primary-500/30"
          >
            Create Exam
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Published Exams" 
          value={metrics.totalExams} 
          icon={BookOpen} 
          trendValue="+2"
          trendType="up"
          description="Total active assessments"
        />
        <StatCard 
          title="Total Submissions" 
          value={metrics.totalSubmissions} 
          icon={ClipboardList} 
          trendValue="+18%" 
          trendType="up"
          description="Global student attempts"
        />
        <StatCard 
          title="Avg. Pass Rate" 
          value={`${metrics.passRate}%`} 
          icon={CheckCircle} 
          trendValue="+5%"
          trendType="up"
          description="Student success metric"
        />
        <StatCard 
          title="Student Pool" 
          value={metrics.totalStudents} 
          icon={Users} 
          description="Enrolled test takers"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Exams Table Panel */}
        <Card 
          title="Active Examinations" 
          subtitle="Overview of published questionnaires and taker logs" 
          className="lg:col-span-2 shadow-xl shadow-secondary-200/20"
          bodyClassName="p-0"
        >
          {exams.length === 0 ? (
            <div className="p-16 text-center">
              <div className="h-20 w-20 rounded-3xl bg-secondary-50 text-secondary-200 flex items-center justify-center mx-auto mb-6 ring-1 ring-secondary-100">
                <BookOpen className="h-10 w-8" />
              </div>
              <h4 className="text-secondary-900 font-extrabold text-lg mb-2 tracking-tight">No exams built yet</h4>
              <p className="text-secondary-400 text-sm font-bold uppercase tracking-wide mb-8">Start by creating your first examination sheet.</p>
              <Button variant="primary" onClick={() => navigate('/teacher/exams/create')}>
                Create First Exam
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary-50/30 border-b border-secondary-50">
                    <th className="px-8 py-5 text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.15em]">Exam Details</th>
                    <th className="px-8 py-5 text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.15em]">Category</th>
                    <th className="px-8 py-5 text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.15em] text-center">Stats</th>
                    <th className="px-8 py-5 text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.15em] text-right">Actions</th>
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
                          <span>{exam.totalMarks} Points</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="indigo">{exam.subjectName}</Badge>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-base font-extrabold text-secondary-900">0</span>
                          <span className="text-[9px] text-secondary-400 font-extrabold uppercase tracking-widest">Attempts</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
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
          <Card title="Quick Actions" subtitle="Perform common operations" className="shadow-xl shadow-secondary-200/20">
            <div className="space-y-4">
              {[
                { to: '/teacher/questions', icon: FolderLock, color: 'text-primary-500 bg-primary-50', label: 'Question Bank' },
                { to: '/teacher/questions/create', icon: Plus, color: 'text-accent-500 bg-accent-50', label: 'New Question' },
                { to: '/teacher/results', icon: Award, color: 'text-indigo-500 bg-indigo-50', label: 'Student Results' },
                { to: '/teacher/analytics', icon: BarChart3, color: 'text-warning-500 bg-warning-50', label: 'Performance Analytics' }
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

          <Card className="bg-primary-600 border-none relative overflow-hidden group shadow-2xl shadow-primary-600/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 text-white p-2">
              <h4 className="text-xl font-extrabold mb-3 tracking-tight">Need help?</h4>
              <p className="text-primary-100 text-xs font-bold leading-relaxed mb-8 uppercase tracking-wide">Check out our documentation on how to create effective multi-choice assessments.</p>
              <Button variant="ghost" className="text-white hover:bg-white/10 p-0 h-auto font-extrabold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                Read Guide <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
