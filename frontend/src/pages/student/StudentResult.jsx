import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attemptService } from '../../services/attemptService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Award, CheckCircle2, ShieldAlert, ArrowLeft, AlertTriangle, XCircle, TrendingUp, BookOpen, Clock } from 'lucide-react';

const StudentResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        setLoading(true);
        const res = await attemptService.getById(attemptId);
        setDetails(res.data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load scorecard results.');
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchAttempt();
    }
  }, [attemptId]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Loading graded scorecard report..." />
    </div>
  );

  if (error || !details) {
    return (
      <div className="p-8 rounded-2xl bg-danger-50 border border-danger-100 text-danger-700 flex flex-col items-center gap-4 text-center animate-fade-in">
        <ShieldAlert className="h-10 w-10 shrink-0" />
        <div>
          <h4 className="text-lg font-bold">Report Error</h4>
          <p className="font-medium text-sm mt-1">{error || 'Scorecard details could not be found.'}</p>
        </div>
        <Button onClick={() => navigate('/student/dashboard')} size="md" variant="primary" className="mt-2">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const { attempt, exam } = details;
  const scorePct = exam.totalMarks > 0 ? (attempt.score / exam.totalMarks) * 100 : 0;
  const isPassed = attempt.status.toUpperCase() === 'PASS';

  const timeSpent = attempt.submittedAt && attempt.startedAt 
    ? Math.floor((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000)
    : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      
      {/* Header back row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/student/dashboard" 
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-secondary-200 text-secondary-500 hover:text-secondary-900 transition-all shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="h1 mb-1">Graded Exam Report</h1>
            <p className="p">Review your performance achievements and feedback keys.</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="hidden sm:flex">
          Download PDF
        </Button>
      </div>

      {/* Main Performance Card */}
      <div className={`relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center border-2 ${isPassed ? 'border-accent-500 bg-accent-50/10' : 'border-danger-500 bg-danger-50/10'}`}>
        <div className={`absolute top-0 right-0 h-64 w-64 rounded-full blur-[120px] pointer-events-none opacity-20 -mr-32 -mt-32 ${isPassed ? 'bg-accent-500' : 'bg-danger-500'}`} />
        <div className={`absolute bottom-0 left-0 h-48 w-48 rounded-full blur-[100px] pointer-events-none opacity-20 -ml-24 -mb-24 ${isPassed ? 'bg-accent-500' : 'bg-danger-500'}`} />

        <div className="relative z-10 space-y-8">
          <div className="flex flex-col items-center">
            <div className={`h-24 w-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl ${isPassed ? 'bg-accent-600 text-white shadow-accent-500/30' : 'bg-danger-600 text-white shadow-danger-500/30'}`}>
              {isPassed ? <Award className="h-12 w-12" /> : <XCircle className="h-12 w-12" />}
            </div>
            <Badge variant={isPassed ? 'success' : 'danger'} size="lg" className="px-6 py-1.5 text-xs">
              {isPassed ? 'Examination Passed' : 'Examination Failed'}
            </Badge>
          </div>

          <div className="max-w-md mx-auto">
            <h2 className="text-secondary-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">{exam.title}</h2>
            <div className="flex items-center justify-center gap-4">
              <span className="text-6xl md:text-7xl font-extrabold text-secondary-900 tracking-tighter">{attempt.score}</span>
              <div className="text-left">
                <p className="text-xl md:text-2xl font-bold text-secondary-400 leading-none mb-1">/ {exam.totalMarks}</p>
                <p className="text-sm font-bold text-secondary-500 uppercase tracking-widest leading-none">Total Points</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto pt-8 border-t border-secondary-100">
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-secondary-100">
              <TrendingUp className="h-4 w-4 text-primary-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-secondary-900 leading-none">{scorePct.toFixed(0)}%</p>
              <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-1">Accuracy</p>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-secondary-100">
              <CheckCircle2 className="h-4 w-4 text-accent-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-secondary-900 leading-none">{attempt.totalCorrect} / {exam.questions.length}</p>
              <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-1">Correct</p>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-secondary-100">
              <Clock className="h-4 w-4 text-warning-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-secondary-900 leading-none">{timeSpent}m</p>
              <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-1">Time Spent</p>
            </div>
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-secondary-100">
              <ShieldAlert className="h-4 w-4 text-danger-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-secondary-900 leading-none">{attempt.tabFocusLosses}</p>
              <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-1">Incidents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proctoring Warnings */}
      {attempt.tabFocusLosses > 0 && (
        <div className="flex items-start gap-4 p-6 rounded-2xl bg-warning-50 border border-warning-100 text-warning-800">
          <AlertTriangle className="h-6 w-6 text-warning-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Security Log: Tab Focus Loss Detected</p>
            <p className="mt-1 text-xs text-warning-700 leading-relaxed font-medium">
              The platform recorded <strong>{attempt.tabFocusLosses} incidents</strong> where the exam window lost cursor focus. This information has been reported to your instructor for audit purposes.
            </p>
          </div>
        </div>
      )}

      {/* Answer Key */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-secondary-100 pb-4">
          <h3 className="text-lg font-bold text-secondary-900 tracking-tight">Question Feedback</h3>
          <span className="text-xs font-bold text-secondary-400 uppercase tracking-widest">{exam.questions.length} Items</span>
        </div>

        <div className="space-y-4">
          {exam.questions.map((q, idx) => {
            const studentSelection = attempt.answers.find(ans => ans.questionId === q.id)?.selectedOption;
            const isCorrect = studentSelection === q.correctOption;

            return (
              <Card key={q.id} bodyClassName="p-0 overflow-hidden" className="border-secondary-100 shadow-sm">
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-xl bg-secondary-50 text-secondary-500 font-bold text-xs flex items-center justify-center shrink-0 border border-secondary-100">
                        {idx + 1}
                      </div>
                      <h4 className="font-bold text-secondary-900 leading-relaxed max-w-xl">
                        {q.text}
                      </h4>
                    </div>
                    <Badge variant={isCorrect ? 'success' : 'danger'} dot className="hidden sm:flex">
                      {isCorrect ? `+${q.marks} pts` : `0 / ${q.marks} pts`}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = studentSelection === optIdx;
                      const isCorrectAnswer = q.correctOption === optIdx;

                      let style = 'bg-white border-secondary-100 text-secondary-500';
                      if (isSelected && isCorrectAnswer) style = 'bg-accent-50 border-accent-500 text-accent-900 font-bold';
                      else if (isSelected && !isCorrectAnswer) style = 'bg-danger-50 border-danger-500 text-danger-900 font-bold';
                      else if (isCorrectAnswer) style = 'border-accent-500 border-dashed bg-accent-50/10 text-accent-700 font-bold';

                      return (
                        <div 
                          key={optIdx} 
                          className={`px-4 py-3.5 rounded-xl border text-sm flex justify-between items-center transition-all ${style}`}
                        >
                          <span className="leading-snug">{String.fromCharCode(65 + optIdx)}. {opt}</span>
                          
                          {isSelected && (
                            <span className={`text-[9px] uppercase tracking-widest font-extrabold px-2 py-1 rounded-lg ${
                              isCorrect ? 'bg-accent-600 text-white' : 'bg-danger-600 text-white'
                            }`}>
                              {isCorrect ? 'Correct' : 'Your Pick'}
                            </span>
                          )}
                          {!isSelected && isCorrectAnswer && (
                            <span className="text-[9px] uppercase tracking-widest font-extrabold px-2 py-1 bg-accent-100 text-accent-800 rounded-lg">
                              Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <Button onClick={() => navigate('/student/dashboard')} variant="primary" size="lg" className="px-12 shadow-xl shadow-primary-500/25">
          Return to Learning Portal
        </Button>
      </div>

    </div>
  );
};

export default StudentResult;
