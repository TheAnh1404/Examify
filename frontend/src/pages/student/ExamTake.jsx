import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  GraduationCap,
  ShieldAlert
} from 'lucide-react';

const ExamTake = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Test states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of { questionId, selectedOption }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [startedAt] = useState(new Date().toISOString());
  const [tabFocusLosses, setTabFocusLosses] = useState(0);
  const [showFocusWarning, setShowFocusWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Exam template (answers are stripped by backend for students)
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await API.get(`/exams/${examId}`);
        setExam(res.data);
        setTimeLeft(res.data.duration * 60);
        // Initialize blank responses
        const initialAnswers = res.data.questions.map(q => ({
          questionId: q.id,
          selectedOption: null
        }));
        setAnswers(initialAnswers);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load exam. It might not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  // Security 1: Prevent accidental browser refresh/nav away
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Warning: leaving this page will submit your exam with current answers.';
      return e.returnValue;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Security 2: Monitor Tab switches (Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabFocusLosses(prev => prev + 1);
        setShowFocusWarning(true);
        // Automatically hide the warning banner after 6 seconds
        setTimeout(() => {
          setShowFocusWarning(false);
        }, 6000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Countdown timer clock
  useEffect(() => {
    if (timeLeft <= 0 && exam) {
      // Time is up! Trigger auto-submit
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, exam]);

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers(prev => prev.map(ans => 
      ans.questionId === questionId 
        ? { ...ans, selectedOption: optionIndex } 
        : ans
    ));
  };

  const handleNext = () => {
    if (currentIdx < exam.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentIdx(index);
  };

  // Submit test answers to server
  const submitExamPayload = async (isAuto = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Strip out beforeunload block
      window.onbeforeunload = null;

      // Filter answers where option is selected. (If null, keep it to record blank response)
      const formattedAnswers = answers.map(a => ({
        questionId: a.questionId,
        selectedOption: a.selectedOption !== null ? Number(a.selectedOption) : -1
      }));

      const res = await API.post(`/submissions/${examId}/submit`, {
        answers: formattedAnswers,
        tabFocusLosses,
        startedAt
      });

      // Redirect student to review their submission details
      navigate(`/student/history/${res.data.submission.id}`);
    } catch (err) {
      console.error(err);
      alert('An error occurred during submission. We will try again.');
      setSubmitting(false);
    }
  };

  const handleManualSubmit = () => {
    const unansweredCount = answers.filter(a => a.selectedOption === null).length;
    let message = 'Are you sure you want to submit your exam responses?';
    if (unansweredCount > 0) {
      message = `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`;
    }

    if (window.confirm(message)) {
      submitExamPayload(false);
    }
  };

  const handleAutoSubmit = () => {
    console.log('Time expired. Auto-submitting responses.');
    submitExamPayload(true);
  };

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-4 border-brand-500/25 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm font-semibold tracking-wide">Assembling Exam Workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-panel max-w-md w-full p-8 flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-5">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="font-semibold text-lg text-slate-200 mb-2">Failed to Start Exam</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/student')} className="glow-button w-full">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentIdx];
  const selectedAns = answers.find(a => a.questionId === currentQuestion.id)?.selectedOption;
  
  // Style flags for timer colors
  const isTimeLow = timeLeft < 120; // < 2 mins
  const isTimeCritical = timeLeft < 30; // < 30 secs

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Immersive Header */}
      <header className="bg-dark-900 border-b border-dark-800 h-16 shrink-0 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-200 text-sm md:text-base tracking-wide max-w-[200px] md:max-w-md truncate">
              {exam.title}
            </h1>
            <p className="text-[10px] text-slate-500 capitalize">Student Examination Workspace</p>
          </div>
        </div>

        {/* Security Warning Log counter (SaaS indicator) */}
        {tabFocusLosses > 0 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-semibold">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Proctoring Alert: {tabFocusLosses} Incidents</span>
          </div>
        )}

        {/* Floating Timer */}
        <div className={`
          flex items-center gap-2.5 px-4 py-2 rounded-xl border font-mono font-bold text-sm transition-all duration-300
          ${isTimeCritical 
            ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' 
            : isTimeLow 
              ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
              : 'bg-dark-800 border-dark-700 text-slate-200'}
        `}>
          <Clock className={`h-4.5 w-4.5 ${isTimeCritical ? 'animate-spin' : ''}`} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Focus Security Warning Alert Banner */}
      {showFocusWarning && (
        <div className="bg-amber-500/15 border-b border-amber-500/25 px-6 py-2.5 text-center flex items-center justify-center gap-2 text-amber-400 text-xs font-medium animate-slide-up shrink-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>Warning:</strong> Browser focus change detected! Do not leave the exam tab. Your browser focus loss has been logged ({tabFocusLosses} incidents).
          </span>
        </div>
      )}

      {/* Main Workspace grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left pane: Question taking */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-between">
          <div className="max-w-2xl mx-auto w-full space-y-6">
            
            {/* Question card */}
            <div className="glass-panel p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <span className="px-3 py-1 bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-semibold rounded-lg">
                  Question {currentIdx + 1} of {exam.questions.length}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{currentQuestion.marks} points</span>
              </div>

              {/* Question Text */}
              <h3 className="text-base md:text-lg font-medium text-slate-100 leading-relaxed">
                {currentQuestion.text}
              </h3>

              {/* Options lists */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((option, idx) => {
                  const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
                  const isChecked = selectedAns === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(currentQuestion.id, idx)}
                      className={`
                        cursor-pointer border rounded-xl p-4 flex items-center gap-4 transition-all duration-200 select-none
                        ${isChecked
                          ? 'border-brand-500 bg-brand-500/5 text-slate-200'
                          : 'border-dark-750 bg-dark-900/40 text-slate-400 hover:border-dark-700 hover:bg-dark-800/40'}
                      `}
                    >
                      {/* Stylized custom indicator */}
                      <span className={`
                        h-7 w-7 rounded-lg border flex items-center justify-center text-xs font-semibold tracking-wide shrink-0 transition-colors
                        ${isChecked 
                          ? 'bg-brand-500 border-brand-600 text-white' 
                          : 'bg-dark-800 border-dark-750 text-slate-400'}
                      `}>
                        {optionLabel}
                      </span>
                      <span className="text-sm md:text-base leading-snug">{option}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="secondary-button flex items-center gap-2 text-sm disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
                Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIdx === exam.questions.length - 1}
                className="secondary-button flex items-center gap-2 text-sm disabled:opacity-40 disabled:pointer-events-none"
              >
                Next
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right pane: Side proctor dashboard & Navigation Grid */}
        <aside className="w-full md:w-80 bg-dark-900 border-t md:border-t-0 md:border-l border-dark-800 flex flex-col shrink-0 p-6 space-y-6">
          <div>
            <h4 className="font-semibold text-slate-300 text-sm mb-4">Question Sheets</h4>
            <div className="grid grid-cols-5 gap-2.5">
              {exam.questions.map((q, idx) => {
                const isSelected = answers.find(a => a.questionId === q.id)?.selectedOption !== null;
                const isActive = currentIdx === idx;

                let style = 'bg-dark-950 text-slate-500 border-dark-800 hover:border-dark-700';
                if (isActive) {
                  style = 'bg-brand-500/10 border-brand-500 text-brand-400 font-bold';
                } else if (isSelected) {
                  style = 'bg-brand-600 text-white border-brand-700';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`
                      h-10 w-10 rounded-lg border flex items-center justify-center text-xs font-semibold transition-all duration-150
                      ${style}
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-dark-800/80 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-300 text-sm">Testing Guidelines</h4>
              <ul className="text-xs text-slate-500 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0 mt-1.5"></span>
                  <span>Do not leave or minimize the window. Focus lost triggers proctor alerts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0 mt-1.5"></span>
                  <span>The exam will automatically submit when the countdown reaches 00:00.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0 mt-1.5"></span>
                  <span>Double-check your choices using the navigation grids above.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={handleManualSubmit}
                disabled={submitting}
                className="glow-button w-full flex items-center justify-center gap-2 py-3 shadow-md hover:shadow-brand-500/15"
              >
                {submitting ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                ) : (
                  <>
                    <Send className="h-4.5 w-4.5" />
                    Submit Examination
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ExamTake;
