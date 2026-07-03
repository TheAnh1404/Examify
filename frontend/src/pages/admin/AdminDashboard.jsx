import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
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
        setError('Không thể tải số liệu bảng điều khiển hệ thống.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Đang tổng hợp tổng quan hệ thống..." />
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

  const { stats, leaderboard, systemStatus } = statsData;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-extrabold text-secondary-900 tracking-tight mb-2">Trung tâm quản trị hệ thống</h1>
          <p className="text-secondary-500 font-medium">Tổng quan số liệu hệ thống, môn học và phân bổ người dùng.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/admin/settings')} icon={<Settings size={18} />}>
            Cài đặt
          </Button>
          <Button variant="primary" onClick={() => navigate('/admin/users/create')} icon={<Activity size={18} />}>
            Tạo người dùng
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        <StatCard 
          title="Tổng học sinh"
          value={stats.totalStudents} 
          icon={GraduationCap} 
          description="Tài khoản học sinh đã đăng ký"
        />
        <StatCard 
          title="Giáo viên"
          value={stats.totalTeachers} 
          icon={Users} 
          description="Tài khoản giáo viên hoạt động"
        />
        <StatCard 
          title="Bài thi hoạt động"
          value={stats.totalExams} 
          icon={BookOpen} 
          description="Bài thi đã công bố"
        />
        <StatCard 
          title="Tổng lượt làm bài"
          value={stats.totalSubmissions} 
          icon={FileSpreadsheet} 
          description={`${stats.flaggedAttempts} cảnh báo giám sát`}
        />
        <StatCard 
          title="Tỷ lệ đạt toàn hệ thống"
          value={`${stats.passRate}%`} 
          icon={Award} 
          description="Trên các lượt đã nộp"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Leaderboard Panel */}
        <Card 
          title="Bảng xếp hạng học sinh"
          subtitle="Học sinh có kết quả cao nhất trong toàn bộ lượt làm bài"
          className="lg:col-span-2 shadow-xl shadow-secondary-200/20"
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-secondary-50/30 border-b border-secondary-50">
                  <th className="px-8 py-5 text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.15em]">Hồ sơ học sinh</th>
                  <th className="px-8 py-5 text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.15em] text-center">Lượt làm</th>
                  <th className="px-8 py-5 text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.15em] text-right">Điểm TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {leaderboard.map((student) => (
                  <tr key={student.studentEmail} className="hover:bg-primary-50/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary-500/10 text-primary-600 flex items-center justify-center font-extrabold text-lg">
                          {student.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">{student.studentName}</p>
                          <p className="text-xs text-secondary-400 font-bold uppercase tracking-tight">{student.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center font-extrabold text-secondary-600">
                      {student.examsTaken}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-accent-50 border border-accent-100 text-accent-700 font-extrabold text-xs shadow-sm">
                        <TrendingUp className="h-3 w-3" />
                        {student.averageScore}%
                      </div>
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-8 py-12 text-center text-secondary-400 font-semibold">
                      Chưa có lượt nộp bài nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-secondary-50/30 border-t border-secondary-50 flex justify-center">
            <Link to="/admin/results" className="text-[10px] font-extrabold text-primary-500 hover:text-primary-700 flex items-center gap-2 uppercase tracking-widest transition-all">
              Xem toàn bộ kết quả hệ thống
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>

        {/* Quick Management Links */}
        <div className="space-y-8">
          <Card title="Quản trị" subtitle="Quản lý các thành phần cốt lõi" className="shadow-xl shadow-secondary-200/20">
            <div className="space-y-4">
              {[
                { to: '/admin/users', icon: Users, color: 'text-primary-500 bg-primary-50', label: 'Tài khoản người dùng' },
                { to: '/admin/subjects', icon: BookOpen, color: 'text-accent-500 bg-accent-50', label: 'Môn học' },
                { to: '/admin/settings', icon: Settings, color: 'text-secondary-400 bg-secondary-50', label: 'Tham số hệ thống' }
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

          <Card className="bg-secondary-900 border-none relative overflow-hidden group shadow-2xl shadow-primary-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 text-white p-2">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 ring-1 ring-white/20">
                <Activity className="h-6 w-6 text-primary-400" />
              </div>
              <h4 className="text-xl font-extrabold mb-3 tracking-tight">Tình trạng hệ thống</h4>
              <p className="text-secondary-400 text-xs font-bold leading-relaxed mb-8 uppercase tracking-wide">
                Cơ sở dữ liệu được kiểm tra lúc {new Date(systemStatus.generatedAt).toLocaleTimeString('vi-VN')}.
              </p>
              <div className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent-400">
                <div className="h-2.5 w-2.5 rounded-full bg-accent-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                {systemStatus.database === 'UP' ? 'Hoạt động' : 'Không khả dụng'}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
