import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { attemptService } from '../../services/attemptService';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Clock, ShieldAlert, AlertTriangle, ChevronLeft, ChevronRight, Send, GraduationCap, CheckCircle2 } from 'lucide-react';

const ExamTaking = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // { questionId, selectedOption }
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt] = useState(new Date().toISOString());
  
  const [tabFocusLosses, setTabFocusLosses] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchExamTemplate = async () => {
      try {
        const res = await examService.getById(examId);
        setExam(res.data);
        setTimeLeft(res.data.duration * 60);
        setAnswers(res.data.resolvedQuestions.map(q => ({
          questionId: q.id,
          selectedOption: null
        })));
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load exam template.');
      } finally {
        setLoading(false);
      }
    };
    fetchExamTemplate();
  }, [examId]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Warning: Exiting or refreshing will submit the exam in its current state.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabFocusLosses(prev => prev + 1);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 5000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && exam) {
      handleAutoSubmit();
      return;
    }

    const clockInterval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [timeLeft, exam]);

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers(prev => prev.map(ans => 
      ans.questionId === questionId 
        ? { ...ans, selectedOption: optionIndex } 
        : ans
    ));
  };

  const handleNext = () => {
    if (currentIdx < exam.resolvedQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const performSubmission = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      window.onbeforeunload = null;
      const formattedAnswers = answers.map(a => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption !== null ? Number(a.selectedOption) : -1
      }));

      const res = await attemptService.submitAttempt(
        examId,
        formattedAnswers,
        tabFocusLosses,
        startedAt
      );

      setConfirmOpen(false);
      navigate(`/student/results/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setError('An error occurred during submission. Retrying...');
      setSubmitting(false);
    }
  };

  const handleManualSubmitClick = () => {
    setConfirmOpen(true);
  };

  const handleAutoSubmit = () => {
    performSubmission();
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loading message="Entering proctored workspace..." fullPage />;

  if (error && !submitting) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="saas-card max-w-md w-full p-10 text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-danger-50 text-danger-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-secondary-900 tracking-tight">Access Denied</h3>
          <p className="text-secondary-500 font-medium leading-relaxed">{error}</p>
          <Button onClick={() => navigate('/student/dashboard')} variant="primary" fullWidth size="lg">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = exam.resolvedQuestions[currentIdx];
  const selectedAns = answers.find(a => a.questionId === currentQ.id)?.selectedOption;
  const unansweredCount = answers.filter(a => a.selectedOption === null).length;
  
  const timeLow = timeLeft < 120;
  const timeUrgent = timeLeft < 30;

  return (
    <div className="min-h-screen bg-bg flex flex-col select-none">
      
      {/* Immersive Proctor Header */}
      <header className="h-16 bg-white border-b border-secondary-100 px-8 sticky top-0 z-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-secondary-900 leading-none mb-1">
              {exam.title}
            </h1>
            <span className="text-[10px] text-primary-600 font-bold uppercase tracking-widest">
              Live Proctoring Active
            </span>
          </div>
        </div>

        {/* Warning Badge */}
        {tabFocusLosses > 0 && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-[10px] font-bold uppercase tracking-wider animate-fade-in">
            <ShieldAlert className="h-4 w-4" />
            <span>Incidents: {tabFocusLosses}</span>
          </div>
        )}

        {/* High-visibility Timer */}
        <div className={`
          flex items-center gap-2.5 px-5 py-2 rounded-xl border font-mono font-bold text-lg shadow-sm transition-all duration-300
          ${timeUrgent 
            ? 'bg-danger-600 border-danger-700 text-white animate-pulse' 
            : timeLow 
              ? 'bg-warning-50 border-warning-200 text-warning-700' 
              : 'bg-secondary-900 border-secondary-950 text-white shadow-lg shadow-secondary-900/20'}
        `}>
          <Clock className="h-5 w-5" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </header>

      {/* Warning Overlay */}
      {showWarning && (
        <div className="bg-danger-600 text-white px-8 py-2.5 text-center text-xs font-bold uppercase tracking-widest animate-fade-in shrink-0">
          <AlertTriangle className="h-4 w-4 inline-block mr-2 -mt-0.5" />
          <span>Warning: Tab Switching Detected. Incident #{tabFocusLosses} Recorded.</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left: Question Navigator (Desktop) */}
        <aside className="hidden lg:flex w-80 bg-white border-r border-secondary-100 p-8 flex-col shrink-0 overflow-y-auto">
          <h4 className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-6">Question Sheet</h4>
          
          <div className="grid grid-cols-4 gap-3 mb-8">
            {exam.resolvedQuestions.map((q, idx) => {
              const isAnswered = answers.find(a => a.questionId === q.id)?.selectedOption !== null;
              const isActive = currentIdx === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`
                    h-11 w-11 rounded-xl font-bold text-sm transition-all duration-200 border-2
                    ${isActive 
                      ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/25' 
                      : isAnswered 
                        ? 'bg-primary-50 border-primary-100 text-primary-600' 
                        : 'bg-secondary-50 border-secondary-100 text-secondary-400 hover:border-secondary-300 hover:text-secondary-600'}
                  `}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-auto space-y-6">
            <div className="p-5 rounded-2xl bg-secondary-50 border border-secondary-100 space-y-4">
              <h5 className="text-[10px] font-bold text-secondary-900 uppercase tracking-widest">Progress</h5>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-secondary-500">Answered</span>
                <span className="text-primary-600">{exam.resolvedQuestions.length - unansweredCount} / {exam.resolvedQuestions.length}</span>
              </div>
              <div className="w-full h-2 bg-secondary-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-600 transition-all duration-500" 
                  style={{ width: `${((exam.resolvedQuestions.length - unansweredCount) / exam.resolvedQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleManualSubmitClick}
              disabled={submitting}
              fullWidth
              size="lg"
              className="py-4 shadow-xl shadow-primary-500/25"
              icon={<Send className="h-5 w-5" />}
            >
              Submit Sheet
            </Button>
          </div>
        </aside>

        {/* Center: Question Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
          <div className="max-w-3xl mx-auto space-y-8">
            
            <div className="saas-card shadow-xl overflow-visible border-none bg-white">
              <div className="px-8 py-6 border-b border-secondary-50 flex items-center justify-between">
                <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-lg">
                  Question {currentIdx + 1}
                </span>
                <span className="text-xs font-bold text-secondary-400 uppercase tracking-widest">
                  {currentQ.marks} Points
                </span>
              </div>

              <div className="p-8 sm:p-12">
                <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 leading-snug mb-10">
                  {currentQ.text}
                </h2>

                <div className="space-y-4">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedAns === idx;
                    return (
                      <div 
                        key={idx}
                        onClick={() => handleSelectOption(currentQ.id, idx)}
                        className={`
                          group cursor-pointer rounded-2xl p-6 flex items-center gap-6 transition-all duration-200 border-2
                          ${isSelected 
                            ? 'border-primary-600 bg-primary-50/20' 
                            : 'border-secondary-100 bg-white hover:border-secondary-200 hover:bg-secondary-50/50'}
                        `}
                      >
                        <div className={`
                          h-10 w-10 rounded-xl font-bold text-lg flex items-center justify-center shrink-0 transition-all
                          ${isSelected 
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' 
                            : 'bg-secondary-50 text-secondary-400 group-hover:bg-secondary-100 group-hover:text-secondary-600'}
                        `}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-base font-bold transition-colors ${isSelected ? 'text-secondary-900' : 'text-secondary-600'}`}>
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-8 py-6 bg-secondary-50/30 flex items-center justify-between border-t border-secondary-50 rounded-b-2xl">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  icon={<ChevronLeft className="h-5 w-5" />}
                  className="px-6"
                >
                  Previous
                </Button>
                
                <Button
                  variant={currentIdx === exam.resolvedQuestions.length - 1 ? 'primary' : 'outline'}
                  onClick={currentIdx === exam.resolvedQuestions.length - 1 ? handleManualSubmitClick : handleNext}
                  className="px-6"
                  icon={currentIdx === exam.resolvedQuestions.length - 1 ? <Send className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  iconRight
                >
                  {currentIdx === exam.resolvedQuestions.length - 1 ? 'Finish Exam' : 'Next Question'}
                </Button>
              </div>
            </div>

            {/* Mobile Navigator (Horizontal Scroll) */}
            <div className="lg:hidden p-4 rounded-2xl bg-white border border-secondary-100 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-sm">
              {exam.resolvedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-10 w-10 rounded-lg font-bold text-xs shrink-0 transition-all ${currentIdx === idx ? 'bg-primary-600 text-white' : 'bg-secondary-50 text-secondary-500'}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={performSubmission}
        title="Submit Examination"
        message={
          unansweredCount > 0
            ? `Warning: You have ${unansweredCount} unanswered questions. Are you sure you want to finalize your submission?`
            : 'Ready to finalize your assessment? You will not be able to change your answers after submission.'
        }
        confirmText="Yes, Submit Final"
        type="warning"
        loading={submitting}
      />
    </div>
  );
};

export default ExamTaking;
