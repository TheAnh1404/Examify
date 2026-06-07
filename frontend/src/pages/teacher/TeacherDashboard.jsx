import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { examService } from '../../services/examService';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { BookOpen, FolderLock, Award, CheckCircle, Plus, Eye, Edit, Trash2, ShieldAlert } from 'lucide-react';
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
      // Refresh statistics
      const statsRes = await dashboardService.getTeacherStats();
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to delete exam.');
    }
  };

  if (loading) return <Loading message="Assembling teacher portal..." />;
  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
        <ShieldAlert className="h-5 w-5 animate-pulse" />
        <p>{error}</p>
      </div>
    );
  }

  const { stats: metrics } = stats;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Instructor Operations Hub" 
        subtitle="Author assessments, audit question banks, and review proctored student submissions."
        actions={
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => navigate('/teacher/exams/create')}
            icon={<Plus className="h-4.5 w-4.5" />}
          >
            Create Exam
          </Button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Published Exams" 
          value={metrics.totalExams} 
          icon={<BookOpen className="h-5 w-5" />} 
        />
        <StatCard 
          title="Total Submissions" 
          value={metrics.totalSubmissions} 
          icon={<ClipboardListIcon />} 
          trendValue="+18%" 
        />
        <StatCard 
          title="Average Pass Rate" 
          value={`${metrics.passRate}%`} 
          icon={<CheckCircle className="h-5 w-5 text-accent-600" />} 
        />
        <StatCard 
          title="Student Pool" 
          value={metrics.totalStudents} 
          icon={<UsersIcon />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Exams Table Panel */}
        <Card 
          title="My Active Examinations" 
          subtitle="Overview of published questionnaires and taker logs" 
          className="lg:col-span-2"
          bodyClassName="p-0"
        >
          {exams.length === 0 ? (
            <div className="p-8 text-center text-sm text-secondary-550 font-medium">
              No exams built yet.{' '}
              <Link to="/teacher/exams/create" className="text-primary-600 hover:text-primary-750 font-bold">
                Create one now
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse text-secondary-700">
                <thead className="bg-secondary-50 border-b border-secondary-200 text-secondary-505 text-xs font-semibold uppercase select-none">
                  <tr>
                    <th className="px-6 py-3.5">Exam Details</th>
                    <th className="px-6 py-3.5">Subject</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Marks</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-secondary-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <Link to={`/teacher/exams/${exam.id}`} className="font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
                            {exam.title}
                          </Link>
                          <p className="text-xs text-secondary-400 mt-0.5 line-clamp-1 max-w-xs">{exam.description || 'No description'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <Badge variant="indigo">{exam.subjectName}</Badge>
                      </td>
                      <td className="px-6 py-4 text-secondary-500 font-medium">{exam.duration} mins</td>
                      <td className="px-6 py-4 text-secondary-550 font-bold">{exam.totalMarks} pts</td>
                      <td className="px-6 py-4 text-right space-x-1.5 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/teacher/exams/${exam.id}`)}
                          icon={<Eye className="h-3.5 w-3.5 text-secondary-500" />}
                          title="View Details"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/teacher/exams/${exam.id}/questions`)}
                          icon={<FolderLock className="h-3.5 w-3.5 text-secondary-500" />}
                          title="Manage Questions"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteExam(exam.id, exam.title)}
                          icon={<Trash2 className="h-3.5 w-3.5" />}
                          title="Delete Exam"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Operations links */}
        <Card title="Assessments Operations" subtitle="Perform common operations">
          <div className="space-y-3.5">
            <Link 
              to="/teacher/questions" 
              className="flex items-center justify-between p-3.5 rounded-lg border border-secondary-200 bg-secondary-50 hover:bg-secondary-100/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FolderLock className="h-5 w-5 text-accent-600" />
                <span className="text-sm font-semibold text-secondary-800">Browse Question Bank</span>
              </div>
              <ArrowRight className="h-4 w-4 text-secondary-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link 
              to="/teacher/questions/create" 
              className="flex items-center justify-between p-3.5 rounded-lg border border-secondary-200 bg-secondary-50 hover:bg-secondary-100/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-semibold text-secondary-800">Draft Question Prompts</span>
              </div>
              <ArrowRight className="h-4 w-4 text-secondary-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link 
              to="/teacher/results" 
              className="flex items-center justify-between p-3.5 rounded-lg border border-secondary-200 bg-secondary-50 hover:bg-secondary-100/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-semibold text-secondary-800">Audit Student Result Sheets</span>
              </div>
              <ArrowRight className="h-4 w-4 text-secondary-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link 
              to="/teacher/analytics" 
              className="flex items-center justify-between p-3.5 rounded-lg border border-secondary-200 bg-secondary-50 hover:bg-secondary-100/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LineChart className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-semibold text-secondary-800">Analytics & Leaderboards</span>
              </div>
              <ArrowRight className="h-4 w-4 text-secondary-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Simple inline icons
const ClipboardListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

export default TeacherDashboard;
