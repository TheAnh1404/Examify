import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Users, GraduationCap, BookOpen, FileSpreadsheet, ArrowRight, ShieldAlert, Award, TrendingUp, Settings, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getAdminStats();
        setStatsData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch system dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Assembling system overview..." />
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

  const { stats, leaderboard } = statsData;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="h1 mb-1">System Control Center</h1>
          <p className="p">Overview of system-wide SaaS stats, subject categories, and user allocations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/admin/settings')} icon={<Settings className="h-4 w-4" />}>
            Config
          </Button>
          <Button variant="primary" onClick={() => navigate('/admin/users/create')} icon={<Activity className="h-4 w-4" />}>
            Provision User
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={GraduationCap} 
          trendValue="+12%" 
          trendType="up"
        />
        <StatCard 
          title="Instructors" 
          value={stats.totalTeachers} 
          icon={Users} 
          trendValue="+4%" 
          trendType="up"
        />
        <StatCard 
          title="Active Exams" 
          value={stats.totalExams} 
          icon={BookOpen} 
          trendValue="+2"
          trendType="up"
        />
        <StatCard 
          title="Total Attempts" 
          value={stats.totalSubmissions} 
          icon={FileSpreadsheet} 
          trendValue="+25%" 
          trendType="up"
        />
        <StatCard 
          title="Global Pass Rate" 
          value={`${stats.passRate}%`} 
          icon={Award} 
          trendValue="+5%"
          trendType="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard Panel */}
        <Card 
          title="Student Leaderboard" 
          subtitle="Highest performing student metrics across all exam attempts" 
          className="lg:col-span-2"
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-secondary-50/50 border-b border-secondary-100">
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-widest">Student Profile</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-widest text-center">Attempts</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-widest text-right">Avg Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {leaderboard.map((student, idx) => (
                  <tr key={idx} className="hover:bg-secondary-50/30 transition-all group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
                          {student.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">{student.studentName}</p>
                          <p className="text-xs text-secondary-400 font-medium">{student.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-secondary-600">
                      {student.examsTaken}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-accent-50 border border-accent-100 text-accent-700 font-bold text-xs">
                        <TrendingUp className="h-3 w-3" />
                        {student.averageScore}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-secondary-50/50 border-t border-secondary-100 flex justify-center">
            <Link to="/admin/results" className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 uppercase tracking-widest">
              Review All System Results
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>

        {/* Quick Management Links */}
        <div className="space-y-6">
          <Card title="Administration" subtitle="Core system management">
            <div className="space-y-3">
              {[
                { to: '/admin/users', icon: Users, color: 'text-primary-600 bg-primary-50', label: 'User Accounts' },
                { to: '/admin/subjects', icon: BookOpen, color: 'text-accent-600 bg-accent-50', label: 'Subject Categories' },
                { to: '/admin/settings', icon: Settings, color: 'text-secondary-600 bg-secondary-50', label: 'System Parameters' }
              ].map((link, idx) => (
                <Link 
                  key={idx}
                  to={link.to} 
                  className="flex items-center justify-between p-4 rounded-xl border border-secondary-100 bg-white hover:bg-secondary-50 hover:border-secondary-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${link.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <link.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-secondary-900">{link.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-secondary-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </Card>

          <Card className="bg-secondary-900 border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 text-white">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <Activity className="h-5 w-5 text-primary-400" />
              </div>
              <h4 className="text-lg font-bold mb-2">System Health</h4>
              <p className="text-secondary-400 text-xs leading-relaxed mb-6">Database engine is running on in-memory mode. SQL migration is ready.</p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent-400">
                <div className="h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
                Operational
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
