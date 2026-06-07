import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { BookOpen, Award, CheckCircle, Plus, Eye, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, subsRes] = await Promise.all([
        API.get('/exams/teacher/all'),
        API.get('/submissions/teacher')
      ]);
      setExams(examsRes.data);
      setSubmissions(subsRes.data);
    } catch (err) {
      console.error('Failed to load teacher dashboard data:', err);
      setError('Could not retrieve dashboard metrics from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteExam = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete exam "${title}"? All submissions associated with it will also be deleted.`)) {
      return;
    }

    try {
      setError('');
      await API.delete(`/exams/${id}`);
      setExams(prev => prev.filter(e => e.id !== id));
      // Re-fetch submissions list since database cascade deleted them
      const subsRes = await API.get('/submissions/teacher');
      setSubmissions(subsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete exam.');
    }
  };

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

  // Calculate metrics
  const totalExams = exams.length;
  const totalTakers = submissions.length;
  const passCount = submissions.filter(s => s.status === 'pass').length;
  const passRate = totalTakers > 0 ? (passCount / totalTakers) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 md:p-8">
        <div className="relative z-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-slate-100 mb-1.5">Instructor Hub</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">
            Design your questionnaires, track student test metrics, and verify results under your dashboard.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Stat 1 */}
        <div className="glass-panel p-6 flex items-center gap-5 hover:border-brand-500/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Exams</p>
            <p className="font-display font-bold text-3xl text-slate-200 mt-1">{totalExams}</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-panel p-6 flex items-center gap-5 hover:border-indigo-500/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Submissions</p>
            <p className="font-display font-bold text-3xl text-slate-200 mt-1">{totalTakers}</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-panel p-6 flex items-center gap-5 hover:border-emerald-500/30 transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Passing Rate</p>
            <p className="font-display font-bold text-3xl text-slate-200 mt-1">{passRate.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Main Panel grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-dark-800 pb-3">
          <h3 className="font-semibold text-lg text-slate-200">Manage Questionnaires</h3>
          <Link 
            to="/teacher/exams/new" 
            className="glow-button flex items-center gap-2 text-xs"
          >
            <Plus className="h-4 w-4" />
            Create Exam
          </Link>
        </div>

        {/* Exams List Card */}
        <div className="glass-panel overflow-hidden">
          {exams.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-4">
              <p>You haven't built any examinations yet.</p>
              <Link to="/teacher/exams/new" className="inline-block px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs transition-all duration-200">
                Build First Exam
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead className="bg-dark-900/60 border-b border-dark-800 text-slate-400 text-xs font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Total Marks</th>
                    <th className="px-6 py-4">Questions Count</th>
                    <th className="px-6 py-4">Submissions</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/80">
                  {exams.map((exam) => {
                    const examSubs = submissions.filter(s => s.examId === exam.id).length;
                    return (
                      <tr key={exam.id} className="hover:bg-dark-800/20 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-200">{exam.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-sm">{exam.description || 'No description'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400">{exam.duration} mins</td>
                        <td className="px-6 py-4 text-slate-400 font-semibold">{exam.totalMarks} pts</td>
                        <td className="px-6 py-4 text-slate-400">{exam.questions.length} Qs</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full bg-dark-800 text-slate-300 text-xs font-medium border border-dark-700">
                            {examSubs} submissions
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Link
                            to={`/teacher/exams/edit/${exam.id}`}
                            className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-500/5 border border-transparent hover:border-brand-500/20 transition-all duration-150"
                            title="Edit Exam"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteExam(exam.id, exam.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/20 transition-all duration-150"
                            title="Delete Exam"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
