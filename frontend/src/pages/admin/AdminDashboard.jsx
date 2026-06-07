import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import { Users, GraduationCap, BookOpen, FileSpreadsheet, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

  if (loading) return <Loading message="Assembling system overview..." />;
  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
        <ShieldAlert className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  const { stats, leaderboard } = statsData;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Admin Control Center" 
        subtitle="Overview of system-wide SaaS stats, subject categories, and user allocations."
      />

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={<GraduationCap className="h-5 w-5" />} 
          trendValue="+12%" 
        />
        <StatCard 
          title="Total Teachers" 
          value={stats.totalTeachers} 
          icon={<Users className="h-5 w-5" />} 
          trendValue="+4%" 
        />
        <StatCard 
          title="Active Exams" 
          value={stats.totalExams} 
          icon={<BookOpen className="h-5 w-5" />} 
        />
        <StatCard 
          title="Submissions" 
          value={stats.totalSubmissions} 
          icon={<FileSpreadsheet className="h-5 w-5" />} 
          trendValue="+25%" 
        />
        <StatCard 
          title="Pass Percentage" 
          value={`${stats.passRate}%`} 
          icon={<Award className="h-5 w-5" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard panel */}
        <Card 
          title="Top Student Leaderboard" 
          subtitle="Highest performing student metrics across all exam attempts" 
          className="lg:col-span-2"
          actions={
            <Link to="/admin/results" className="text-xs text-primary-600 hover:text-primary-750 font-bold flex items-center gap-1">
              View All Results
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse text-secondary-700">
              <thead className="bg-secondary-50 border-b border-secondary-200 text-secondary-500 text-xs font-semibold uppercase select-none">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5 text-center">Exams Completed</th>
                  <th className="px-6 py-3.5 text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {leaderboard.map((student, idx) => (
                  <tr key={idx} className="hover:bg-secondary-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-secondary-800">{student.studentName}</p>
                        <p className="text-xs text-secondary-400 mt-0.5">{student.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-secondary-600">
                      {student.examsTaken}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary-50 border border-primary-100 text-primary-700 font-bold text-xs">
                        {student.averageScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Utilities */}
        <Card title="Quick Management Links" subtitle="Perform common operations">
          <div className="space-y-3">
            <Link 
              to="/admin/users" 
              className="flex items-center justify-between p-3.5 rounded-lg border border-secondary-200 bg-secondary-50 hover:bg-secondary-100/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-semibold text-secondary-800">Add or Edit Accounts</span>
              </div>
              <ArrowRight className="h-4 w-4 text-secondary-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link 
              to="/admin/subjects" 
              className="flex items-center justify-between p-3.5 rounded-lg border border-secondary-200 bg-secondary-50 hover:bg-secondary-100/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-accent-600" />
                <span className="text-sm font-semibold text-secondary-800">Configure Subjects</span>
              </div>
              <ArrowRight className="h-4 w-4 text-secondary-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link 
              to="/admin/settings" 
              className="flex items-center justify-between p-3.5 rounded-lg border border-secondary-200 bg-secondary-50 hover:bg-secondary-100/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-secondary-500" />
                <span className="text-sm font-semibold text-secondary-800">System Parameters</span>
              </div>
              <ArrowRight className="h-4 w-4 text-secondary-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
