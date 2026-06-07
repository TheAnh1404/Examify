import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import { subjectService } from '../../services/subjectService';
import { questionService } from '../../services/questionService';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldAlert, 
  ChevronRight, 
  ChevronLeft, 
  Save,
  Settings,
  ListPlus,
  Info,
  BookOpen
} from 'lucide-react';

const CreateExamWizard = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1); // 1 = Info, 2 = Questions

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState('15');
  const [passPercentage, setPassPercentage] = useState('50');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

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

  const subjectQuestions = useMemo(() => {
    return questions.filter(q => q.subjectId === subjectId);
  }, [questions, subjectId]);

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
    window.scrollTo(0, 0);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(1);
    window.scrollTo(0, 0);
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
        questions: selectedQuestionIds,
        status: 'Published'
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

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Preparing exam creator wizard..." />
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/teacher/exams" 
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-secondary-200 text-secondary-500 hover:text-secondary-900 hover:border-secondary-300 transition-all shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="h1 mb-1">Create Examination</h1>
            <p className="p">Setup a new proctored assessment for your students.</p>
          </div>
        </div>

        {/* Wizard Stepper */}
        <div className="flex items-center gap-2 bg-white border border-secondary-100 rounded-2xl px-4 py-2 shadow-sm">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${step === 1 ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600'}`}>1</div>
          <div className="h-px w-6 bg-secondary-100"></div>
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${step === 2 ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-400'}`}>2</div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-sm font-semibold">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-50 border border-accent-100 text-accent-700 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Step 1: Config settings */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card title="Basic Information" icon={Settings}>
              <div className="space-y-6">
                <Input 
                  label="Exam Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Computer Science 101: Midterm Quiz"
                  required
                />

                <Textarea 
                  label="Instructions for Students"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide clear directions, rules, or references for the test takers..."
                  rows={6}
                />

                <Select 
                  label="Subject Category"
                  value={subjectId}
                  onChange={(e) => { setSubjectId(e.target.value); setSelectedQuestionIds([]); }}
                  options={subjects.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input 
                    label="Duration (Minutes)"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                    min={1}
                    required
                  />
                  <Input 
                    label="Passing Threshold (%)"
                    type="number"
                    value={passPercentage}
                    onChange={(e) => setPassPercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                    min={0}
                    max={100}
                    required
                  />
                </div>

                <div className="pt-6 border-t border-secondary-100 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleNextStep}
                    className="px-8 shadow-lg shadow-primary-500/20"
                    icon={<ChevronRight className="h-5 w-5" />}
                    iconRight
                  >
                    Select Questions
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Wizard Tips" icon={Info} className="bg-secondary-50 border-none">
              <div className="space-y-4">
                <p className="text-xs text-secondary-600 leading-relaxed font-medium">
                  <strong>Title:</strong> Choose a descriptive name that students can easily identify.
                </p>
                <p className="text-xs text-secondary-600 leading-relaxed font-medium">
                  <strong>Duration:</strong> The test will automatically submit once this time expires.
                </p>
                <p className="text-xs text-secondary-600 leading-relaxed font-medium">
                  <strong>Pass %:</strong> Students who score above this threshold will receive a 'PASS' status.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Check questions */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card title="Select Questions" icon={ListPlus} bodyClassName="p-0">
              {subjectQuestions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-secondary-50 text-secondary-300 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h4 className="text-secondary-900 font-bold mb-1">No questions found</h4>
                  <p className="text-secondary-500 text-sm mb-6">There are no questions in this subject pool. Please add questions first.</p>
                  <Button variant="outline" onClick={() => navigate('/teacher/questions/create')}>
                    Go to Question Bank
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-secondary-100">
                  <div className="max-h-[60vh] overflow-y-auto">
                    {subjectQuestions.map((q) => {
                      const isChecked = selectedQuestionIds.includes(q.id);
                      return (
                        <div 
                          key={q.id}
                          onClick={() => handleToggleQuestion(q.id)}
                          className={`
                            p-6 flex items-start gap-4 cursor-pointer transition-all border-l-4
                            ${isChecked 
                              ? 'border-primary-500 bg-primary-50/20' 
                              : 'border-transparent hover:bg-secondary-50/50'}
                          `}
                        >
                          <div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-secondary-200'}`}>
                            {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-secondary-900 leading-relaxed mb-2">{q.text}</p>
                            <div className="flex items-center gap-3">
                              <Badge variant={q.difficulty?.toLowerCase() === 'easy' ? 'success' : q.difficulty?.toLowerCase() === 'medium' ? 'warning' : 'danger'} dot size="sm">
                                {q.difficulty}
                              </Badge>
                              <span className="text-xs font-bold text-secondary-400">{q.marks} Points</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-6 bg-secondary-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      disabled={saveLoading}
                      icon={<ChevronLeft className="h-5 w-5" />}
                    >
                      Back to Settings
                    </Button>
                    
                    <Button
                      onClick={handleSubmit}
                      variant="primary"
                      loading={saveLoading}
                      className="px-10 shadow-lg shadow-primary-500/25"
                      icon={<Save className="h-5 w-5" />}
                    >
                      Publish Examination
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Exam Summary" className="sticky top-24">
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-secondary-50 border border-secondary-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-secondary-500 uppercase tracking-widest">Questions</span>
                    <span className="text-lg font-bold text-secondary-900">{selectedQuestionIds.length}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-secondary-200">
                    <span className="text-xs font-bold text-secondary-500 uppercase tracking-widest">Total Marks</span>
                    <span className="text-lg font-bold text-primary-600">{totalMarks} pts</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-secondary-400">
                    <CheckCircle2 className="h-4 w-4 text-accent-500" />
                    <span>Auto-proctoring enabled</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-secondary-400">
                    <CheckCircle2 className="h-4 w-4 text-accent-500" />
                    <span>Instant result generation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-secondary-400">
                    <CheckCircle2 className="h-4 w-4 text-accent-500" />
                    <span>Shuffle questions mode</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExamWizard;
