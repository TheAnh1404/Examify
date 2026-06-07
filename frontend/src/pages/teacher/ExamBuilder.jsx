import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import { Plus, Trash2, ArrowLeft, AlertCircle, Save, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const ExamBuilder = () => {
  const { id } = useParams(); // exists if in edit mode
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(15);
  const [passPercentage, setPassPercentage] = useState(50);
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correctOption: 0, marks: 10 }
  ]);

  // UI state
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(0); // keep first question expanded

  useEffect(() => {
    if (isEditMode) {
      const fetchExam = async () => {
        try {
          const res = await API.get(`/exams/${id}`);
          const exam = res.data;
          setTitle(exam.title);
          setDescription(exam.description || '');
          setDuration(exam.duration);
          setPassPercentage(exam.passPercentage);
          setQuestions(exam.questions.map(q => ({
            id: q.id,
            text: q.text,
            options: q.options,
            correctOption: q.correctOption,
            marks: q.marks
          })));
        } catch (err) {
          setError('Failed to load exam details for editing.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchExam();
    }
  }, [id, isEditMode]);

  // Compute total marks dynamically
  const calculatedTotalMarks = useMemo(() => {
    return questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  }, [questions]);

  const handleAddQuestion = () => {
    const newQuestion = {
      text: '',
      options: ['', '', '', ''],
      correctOption: 0,
      marks: 10
    };
    setQuestions([...questions, newQuestion]);
    setExpandedIndex(questions.length); // expand new question
  };

  const handleDeleteQuestion = (index) => {
    if (questions.length === 1) {
      setError('An exam must have at least one question.');
      return;
    }
    const updated = questions.filter((_, idx) => idx !== index);
    setQuestions(updated);
    // Adjust expansion index if necessary
    setExpandedIndex(Math.max(0, index - 1));
  };

  const handleQuestionTextChange = (index, value) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectOptionChange = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].correctOption = Number(oIndex);
    setQuestions(updated);
  };

  const handleMarksChange = (index, value) => {
    const updated = [...questions];
    updated[index].marks = Number(value) || 0;
    setQuestions(updated);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Field validations
    if (!title.trim()) {
      setError('Exam title is required.');
      return;
    }

    if (duration <= 0) {
      setError('Duration must be greater than 0 minutes.');
      return;
    }

    // Question validations
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} has empty text.`);
        setExpandedIndex(i);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Question ${i + 1} option ${String.fromCharCode(65 + j)} is empty.`);
          setExpandedIndex(i);
          return;
        }
      }
      if (q.marks <= 0) {
        setError(`Question ${i + 1} must be worth at least 1 point.`);
        setExpandedIndex(i);
        return;
      }
    }

    const payload = {
      title,
      description,
      duration: Number(duration),
      passPercentage: Number(passPercentage),
      totalMarks: calculatedTotalMarks,
      questions
    };

    try {
      if (isEditMode) {
        await API.put(`/exams/${id}`, payload);
        setSuccess('Exam updated successfully!');
      } else {
        await API.post('/exams', payload);
        setSuccess('Exam created successfully!');
      }

      // Redirect after brief delay
      setTimeout(() => {
        navigate('/teacher');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exam.');
    }
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
      {/* Header Bar */}
      <div className="flex items-center gap-4">
        <Link 
          to="/teacher" 
          className="p-2 rounded-lg bg-dark-900 border border-dark-800 hover:border-dark-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">
            {isEditMode ? 'Edit Examination' : 'Build Examination'}
          </h2>
          <p className="text-sm text-slate-400">Configure settings and design multiple-choice questions</p>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-slide-up">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left pane: Config */}
        <div className="glass-panel p-6 space-y-4 lg:sticky lg:top-6">
          <h3 className="font-semibold text-base text-slate-200 border-b border-dark-800 pb-2 mb-4">Exam Configuration</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Exam Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science Term 1 Final"
              className="glass-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions or topic coverage..."
              rows={3}
              className="glass-input resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Duration (mins)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                className="glass-input"
                min={1}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Passing Score (%)</label>
              <input
                type="number"
                value={passPercentage}
                onChange={(e) => setPassPercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="glass-input"
                min={0}
                max={100}
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-dark-800 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Marks:</span>
              <span className="font-semibold text-brand-400">{calculatedTotalMarks} pts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Questions count:</span>
              <span className="font-semibold text-slate-200">{questions.length}</span>
            </div>
          </div>

          <button
            type="submit"
            className="glow-button w-full flex items-center justify-center gap-2 mt-6"
          >
            <Save className="h-4.5 w-4.5" />
            {isEditMode ? 'Update Exam' : 'Publish Exam'}
          </button>
        </div>

        {/* Right pane: Question builder */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-dark-900/40 p-4 border border-dark-800 rounded-xl">
            <h3 className="font-semibold text-base text-slate-200">Exam Questions</h3>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="secondary-button flex items-center gap-2 text-xs py-1.5 px-3 border-brand-500/20 hover:border-brand-500/40"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIdx) => {
              const isExpanded = expandedIndex === qIdx;
              return (
                <div 
                  key={qIdx} 
                  className={`
                    border rounded-xl transition-all duration-300 bg-dark-900/40
                    ${isExpanded ? 'border-brand-500/30 shadow-md shadow-brand-500/5' : 'border-dark-800'}
                  `}
                >
                  {/* Question Header Accordion */}
                  <div 
                    onClick={() => toggleExpand(qIdx)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center text-xs font-semibold text-slate-400">
                        {qIdx + 1}
                      </span>
                      <span className="font-medium text-slate-200 truncate max-w-md">
                        {q.text || <span className="text-slate-500 italic">Empty Question Template</span>}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400">
                      <span className="text-xs">{q.marks} pts</span>
                      <div onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(qIdx); }} className="p-1 rounded hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* Question body editor */}
                  {isExpanded && (
                    <div className="p-5 border-t border-dark-800 bg-dark-900/20 space-y-4 animate-slide-up">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Question Prompt</label>
                        <input
                          type="text"
                          value={q.text}
                          onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                          placeholder="e.g. Which of the following is a key React architecture pattern?"
                          className="glass-input"
                          required
                        />
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Options & Correct Selection</label>
                        
                        {q.options.map((option, oIdx) => {
                          const optionLabel = String.fromCharCode(65 + oIdx); // A, B, C, D
                          return (
                            <div key={oIdx} className="flex items-center gap-3.5">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`correct-option-${qIdx}`}
                                  checked={q.correctOption === oIdx}
                                  onChange={() => handleCorrectOptionChange(qIdx, oIdx)}
                                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 bg-dark-900 border-dark-700"
                                />
                                <span className="text-sm font-semibold text-slate-400 w-4">{optionLabel}</span>
                              </label>
                              
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                placeholder={`Option ${optionLabel}`}
                                className={`
                                  glass-input
                                  ${q.correctOption === oIdx ? 'border-brand-500/50 bg-brand-500/5' : ''}
                                `}
                                required
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Weighting (Points):</label>
                          <input
                            type="number"
                            value={q.marks}
                            onChange={(e) => handleMarksChange(qIdx, e.target.value)}
                            className="w-20 bg-dark-950 border border-dark-700 rounded-lg px-2 py-1 text-slate-200 text-sm focus:outline-none focus:border-brand-500 text-center"
                            min={1}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExamBuilder;
