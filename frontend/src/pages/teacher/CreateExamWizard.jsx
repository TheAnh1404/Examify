import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import { subjectService } from '../../services/subjectService';
import { questionService } from '../../services/questionService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { ArrowLeft, CheckCircle, ShieldAlert, BookOpen, ChevronRight, ChevronLeft, Save } from 'lucide-react';

const CreateExamWizard = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]); // Questions in bank
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [step, setStep] = useState(1); // 1 = Settings, 2 = Questions

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState('15');
  const [passPercentage, setPassPercentage] = useState('50');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]); // Checkbox selection

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [subjRes, questRes] = await Promise.all([
          subjectService.getAll(),
          questionService.getAll()
        ]);
        setSubjects(subjRes.data);
        setQuestions(questRes.data);
        if (subjRes.data.length > 0) {
          setSubjectId(subjRes.data[0].id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load subject metadata.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  // Filter questions by selected subject
  const subjectQuestions = useMemo(() => {
    return questions.filter(q => q.subjectId === subjectId);
  }, [questions, subjectId]);

  // Calculate total marks based on checked questions
  const totalMarks = useMemo(() => {
    return subjectQuestions
      .filter(q => selectedQuestionIds.includes(q.id))
      .reduce((sum, q) => sum + q.marks, 0);
  }, [subjectQuestions, selectedQuestionIds]);

  const handleToggleQuestion = (id) => {
    setSelectedQuestionIds(prev => 
      prev.includes(id) 
        ? prev.filter(qId => qId !== id) 
        : [...prev, id]
    );
  };

  const handleNextStep = () => {
    if (!title.trim()) {
      setError('Please input the exam title.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      setError('Please select at least one question for this exam.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setSaveLoading(true);

      const payload = {
        title,
        description,
        subjectId,
        duration: Number(duration),
        passPercentage: Number(passPercentage),
        totalMarks,
        questions: selectedQuestionIds, // IDs list
        status: 'Published' // default publish
      };

      await examService.create(payload);
      setSuccess('Examination published successfully!');
      
      setTimeout(() => {
        navigate('/teacher/exams');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to publish exam.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <Loading message="Preparing exam creator wizard..." />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 shrink-0">
        <Link 
          to="/teacher/exams" 
          className="p-2 rounded-lg bg-white border border-secondary-300 hover:bg-secondary-50 text-secondary-500 hover:text-secondary-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <PageHeader 
            title="Create Examination" 
            subtitle="Follow the step-by-step setup to publish a new student test."
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-slide-up">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-accent-50 border border-accent-100 text-accent-700 text-sm animate-slide-up">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Step Navigator Bar */}
      <div className="grid grid-cols-2 gap-4 border-b border-secondary-200 pb-2 select-none shrink-0">
        <div className={`text-center pb-2 border-b-2 text-sm font-semibold transition-all ${step === 1 ? 'border-primary-600 text-primary-600' : 'border-transparent text-secondary-400'}`}>
          Step 1: Configurations
        </div>
        <div className={`text-center pb-2 border-b-2 text-sm font-semibold transition-all ${step === 2 ? 'border-primary-600 text-primary-600' : 'border-transparent text-secondary-400'}`}>
          Step 2: Add Questions
        </div>
      </div>

      {/* Step 1: Config settings */}
      {step === 1 && (
        <Card title="Exam Settings" subtitle="Configure basic exam details and timers">
          <div className="space-y-4">
            <Input 
              label="Exam Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science Term 1 Final Quiz"
              required
            />

            <Textarea 
              label="Instructions / Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide directions, rules, or references..."
            />

            <Select 
              label="Subject Category"
              value={subjectId}
              onChange={(e) => { setSubjectId(e.target.value); setSelectedQuestionIds([]); }} // reset selections when subject swaps
              options={subjects.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Duration (minutes)"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                min={1}
                required
              />
              <Input 
                label="Passing score threshold (%)"
                type="number"
                value={passPercentage}
                onChange={(e) => setPassPercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                min={0}
                max={100}
                required
              />
            </div>

            <div className="pt-4 border-t border-secondary-200 flex justify-end">
              <Button
                variant="primary"
                onClick={handleNextStep}
                className="w-full sm:w-auto"
                icon={<ChevronRight className="h-4.5 w-4.5" />}
              >
                Next Step
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Check questions */}
      {step === 2 && (
        <Card 
          title="Add Question Prompts" 
          subtitle={`Available questions under selected subject. Checked questions sum into total exam marks.`}
          actions={
            <div className="text-xs font-semibold text-secondary-500">
              Selected: <strong className="text-primary-600">{selectedQuestionIds.length}</strong> | Total Marks: <strong className="text-accent-600">{totalMarks} pts</strong>
            </div>
          }
        >
          {subjectQuestions.length === 0 ? (
            <div className="space-y-4">
              <EmptyState 
                title="No questions in subject category"
                description="There are no questions in this subject pool. Please create questions in the Question Bank first."
              />
              <div className="flex justify-between items-center pt-4 border-t border-secondary-200">
                <Button variant="secondary" onClick={handlePrevStep} icon={<ChevronLeft className="h-4 w-4" />}>Back</Button>
                <Link to="/teacher/questions/create" className="btn-primary">Add Question to Bank</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Checklist list */}
              <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-2">
                {subjectQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q.id);
                  return (
                    <div 
                      key={q.id}
                      onClick={() => handleToggleQuestion(q.id)}
                      className={`
                        p-4 border rounded-xl flex items-start gap-4 cursor-pointer select-none transition-all duration-150
                        ${isChecked 
                          ? 'border-primary-500 bg-primary-50/10' 
                          : 'border-secondary-200 hover:border-secondary-300 bg-white'}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div click
                        className="h-4.5 w-4.5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 mt-0.5 shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-secondary-800 leading-snug">{q.text}</p>
                        
                        {/* Options preview */}
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-secondary-400">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="truncate">
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 text-right space-y-1">
                        <Badge variant={q.difficulty === 'Easy' ? 'success' : q.difficulty === 'Medium' ? 'warning' : 'danger'}>
                          {q.difficulty}
                        </Badge>
                        <span className="block text-xs font-bold text-secondary-505">{q.marks} pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-secondary-200">
                <Button
                  variant="secondary"
                  onClick={handlePrevStep}
                  disabled={saveLoading}
                  icon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous Settings
                </Button>
                
                <Button
                  type="submit"
                  variant="success" // emerald confirmation
                  loading={saveLoading}
                  icon={<Save className="h-4.5 w-4.5" />}
                >
                  Publish & Save Exam
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}
    </div>
  );
};

export default CreateExamWizard;
