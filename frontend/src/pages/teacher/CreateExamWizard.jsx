import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { questionService } from '../../services/questionService';
import { subjectService } from '../../services/subjectService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import { ArrowLeft, BookOpen, CheckCircle2, Plus, Save, Send, ShieldAlert, Trash2 } from 'lucide-react';

const emptyQuestion = () => ({
  text: '',
  options: ['', '', '', ''],
  correctOption: '0',
  marks: '1',
  difficulty: 'Medium'
});

const CreateExamWizard = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [newQuestions, setNewQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    duration: '30',
    passPercentage: '50',
    visibility: 'PRIVATE',
    accessPassword: ''
  });

  useEffect(() => {
    let active = true;
    Promise.all([subjectService.getAll(), questionService.getAll()])
      .then(([subjectResponse, questionResponse]) => {
        if (!active) return;
        setSubjects(subjectResponse.data);
        setQuestions(questionResponse.data);
        setForm((current) => ({ ...current, subjectId: subjectResponse.data[0]?.id || '' }));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Failed to load exam builder data.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const subjectQuestions = useMemo(
    () => questions.filter(question => question.subjectId === form.subjectId),
    [form.subjectId, questions]
  );

  const totalPoints = useMemo(() => (
    Object.values(selectedQuestions).reduce((sum, point) => sum + Number(point), 0)
      + newQuestions.reduce((sum, question) => sum + Number(question.marks || 0), 0)
  ), [newQuestions, selectedQuestions]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const changeSubject = (subjectId) => {
    setForm((current) => ({ ...current, subjectId }));
    setSelectedQuestions({});
  };

  const toggleExistingQuestion = (question) => {
    setSelectedQuestions((current) => {
      const next = { ...current };
      if (Object.hasOwn(next, question.id)) delete next[question.id];
      else next[question.id] = question.marks;
      return next;
    });
  };

  const updateNewQuestion = (index, field, value) => {
    setNewQuestions((current) => current.map((question, questionIndex) => (
      questionIndex === index ? { ...question, [field]: value } : question
    )));
  };

  const updateNewOption = (questionIndex, optionIndex, value) => {
    setNewQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex) return question;
      const options = [...question.options];
      options[optionIndex] = value;
      return { ...question, options };
    }));
  };

  const validate = () => {
    if (!form.subjectId) return 'You have not been assigned to teach any subject.';
    if (!form.title.trim()) return 'Exam title is required.';
    if (Number(form.duration) <= 0) return 'Duration must be greater than 0.';
    if (Object.keys(selectedQuestions).length + newQuestions.length === 0) return 'Add at least one existing or new question.';
    for (const [index, question] of newQuestions.entries()) {
      if (!question.text.trim() || question.options.some(option => !option.trim())) {
        return `New question ${index + 1} requires a prompt and all four options.`;
      }
      if (Number(question.marks) <= 0) return `New question ${index + 1} point must be greater than 0.`;
    }
    return '';
  };

  const saveExam = async (publish) => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');
      setSuccess('');
      setSaving(true);
      await examService.createBulk({
        ...form,
        duration: Number(form.duration),
        passPercentage: Number(form.passPercentage),
        publish,
        existingQuestions: Object.entries(selectedQuestions).map(([questionId, point]) => ({
          questionId: Number(questionId),
          point: Number(point)
        })),
        newQuestions: newQuestions.map(question => ({
          ...question,
          correctOption: Number(question.correctOption),
          marks: Number(question.marks)
        }))
      });
      setSuccess(publish ? 'Exam and questions published successfully.' : 'Exam draft and questions saved successfully.');
      setTimeout(() => navigate('/teacher/exams'), 900);
    } catch (requestError) {
      setError(requestError.message || 'Failed to create exam.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Preparing exam builder..." />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          to="/teacher/exams"
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-secondary-200 text-secondary-500 hover:text-secondary-900"
          aria-label="Back to exams"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="h1 mb-1">Create Examination</h1>
          <p className="p">Build an exam, reuse question-bank items, and create multiple new questions in one transaction.</p>
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

      {subjects.length === 0 ? (
        <Card>
          <div className="py-10 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-secondary-300 mx-auto" />
            <h3 className="font-bold text-secondary-900">No teaching subject assigned</h3>
            <p className="text-sm text-secondary-500">An administrator must assign a teaching subject before you can create an exam.</p>
          </div>
        </Card>
      ) : (
        <>
          <Card title="1. Exam Configuration" subtitle="Access rules and assessment settings">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Exam Title"
                  value={form.title}
                  onChange={(event) => updateForm('title', event.target.value)}
                  required
                />
                <Select
                  label="Assigned Subject"
                  value={form.subjectId}
                  onChange={(event) => changeSubject(event.target.value)}
                  options={subjects.map(subject => ({
                    value: subject.id,
                    label: `${subject.code} - ${subject.name}${subject.assignmentNote ? ` (${subject.assignmentNote})` : ''}`
                  }))}
                />
              </div>
              <Textarea
                label="Instructions for Students"
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Duration (Minutes)"
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={(event) => updateForm('duration', event.target.value)}
                />
                <Input
                  label="Pass Threshold (%)"
                  type="number"
                  min={0}
                  max={100}
                  value={form.passPercentage}
                  onChange={(event) => updateForm('passPercentage', event.target.value)}
                />
                <Select
                  label="Visibility"
                  value={form.visibility}
                  onChange={(event) => updateForm('visibility', event.target.value)}
                  options={[
                    { value: 'PRIVATE', label: 'Private' },
                    { value: 'PUBLIC', label: 'Public' }
                  ]}
                />
                <Input
                  label="Access Password"
                  type="password"
                  value={form.accessPassword}
                  onChange={(event) => updateForm('accessPassword', event.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </Card>

          <Card
            title="2. Select Existing Questions"
            subtitle={`${Object.keys(selectedQuestions).length} selected from your question bank`}
          >
            {subjectQuestions.length === 0 ? (
              <p className="text-sm text-secondary-500 py-6 text-center">No existing questions are available for this subject.</p>
            ) : (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
                {subjectQuestions.map((question) => {
                  const selected = Object.hasOwn(selectedQuestions, question.id);
                  return (
                    <div
                      key={question.id}
                      className={`rounded-xl border p-4 transition-colors ${selected ? 'border-primary-300 bg-primary-50/30' : 'border-secondary-200'}`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleExistingQuestion(question)}
                          className="mt-1 h-4 w-4 rounded border-secondary-300 text-primary-600"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-secondary-900">{question.text}</p>
                          <Badge variant="slate" className="mt-2">{question.difficulty}</Badge>
                        </div>
                        {selected && (
                          <input
                            type="number"
                            min={0.1}
                            step={0.1}
                            value={selectedQuestions[question.id]}
                            onChange={(event) => setSelectedQuestions((current) => ({
                              ...current,
                              [question.id]: event.target.value
                            }))}
                            className="saas-input w-24"
                            aria-label={`Points for ${question.text}`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card
            title="3. Create New Questions With Exam"
            subtitle={`${newQuestions.length} new question${newQuestions.length === 1 ? '' : 's'} will also be saved to your bank`}
          >
            <div className="space-y-5">
              {newQuestions.map((question, questionIndex) => (
                <div key={questionIndex} className="rounded-2xl border border-secondary-200 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-secondary-900">New Question {questionIndex + 1}</h4>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setNewQuestions((current) => current.filter((_, index) => index !== questionIndex))}
                      icon={<Trash2 className="h-4 w-4" />}
                      aria-label={`Remove new question ${questionIndex + 1}`}
                    />
                  </div>
                  <Input
                    label="Question Prompt"
                    value={question.text}
                    onChange={(event) => updateNewQuestion(questionIndex, 'text', event.target.value)}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {question.options.map((option, optionIndex) => (
                      <Input
                        key={optionIndex}
                        label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                        value={option}
                        onChange={(event) => updateNewOption(questionIndex, optionIndex, event.target.value)}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      label="Correct Choice"
                      value={question.correctOption}
                      onChange={(event) => updateNewQuestion(questionIndex, 'correctOption', event.target.value)}
                      options={[0, 1, 2, 3].map(index => ({
                        value: String(index),
                        label: `Option ${String.fromCharCode(65 + index)}`
                      }))}
                    />
                    <Input
                      label="Exam Points"
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={question.marks}
                      onChange={(event) => updateNewQuestion(questionIndex, 'marks', event.target.value)}
                    />
                    <Select
                      label="Difficulty"
                      value={question.difficulty}
                      onChange={(event) => updateNewQuestion(questionIndex, 'difficulty', event.target.value)}
                      options={['Easy', 'Medium', 'Hard'].map(value => ({ value, label: value }))}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() => setNewQuestions((current) => [...current, emptyQuestion()])}
                icon={<Plus className="h-4 w-4" />}
              >
                Create New Question In This Exam
              </Button>
            </div>
          </Card>

          <div className="sticky bottom-4 bg-white/95 backdrop-blur border border-secondary-200 rounded-2xl shadow-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-secondary-600">
              <strong>{Object.keys(selectedQuestions).length + newQuestions.length}</strong> questions,
              {' '}<strong>{totalPoints}</strong> total points
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                loading={saving}
                onClick={() => saveExam(false)}
                icon={<Save className="h-4 w-4" />}
              >
                Save Draft
              </Button>
              <Button
                loading={saving}
                onClick={() => saveExam(true)}
                icon={<Send className="h-4 w-4" />}
              >
                Publish Exam
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateExamWizard;
