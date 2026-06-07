import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import { AlertCircle, ShieldAlert, Award, FileQuestion, LineChart, Users } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getTeacherStats();
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load system analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <Loading message="Compiling analytics trends..." />;

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-105 text-red-700 text-sm flex items-center gap-3">
        <ShieldAlert className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  const { stats, leaderboard, hardestQuestions } = data;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Analytics & Insights" 
        subtitle="Visual analytics, trend graphs, student leaders, and difficult question audits."
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Average Passing Rate" 
          value={`${stats.passRate}%`} 
          icon={Award} 
        />
        <StatCard 
          title="Total Attempts Logged" 
          value={stats.totalSubmissions} 
          icon={LineChart} 
        />
        <StatCard 
          title="Active Student Pool" 
          value={stats.totalStudents} 
          icon={Users} 
        />
        <StatCard 
          title="Published Exams" 
          value={stats.totalExams} 
          icon={FileQuestion} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Trend Line Graph */}
        <Card 
          title="Recent Score Averages" 
          subtitle="Mock timeline analysis of average score grades (%)" 
          className="lg:col-span-2 select-none"
        >
          <div className="w-full flex items-center justify-center p-4">
            {/* Pure SVG Line Chart */}
            <svg viewBox="0 0 500 220" className="w-full max-h-[220px]">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />
              
              {/* Y Axis labels */}
              <text x="15" y="25" fill="#94a3b8" fontSize="10" fontWeight="bold">100%</text>
              <text x="15" y="75" fill="#94a3b8" fontSize="10" fontWeight="bold">75%</text>
              <text x="15" y="125" fill="#94a3b8" fontSize="10" fontWeight="bold">50%</text>
              <text x="15" y="175" fill="#94a3b8" fontSize="10" fontWeight="bold">0%</text>

              {/* Chart Line Path */}
              {/* Data points: (06/01: 75% -> 120px Y), (06/03: 82% -> 106px Y), (06/05: 85% -> 100px Y) */}
              <path 
                d="M 80 120 L 260 106 L 440 100" 
                fill="none" 
                stroke="#2563eb" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                strokeLinejoin="round" 
              />

              {/* Data dots */}
              <circle cx="80" cy="120" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              <circle cx="260" cy="106" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              <circle cx="440" cy="100" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />

              {/* Labels */}
              <text x="75" y="140" fill="#2563eb" fontSize="10" fontWeight="bold">75%</text>
              <text x="255" y="125" fill="#2563eb" fontSize="10" fontWeight="bold">82%</text>
              <text x="435" y="120" fill="#2563eb" fontSize="10" fontWeight="bold">85%</text>

              {/* X Axis labels */}
              <text x="65" y="195" fill="#64748b" fontSize="11" fontWeight="bold">June 1st</text>
              <text x="245" y="195" fill="#64748b" fontSize="11" fontWeight="bold">June 3rd</text>
              <text x="425" y="195" fill="#64748b" fontSize="11" fontWeight="bold">June 5th</text>
            </svg>
          </div>
        </Card>

        {/* Hardest Questions Card */}
        <Card title="Toughest Questions Pool" subtitle="Items answered incorrectly most frequently">
          <div className="space-y-4">
            {hardestQuestions.map((q, idx) => (
              <div key={idx} className="p-4 border border-secondary-200 rounded-xl bg-secondary-50/50 space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded bg-red-100 text-red-700 text-[10px] font-bold flex items-center justify-center shrink-0 border border-red-200 select-none">
                    !
                  </span>
                  <p className="text-xs font-semibold text-secondary-800 leading-relaxed line-clamp-2">{q.text}</p>
                </div>
                
                <div className="pt-2 border-t border-secondary-200 flex justify-between text-xs select-none">
                  <span className="text-secondary-400">Incorrect count:</span>
                  <span className="font-bold text-red-600">{q.incorrectAttempts} of {q.totalAttempts} ({q.percentageWrong}%)</span>
                </div>
              </div>
            ))}

            <div className="p-3.5 rounded-lg bg-primary-50 border border-primary-100 text-primary-600 text-[10px] font-semibold tracking-wide flex items-center gap-2 select-none uppercase">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>Review prompts with high error margins.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
