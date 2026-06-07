import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Users, BookOpen, Award, Plus, UserPlus, CheckCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
        setError('Could not retrieve statistics from the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
        <ShieldAlert className="h-6 w-6" />
        <p>{error}</p>
      </div>
    );
  }

  // Calculate percentages for visual bars
  const totalRoles = stats?.totalUsers || 1;
  const adminPct = ((stats?.usersByRole?.admin || 0) / totalRoles) * 100;
  const teacherPct = ((stats?.usersByRole?.teacher || 0) / totalRoles) * 100;
  const studentPct = ((stats?.usersByRole?.student || 0) / totalRoles) * 100;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-brand-500/5 p-6 md:p-8">
        <div className="relative z-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-100 mb-1.5">System Overview</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">
            Welcome to the Examify central operations command. Monitor SaaS stats, modify user credentials, and manage system resources.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1 */}
        <div className="glass-panel p-6 flex items-center gap-5 hover:border-brand-500/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Accounts</p>
            <p className="font-display font-bold text-3xl text-slate-200 mt-1">{stats?.totalUsers}</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 flex items-center gap-5 hover:border-indigo-500/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Exams</p>
            <p className="font-display font-bold text-3xl text-slate-200 mt-1">{stats?.totalExams}</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 flex items-center gap-5 hover:border-emerald-500/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Submissions</p>
            <p className="font-display font-bold text-3xl text-slate-200 mt-1">{stats?.totalSubmissions}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution Card */}
        <div className="glass-panel p-6 lg:col-span-2 space-y-6">
          <h3 className="font-semibold text-lg text-slate-200 border-b border-dark-800 pb-3">User Base Distribution</h3>
          
          <div className="space-y-4">
            {/* Admin Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-300 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
                  Administrators
                </span>
                <span className="text-slate-400 font-semibold">{stats?.usersByRole?.admin} ({adminPct.toFixed(1)}%)</span>
              </div>
              <div className="h-3 w-full bg-dark-900 rounded-full overflow-hidden">
                <div style={{ width: `${adminPct}%` }} className="h-full bg-purple-500 rounded-full transition-all duration-1000"></div>
              </div>
            </div>

            {/* Teacher Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-300 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                  Teachers
                </span>
                <span className="text-slate-400 font-semibold">{stats?.usersByRole?.teacher} ({teacherPct.toFixed(1)}%)</span>
              </div>
              <div className="h-3 w-full bg-dark-900 rounded-full overflow-hidden">
                <div style={{ width: `${teacherPct}%` }} className="h-full bg-blue-500 rounded-full transition-all duration-1000"></div>
              </div>
            </div>

            {/* Student Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-300 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  Students
                </span>
                <span className="text-slate-400 font-semibold">{stats?.usersByRole?.student} ({studentPct.toFixed(1)}%)</span>
              </div>
              <div className="h-3 w-full bg-dark-900 rounded-full overflow-hidden">
                <div style={{ width: `${studentPct}%` }} className="h-full bg-emerald-500 rounded-full transition-all duration-1000"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg text-slate-200 border-b border-dark-800 pb-3 mb-5">Quick Operations</h3>
            <div className="space-y-3">
              <Link 
                to="/admin/users" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-dark-800 hover:bg-dark-700/60 border border-dark-700/60 text-slate-200 text-sm font-semibold transition-all duration-200"
              >
                <UserPlus className="h-5 w-5 text-brand-400" />
                Manage System Users
              </Link>
              <div className="p-4 rounded-lg bg-dark-900/40 border border-dark-800 text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-slate-300">Activity Log:</p>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>{stats?.recentSubmissionsCount} new tests submitted in past 7 days.</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-dark-800/80 text-[11px] text-slate-500 mt-6 lg:mt-0">
            Examify SaaS Node Engine v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
