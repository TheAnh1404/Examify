import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attemptService } from '../../services/attemptService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { Award, CheckCircle, ShieldAlert, ArrowLeft, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';

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

  if (loading) return <Loading message="Loading graded scorecard report..." />;

  if (error || !details) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
        <ShieldAlert className="h-5 w-5" />
        <p>{error || 'Scorecard details could not be found.'}</p>
        <Button onClick={() => navigate('/student/dashboard')} size="sm" variant="secondary" className="ml-auto">
          Return Home
        </Button>
      </div>
    );
  }

  const { attempt, exam } = details;
  const scorePct = exam.totalMarks > 0 ? (attempt.score / exam.totalMarks) * 100 : 0;
  const isPassed = attempt.status.toUpperCase() === 'PASS';

  return (
    <div className="space-y-6 max-w-3xl mx-auto select-none">
      
      {/* Header back row */}
      <div className="flex items-center gap-4">
        <Link 
          to="/student/dashboard" 
          className="p-2 rounded-lg bg-white border border-secondary-300 hover:bg-secondary-50 text-secondary-500 hover:text-secondary-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <PageHeader 
            title="Graded Exam Report" 
            subtitle="Review your score achievements, passing indicators, and complete question feedback keys."
          />
        </div>
      </div>

      {/* Main Performance Banner */}
      <div className="bg-white border border-secondary-200 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        {/* Decorative backdrop glow matching pass/fail status */}
        <div className={`absolute top-0 right-0 h-40 w-40 rounded-full blur-[100px] pointer-events-none opacity-10
          ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}
        `}></div>

        <div className="space-y-2 text-center md:text-left relative z-10">
          <span className="text-[10px] bg-secondary-100 text-secondary-600 font-bold uppercase px-2 py-0.5 rounded">
            {exam.title}
          </span>
          <h3 className="font-semibold text-3xl text-secondary-800 mt-2">
            {attempt.score} <span className="text-secondary-400 text-base font-normal">/ {exam.totalMarks} points</span>
          </h3>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1.5 text-xs text-secondary-500 font-medium">
            <span className="font-semibold text-secondary-700">{scorePct.toFixed(0)}% Score</span>
            <span>•</span>
            <span>{attempt.totalCorrect} / {exam.questions.length} Correct Answers</span>
            <span>•</span>
            <span>Requirement: {exam.passPercentage}%</span>
          </div>
        </div>

        <div className="relative z-10 shrink-0 text-center">
          {isPassed ? (
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm mb-2">
                <CheckCircle className="h-7 w-7" />
              </div>
              <Badge variant="success">Passed</Badge>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100 shadow-sm mb-2">
                <XCircle className="h-7 w-7" />
              </div>
              <Badge variant="danger">Failed</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Proctor Focus Loss Warnings */}
      {attempt.tabFocusLosses > 0 && (
        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-700">Exam integrity tracking information</p>
            <p className="mt-0.5 text-secondary-600">
              The proctor system recorded <strong className="text-amber-700">{attempt.tabFocusLosses} instances</strong> where the exam workspace window lost cursor focus. This information has been logged and is accessible by your instructor.
            </p>
          </div>
        </div>
      )}

      {/* Answer key listing */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-secondary-800 uppercase tracking-wider border-b border-secondary-200 pb-2">
          Question Feedback & Grading Key
        </h3>

        {exam.questions.map((q, idx) => {
          const studentSelection = attempt.answers.find(ans => ans.questionId === q.id)?.selectedOption;
          const isCorrect = studentSelection === q.correctOption;

          return (
            <div key={q.id} className="bg-white border border-secondary-200 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3">
                  <span className="h-6 w-6 rounded bg-secondary-100 text-xs font-bold text-secondary-600 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="font-semibold text-sm sm:text-base text-secondary-800 leading-snug">
                    {q.text}
                  </h4>
                </div>
                <span className={`text-xs font-bold shrink-0 px-2 py-0.5 rounded ${
                  isCorrect 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {isCorrect ? `+${q.marks} pts` : `0 / ${q.marks} pts`}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = studentSelection === optIdx;
                  const isAnswerKey = q.correctOption === optIdx;

                  let style = 'bg-white text-secondary-500 border-secondary-200';
                  if (isSelected && isCorrect) {
                    style = 'bg-emerald-50/20 text-secondary-800 border-emerald-500 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    style = 'bg-red-50/20 text-secondary-800 border-red-500 font-semibold';
                  } else if (isAnswerKey) {
                    style = 'bg-emerald-50/10 text-emerald-700 border-emerald-500 border-dashed';
                  }

                  return (
                    <div 
                      key={optIdx} 
                      className={`px-4 py-3 rounded-lg border text-xs flex justify-between items-center ${style}`}
                    >
                      <span className="leading-snug">{String.fromCharCode(65 + optIdx)}. {opt}</span>
                      
                      {isSelected && (
                        <span className={`text-[9px] uppercase tracking-wide font-extrabold px-1.5 py-0.5 rounded ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isCorrect ? 'Correct' : 'Your Answer'}
                        </span>
                      )}
                      {!isSelected && isAnswerKey && (
                        <span className="text-[9px] uppercase tracking-wide font-extrabold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                          Answer Key
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer controls */}
      <div className="flex justify-end pt-4 border-t border-secondary-200">
        <Button onClick={() => navigate('/student/dashboard')} variant="primary">
          Return to Learning Portal
        </Button>
      </div>

    </div>
  );
};

export default StudentResult;
