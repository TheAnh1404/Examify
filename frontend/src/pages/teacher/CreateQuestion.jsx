import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import { subjectService } from '../../services/subjectService';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { ArrowLeft, BookOpen, CheckCircle, Plus, Save, ShieldAlert, Trash2 } from 'lucide-react';

const emptyQuestion = () => ({
  text: '',
  options: ['', '', '', ''],
  correctOption: '0',
  marks: '1',
  difficulty: 'Medium'
});

const CreateQuestion = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    subjectService.getAll()
      .then((response) => {
        if (!active) return;
        setSubjects(response.data);
        setSubjectId(response.data[0]?.id || '');
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Failed to load assigned teaching subjects.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateQuestion = (index, field, value) => {
    setQuestions((current) => current.map((question, questionIndex) => (
      questionIndex === index ? { ...question, [field]: value } : question
    )));
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex) return question;
      const options = [...question.options];
      options[optionIndex] = value;
      return { ...question, options };
    }));
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index));
  };

  const validate = () => {
    if (!subjectId) return 'You have not been assigned to teach any subject.';
    for (const [index, question] of questions.entries()) {
      if (!question.text.trim()) return `Question ${index + 1} requires a prompt.`;
      if (question.options.some(option => !option.trim())) return `Question ${index + 1} requires all four options.`;
      if (Number(question.marks) <= 0) return `Question ${index + 1} point must be greater than 0.`;
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');
      setSuccess('');
      setSaveLoading(true);
      await questionService.createBulk(questions.map((question) => ({
        ...question,
        subjectId,
        correctOption: Number(question.correctOption),
        marks: Number(question.marks)
      })));
      setSuccess(`${questions.length} question${questions.length === 1 ? '' : 's'} created successfully.`);
      setTimeout(() => navigate('/teacher/questions'), 900);
    } catch (requestError) {
      setError(requestError.message || 'Failed to create questions.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <Loading message="Loading assigned teaching subjects..." />;

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Link
            to="/teacher/questions"
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-secondary-200 text-secondary-500 hover:text-secondary-900"
            aria-label="Back to question bank"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="h1 mb-1">Bulk Question Creator</h1>
            <p className="p">Create multiple questions for one assigned subject in a single transaction.</p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => setQuestions((current) => [...current, emptyQuestion()])}
          icon={<Plus className="h-4 w-4" />}
          disabled={!subjectId}
        >
          Add Question
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-sm font-semibold">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-50 border border-accent-100 text-accent-700 text-sm font-semibold">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {subjects.length === 0 ? (
        <Card>
          <div className="py-10 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-secondary-300 mx-auto" />
            <h3 className="font-bold text-secondary-900">No teaching subject assigned</h3>
            <p className="text-sm text-secondary-500">An administrator must assign at least one subject before you can create questions.</p>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card title="Question Set" subtitle={`${questions.length} question${questions.length === 1 ? '' : 's'} prepared`}>
            <Select
              label="Assigned Subject"
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              options={subjects.map(subject => ({
                value: subject.id,
                label: `${subject.code} - ${subject.name}${subject.assignmentNote ? ` (${subject.assignmentNote})` : ''}`
              }))}
              required
            />
          </Card>

          {questions.map((question, questionIndex) => (
            <Card
              key={questionIndex}
              title={`Question ${questionIndex + 1}`}
              subtitle={`${question.marks || 0} default point${Number(question.marks) === 1 ? '' : 's'}`}
            >
              <div className="space-y-5">
                <div className="flex justify-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeQuestion(questionIndex)}
                    disabled={questions.length === 1}
                    icon={<Trash2 className="h-4 w-4" />}
                  >
                    Remove
                  </Button>
                </div>

                <Input
                  label="Question Prompt"
                  value={question.text}
                  onChange={(event) => updateQuestion(questionIndex, 'text', event.target.value)}
                  placeholder="Enter the question prompt"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option, optionIndex) => (
                    <Input
                      key={optionIndex}
                      label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                      value={option}
                      onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                      required
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Correct Choice"
                    value={question.correctOption}
                    onChange={(event) => updateQuestion(questionIndex, 'correctOption', event.target.value)}
                    options={[0, 1, 2, 3].map(index => ({
                      value: String(index),
                      label: `Option ${String.fromCharCode(65 + index)}`
                    }))}
                  />
                  <Input
                    label="Default Points"
                    type="number"
                    min={0.1}
                    step={0.1}
                    value={question.marks}
                    onChange={(event) => updateQuestion(questionIndex, 'marks', event.target.value)}
                    required
                  />
                  <Select
                    label="Difficulty"
                    value={question.difficulty}
                    onChange={(event) => updateQuestion(questionIndex, 'difficulty', event.target.value)}
                    options={['Easy', 'Medium', 'Hard'].map(value => ({ value, label: value }))}
                  />
                </div>
              </div>
            </Card>
          ))}

          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <Button
              variant="secondary"
              onClick={() => setQuestions((current) => [...current, emptyQuestion()])}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Another Question
            </Button>
            <Button
              type="submit"
              loading={saveLoading}
              icon={<Save className="h-4 w-4" />}
              className="sm:min-w-52"
            >
              Save All Questions
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateQuestion;
