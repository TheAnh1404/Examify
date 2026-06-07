import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { BookOpen, Award, CheckCircle, ChevronRight, Play, Eye, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [examsRes, subsRes] = await Promise.all([
          API.get('/exams'),
          API.get('/submissions/student')
        ]);
        setExams(examsRes.data);
        setSubmissions(subsRes.data);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
        setError('Could not retrieve dashboard data from the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Calculate student stats
  const totalTaken = submissions.length;
  const passedSubmissions = submissions.filter(s => s.status === 'pass');
  const passRate = totalTaken > 0 ? (passedSubmissions.length / totalTaken) * 100 : 0;
  
  const averageScore = totalTaken > 0 
    ? submissions.reduce((sum, s) => {
        const subPct = s.examTotalMarks > 0 ? (s.score / s.examTotalMarks) * 100 : 0;
        return sum + subPct;
      }, 0) / totalTaken
    : 0;

  // Filter exams that are available (not taken yet)
  const completedExamIds = submissions.map(s => s.examId);
  const availableExams = exams.filter(e => !completedExamIds.includes(e.id));

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-brand-500/5 p-6 md:p-8">
        <div className="relative z-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-100 mb-1.5">Academic Dashboard</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">
            Welcome to your student portal. Review available assessments, test your skills, and view immediate graded feedback.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Stat 1 */}
        <div className="glass-panel p-6 flex items-center gap-5 hover:border-brand-500/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exams Taken</p>
            <p className="font-display font-bold text-3xl text-slate-200 mt-1">{totalTaken}</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-panel p-6 flex items-center gap-5 hover:border-emerald-500/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pass Rate</p>
            <p className="font-display font-bold text-3xl text-slate-200 mt-1">{passRate.toFixed(0)}%</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-panel p-6 flex items-center gap-5 hover:border-indigo-500/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Score</p>
            <p className="font-display font-bold text-3xl text-slate-200 mt-1">{averageScore.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Exams Card */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="font-semibold text-lg text-slate-200 border-b border-dark-800 pb-3">Available Examinations</h3>
          
          {availableExams.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              All published exams completed! Check back later.
            </div>
          ) : (
            <div className="divide-y divide-dark-800/60">
              {availableExams.map((exam) => (
                <div key={exam.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm text-slate-200 truncate">{exam.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{exam.description || 'No description'}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-2">
                      <span>{exam.duration} mins</span>
                      <span>•</span>
                      <span>{exam.questionCount} Questions</span>
                      <span>•</span>
                      <span>{exam.totalMarks} pts</span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/student/exams/take/${exam.id}`}
                    className="glow-button flex items-center gap-1.5 py-1.5 px-3 text-xs shrink-0"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Start
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History / Graded Reports Card */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="font-semibold text-lg text-slate-200 border-b border-dark-800 pb-3">My Graded Submissions</h3>
          
          {submissions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No submissions recorded yet. Take an exam to see results.
            </div>
          ) : (
            <div className="divide-y divide-dark-800/60">
              {submissions.map((sub) => {
                const subPct = sub.examTotalMarks > 0 ? (sub.score / sub.examTotalMarks) * 100 : 0;
                return (
                  <div key={sub.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-slate-200 truncate">{sub.examTitle}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="text-slate-300 font-semibold">{sub.score} / {sub.examTotalMarks} pts</span>
                        <span className="text-slate-500">({subPct.toFixed(0)}%)</span>
                        <span>•</span>
                        {sub.status === 'pass' ? (
                          <span className="text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">Pass</span>
                        ) : (
                          <span className="text-red-400 text-[10px] font-semibold uppercase tracking-wider">Fail</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <Link
                      to={`/student/history/${sub.id}`}
                      className="secondary-button flex items-center gap-1.5 py-1.5 px-3 text-xs shrink-0 border-dark-700 bg-dark-800"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      Review
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
