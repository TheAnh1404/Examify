import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { AlertCircle, Award, FileQuestion, LineChart, ShieldAlert, Users } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    dashboardService.getTeacherStats()
      .then((response) => {
        if (active) setData(response.data);
      })
      .catch((requestError) => {
        console.error(requestError);
        if (active) setError('Failed to load teacher analytics.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loading message="Compiling analytics trends..." />;
  if (error) {
    return (
      <div className="p-4 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-sm flex items-center gap-3">
        <ShieldAlert className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  const { stats, scoreDistribution, hardestQuestions } = data;
  const maxDistribution = Math.max(...scoreDistribution.map(item => item.count), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Insights"
        subtitle="Real performance distribution and difficult-question analysis from your exams."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Average Passing Rate" value={`${stats.passRate}%`} icon={Award} />
        <StatCard title="Total Attempts Logged" value={stats.totalSubmissions} icon={LineChart} />
        <StatCard title="Active Student Pool" value={stats.totalStudents} icon={Users} />
        <StatCard title="Published Exams" value={stats.totalExams} icon={FileQuestion} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Score Distribution"
          subtitle="Submitted attempts grouped by normalized score"
          className="lg:col-span-2"
        >
          <div className="space-y-5 py-2">
            {scoreDistribution.map((item) => (
              <div key={item.range} className="grid grid-cols-[48px_1fr_36px] items-center gap-4">
                <span className="text-xs font-bold text-secondary-500">{item.range}</span>
                <div className="h-4 rounded-full bg-secondary-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all"
                    style={{ width: `${(item.count / maxDistribution) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-secondary-900 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Toughest Questions Pool" subtitle="Highest incorrect-answer rates">
          <div className="space-y-4">
            {hardestQuestions.map((question) => (
              <div key={question.id} className="p-4 border border-secondary-200 rounded-xl bg-secondary-50/50 space-y-3">
                <p className="text-xs font-semibold text-secondary-800 leading-relaxed line-clamp-3">{question.text}</p>
                <div className="pt-2 border-t border-secondary-200 flex justify-between text-xs">
                  <span className="text-secondary-400">Incorrect:</span>
                  <span className="font-bold text-danger-600">
                    {question.incorrectAttempts}/{question.totalAttempts} ({question.percentageWrong}%)
                  </span>
                </div>
              </div>
            ))}
            {hardestQuestions.length === 0 && (
              <p className="text-sm text-secondary-500 text-center py-8">No submitted answers are available for analysis.</p>
            )}
            <div className="p-3.5 rounded-lg bg-primary-50 border border-primary-100 text-primary-600 text-[10px] font-semibold tracking-wide flex items-center gap-2 uppercase">
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
