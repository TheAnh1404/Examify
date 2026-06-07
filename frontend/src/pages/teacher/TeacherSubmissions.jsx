import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Award, ShieldAlert, CheckCircle, Eye, X, AlertTriangle, AlertCircle } from 'lucide-react';

const TeacherSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Detailed Modal states
  const [selectedSub, setSelectedSub] = useState(null);
  const [modalDetails, setModalDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await API.get('/submissions/teacher');
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch student submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpenDetails = async (subId) => {
    setSelectedSub(subId);
    setModalLoading(true);
    setModalError('');
    setModalDetails(null);

    try {
      const res = await API.get(`/submissions/${subId}`);
      setModalDetails(res.data);
    } catch (err) {
      console.error(err);
      setModalError('Failed to fetch detailed responses for this submission.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedSub(null);
    setModalDetails(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-400 font-medium">Review exam responses, grades, and focus logs</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submissions Table */}
      <div className="glass-panel overflow-hidden border border-dark-800">
        {submissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No student submissions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead className="bg-dark-900/60 border-b border-dark-800 text-slate-400 text-xs font-semibold uppercase">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Exam Title</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Security Logs</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/80">
                {submissions.map((sub) => {
                  const maxPoints = sub.examTotalMarks;
                  const pct = maxPoints > 0 ? (sub.score / maxPoints) * 100 : 0;
                  return (
                    <tr key={sub.id} className="hover:bg-dark-800/20 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-200">{sub.studentName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{sub.studentEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-300">{sub.examTitle}</td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-semibold text-slate-200">{sub.score}</span>
                          <span className="text-slate-500 text-xs"> / {maxPoints} pts</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">{pct.toFixed(0)}% score</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {sub.status === 'pass' ? (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">Passed</span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 border border-red-500/25 text-red-400">Failed</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {sub.tabFocusLosses > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            {sub.tabFocusLosses} Tab Changes
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-dark-800 border border-dark-750 text-slate-400">Secure</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(sub.submittedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenDetails(sub.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dark-700 bg-dark-800 hover:bg-dark-700 text-slate-300 font-semibold text-xs transition-all duration-200"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Review
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

      {/* Review Details Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseDetails}></div>
          <div className="glass-panel max-w-2xl w-full max-h-[85vh] p-6 relative z-10 animate-slide-up border-dark-750 bg-dark-900 flex flex-col">
            <div className="flex items-center justify-between border-b border-dark-800 pb-3 mb-5 shrink-0">
              <div>
                <h3 className="font-semibold text-lg text-slate-200">Submission Review</h3>
                {modalDetails && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Taken by <span className="font-semibold text-brand-400">{modalDetails.student?.name}</span> for "{modalDetails.exam?.title}"
                  </p>
                )}
              </div>
              <button onClick={handleCloseDetails} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {modalLoading && (
                <div className="flex items-center justify-center p-12">
                  <div className="h-8 w-8 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin"></div>
                </div>
              )}

              {modalError && (
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="h-5 w-5" />
                  <span>{modalError}</span>
                </div>
              )}

              {modalDetails && (
                <>
                  {/* Performance Indicators */}
                  <div className="grid grid-cols-3 gap-3.5 bg-dark-950 p-4 border border-dark-800 rounded-xl text-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Final Grade</p>
                      <p className="text-xl font-bold text-slate-200 mt-0.5">
                        {modalDetails.submission.score} <span className="text-xs text-slate-500">/ {modalDetails.exam.totalMarks} pts</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Status</p>
                      <div className="mt-0.5">
                        {modalDetails.submission.status === 'pass' ? (
                          <span className="text-sm font-semibold text-emerald-400">Passed</span>
                        ) : (
                          <span className="text-sm font-semibold text-red-400">Failed</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Security Incidents</p>
                      <p className={`text-sm font-bold mt-0.5 ${modalDetails.submission.tabFocusLosses > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {modalDetails.submission.tabFocusLosses} tab switches
                      </p>
                    </div>
                  </div>

                  {/* Anti-cheat flag warning */}
                  {modalDetails.submission.tabFocusLosses > 0 && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <p>
                        <strong>Cheating Risk Flagged:</strong> The student toggled tabs or left the active browser context {modalDetails.submission.tabFocusLosses} times during testing.
                      </p>
                    </div>
                  )}

                  {/* Question Answers Review */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-slate-300 border-b border-dark-800 pb-2">Graded Questions Sheet</h4>
                    
                    {modalDetails.exam.questions.map((q, idx) => {
                      const studentSelection = modalDetails.submission.answers.find(a => a.questionId === q.id)?.selectedOption;
                      const isCorrect = studentSelection === q.correctOption;

                      return (
                        <div key={q.id} className="p-4 rounded-xl border border-dark-800 bg-dark-900/40 space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <span className="h-5 w-5 rounded bg-dark-850 text-[10px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <p className="text-sm font-medium text-slate-200 flex-1">{q.text}</p>
                            <span className={`text-xs font-semibold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isCorrect ? `+${q.marks} pts` : `0 / ${q.marks} pts`}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {q.options.map((option, optIdx) => {
                              const isSelected = studentSelection === optIdx;
                              const isAnswerKey = q.correctOption === optIdx;

                              let style = 'bg-dark-900 text-slate-400 border-dark-800';
                              if (isSelected && isCorrect) {
                                style = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 font-semibold';
                              } else if (isSelected && !isCorrect) {
                                style = 'bg-red-500/10 text-red-300 border-red-500/40 font-semibold';
                              } else if (isAnswerKey) {
                                style = 'bg-emerald-500/5 text-emerald-400/80 border-emerald-500/20 border-dashed';
                              }

                              return (
                                <div 
                                  key={optIdx} 
                                  className={`px-3 py-2 rounded-lg border text-xs flex justify-between items-center ${style}`}
                                >
                                  <span>{String.fromCharCode(65 + optIdx)}. {option}</span>
                                  {isSelected && <span className="text-[9px] uppercase tracking-wide font-bold">{isCorrect ? 'Correct' : 'Your Pick'}</span>}
                                  {!isSelected && isAnswerKey && <span className="text-[9px] uppercase tracking-wide font-bold text-emerald-500/80">Correct Answer</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-dark-800 mt-5 shrink-0">
              <button
                type="button"
                onClick={handleCloseDetails}
                className="glow-button w-full"
              >
                Close Gradebook Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSubmissions;
