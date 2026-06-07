import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { attemptService } from '../../services/attemptService';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Clock, ShieldAlert, AlertTriangle, ChevronLeft, ChevronRight, Send, GraduationCap } from 'lucide-react';

const ExamTaking = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Taker parameters
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of { questionId, selectedOption }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [startedAt] = useState(new Date().toISOString());
  
  // Security
  const [tabFocusLosses, setTabFocusLosses] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  
  // Dialog submissions
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchExamTemplate = async () => {
      try {
        const res = await examService.getById(examId);
        setExam(res.data);
        setTimeLeft(res.data.duration * 60);
        // Initialize empty option keys
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

  // Security 1: Prevent page refreshes/unload accidental exits
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

  // Security 2: Monitor browser focus shifts
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabFocusLosses(prev => prev + 1);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 5000); // clear banner after 5s
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Timer tick tick down
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

  const handleJump = (idx) => {
    setCurrentIdx(idx);
  };

  // Central submit executor
  const performSubmission = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      // Clear safety listener
      window.onbeforeunload = null;

      const formattedAnswers = answers.map(a => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption !== null ? Number(a.selectedOption) : -1 // -1 = blank
      }));

      const res = await attemptService.submitAttempt(
        examId,
        formattedAnswers,
        tabFocusLosses,
        startedAt
      );

      setConfirmOpen(false);
      // Route student directly to their attempt results page
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
    console.log('Timer expired. Auto-submitting assessment responses.');
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
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="bg-white border border-secondary-200 rounded-xl max-w-md w-full p-8 space-y-5 shadow-lg">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100 mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg text-secondary-800">Exam Error</h3>
          <p className="text-sm text-secondary-500">{error}</p>
          <Button onClick={() => navigate('/student/dashboard')} variant="primary" className="w-full">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = exam.resolvedQuestions[currentIdx];
  const selectedAns = answers.find(a => a.questionId === currentQ.id)?.selectedOption;
  const isUnanswered = selectedAns === null;

  // Timer color states
  const timeLow = timeLeft < 120; // 2 mins
  const timeUrgent = timeLeft < 30; // 30 secs

  const unansweredCount = answers.filter(a => a.selectedOption === null).length;

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      
      {/* Proctor Fullscreen Header */}
      <header className="h-16 bg-white border-b border-secondary-200 px-6 sticky top-0 z-50 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold shadow-sm shadow-primary-500/10">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="font-semibold text-sm sm:text-base text-secondary-800 truncate max-w-[150px] sm:max-w-md leading-none">
              {exam.title}
            </h1>
            <span className="text-[10px] text-secondary-400 font-semibold uppercase tracking-wider block mt-1">
              Assessment Proctoring Session
            </span>
          </div>
        </div>

        {/* Security Incident counts */}
        {tabFocusLosses > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-xs font-semibold">
            <ShieldAlert className="h-4 w-4" />
            <span>Incidents: {tabFocusLosses}</span>
          </div>
        )}

        {/* Timer Box */}
        <div className={`
          flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-xs sm:text-sm shadow-sm transition-all duration-200
          ${timeUrgent 
            ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
            : timeLow 
              ? 'bg-amber-50 border-amber-200 text-amber-600' 
              : 'bg-white border-secondary-300 text-secondary-800'}
        `}>
          <Clock className="h-4 w-4" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </header>

      {/* Proctor Banner warnings */}
      {showWarning && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-2.5 text-center text-xs text-amber-700 font-semibold animate-slide-up flex items-center justify-center gap-2 shrink-0">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>
            <strong>Warning:</strong> Browser focus changes detected. Tab switching logs warnings. Proctor Incident #{tabFocusLosses} registered.
          </span>
        </div>
      )}

      {/* Main Workspace grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left: Taker panel */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-between">
          <div className="max-w-2xl w-full mx-auto space-y-6">
            
            {/* Card wrapper */}
            <div className="bg-white border border-secondary-200 rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-secondary-100 pb-3">
                <span className="px-2.5 py-1 rounded bg-primary-50 border border-primary-100 text-primary-750 font-bold text-xs">
                  Question {currentIdx + 1} of {exam.resolvedQuestions.length}
                </span>
                <span className="text-xs text-secondary-400 font-semibold">{currentQ.marks} points</span>
              </div>

              {/* Question prompting */}
              <h2 className="font-semibold text-base sm:text-lg text-secondary-800 leading-relaxed">
                {currentQ.text}
              </h2>

              {/* Option cards */}
              <div className="space-y-3 pt-2 select-none">
                {currentQ.options.map((opt, idx) => {
                  const label = String.fromCharCode(65 + idx); // A, B, C, D
                  const isSelected = selectedAns === idx;

                  return (
                    <div 
                      key={idx}
                      onClick={() => handleSelectOption(currentQ.id, idx)}
                      className={`
                        cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all duration-150
                        ${isSelected 
                          ? 'border-primary-500 bg-primary-50/20 text-secondary-850' 
                          : 'border-secondary-200 bg-white text-secondary-500 hover:border-secondary-300 hover:bg-secondary-50/20'}
                      `}
                    >
                      <span className={`
                        h-7 w-7 rounded-lg border text-xs font-bold flex items-center justify-center shrink-0 transition-colors
                        ${isSelected 
                          ? 'bg-primary-600 border-primary-700 text-white' 
                          : 'bg-secondary-50 border-secondary-200 text-secondary-400'}
                      `}>
                        {label}
                      </span>
                      <span className="text-sm font-medium leading-snug">{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prev / Next controls */}
            <div className="flex items-center justify-between select-none">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                icon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous Question
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNext}
                disabled={currentIdx === exam.resolvedQuestions.length - 1}
                className="flex-row-reverse"
                icon={<ChevronRight className="h-4 w-4" />}
              >
                Next Question
              </Button>
            </div>

          </div>
        </div>

        {/* Right: Side proctored status & Nav list */}
        <aside className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-secondary-200 p-6 flex flex-col shrink-0 space-y-6">
          <div className="select-none">
            <h4 className="font-semibold text-secondary-700 text-xs uppercase tracking-wider mb-4">Question Sheets</h4>
            
            {/* Grid */}
            <div className="grid grid-cols-5 gap-2">
              {exam.resolvedQuestions.map((q, idx) => {
                const isSelected = answers.find(a => a.questionId === q.id)?.selectedOption !== null;
                const isActive = currentIdx === idx;

                let style = 'bg-secondary-50 border-secondary-200 text-secondary-500 hover:border-secondary-300';
                if (isActive) {
                  style = 'bg-primary-50 border-primary-500 text-primary-750 font-bold';
                } else if (isSelected) {
                  style = 'bg-primary-600 text-white border-primary-700';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJump(idx)}
                    className={`
                      h-9 w-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all
                      ${style}
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-secondary-200 flex-1 flex flex-col justify-between">
            <div className="space-y-4 select-none">
              <h4 className="font-semibold text-secondary-755 text-xs uppercase tracking-wider">Exam Guidelines</h4>
              
              <ul className="text-xs text-secondary-500 space-y-2.5 font-medium leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary-400 mt-1.5 shrink-0"></span>
                  <span>Avoid switching tabs. Screen updates log focus warnings to the database.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary-400 mt-1.5 shrink-0"></span>
                  <span>Quizzes submit automatically on clock countdown expiration.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary-400 mt-1.5 shrink-0"></span>
                  <span>Check your entries using the navigator panel above.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 border-t border-secondary-200">
              <Button
                variant="success" // emerald submit
                size="md"
                onClick={handleManualSubmitClick}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3"
                icon={<Send className="h-4.5 w-4.5" />}
              >
                Submit Exam Sheet
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Manual Submit Confirmation */}
      <ConfirmDialog 
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={performSubmission}
        title="Submit Examination"
        message={
          unansweredCount > 0
            ? `You have left ${unansweredCount} questions unanswered. Are you sure you want to finalize and submit?`
            : 'Are you sure you want to finalize and submit your answers sheet?'
        }
        confirmText="Yes, Submit Exam"
        type="warning" // warning emerald gate
        loading={submitting}
      />
    </div>
  );
};

export default ExamTaking;
