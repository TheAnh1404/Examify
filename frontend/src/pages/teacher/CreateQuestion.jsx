import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import { subjectService } from '../../services/subjectService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { ArrowLeft, Save, ShieldAlert, CheckCircle } from 'lucide-react';

const CreateQuestion = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    subjectId: '',
    text: '',
    options: ['', '', '', ''],
    correctOption: '0',
    marks: '5',
    difficulty: 'Medium'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectService.getAll();
        setSubjects(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, subjectId: res.data[0].id }));
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch subjects categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (idx, value) => {
    const updated = [...formData.options];
    updated[idx] = value;
    setFormData(prev => ({ ...prev, options: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Valids
    if (!formData.subjectId) {
      setError('Please categorize this question under a subject.');
      return;
    }
    if (!formData.text.trim()) {
      setError('Please input the question prompt text.');
      return;
    }
    for (let i = 0; i < 4; i++) {
      if (!formData.options[i].trim()) {
        setError(`Please fill in Option ${String.fromCharCode(65 + i)} text.`);
        return;
      }
    }

    try {
      setSaveLoading(true);
      const res = await questionService.create({
        ...formData,
        correctOption: Number(formData.correctOption),
        marks: Number(formData.marks)
      });
      setSuccess('Question prompt saved to Question Bank catalog.');
      
      setTimeout(() => {
        navigate('/teacher/questions');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to save question.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <Loading message="Loading subjects data..." />;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 shrink-0">
        <Link 
          to="/teacher/questions" 
          className="p-2 rounded-lg bg-white border border-secondary-300 hover:bg-secondary-50 text-secondary-500 hover:text-secondary-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <PageHeader 
            title="Create Question Prompt" 
            subtitle="Build a multiple-choice question and options key inside the shared bank."
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

      <Card title="Question Parameters" subtitle="Fill in questionnaire fields to publish">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select 
            label="Subject Category"
            name="subjectId"
            value={formData.subjectId}
            onChange={handleInputChange}
            options={subjects.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` }))}
            required
          />

          <Input 
            label="Question Prompt"
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            placeholder="e.g. Which React Hook caches calculated values?"
            required
          />

          {/* Options grid */}
          <div className="space-y-3">
            <label className="saas-label mb-1">Option Choices</label>
            {formData.options.map((opt, idx) => {
              const label = String.fromCharCode(65 + idx); // A, B, C, D
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded bg-secondary-100 text-xs font-bold text-secondary-505 flex items-center justify-center shrink-0 border border-secondary-200 select-none">
                    {label}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Choice Option ${label}`}
                    className="saas-input"
                    required
                  />
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select 
              label="Correct Choice"
              name="correctOption"
              value={formData.correctOption}
              onChange={handleInputChange}
              options={[
                { value: '0', label: 'Option A' },
                { value: '1', label: 'Option B' },
                { value: '2', label: 'Option C' },
                { value: '3', label: 'Option D' }
              ]}
              required
            />
            
            <Input 
              label="Weight (Points)"
              name="marks"
              type="number"
              value={formData.marks}
              onChange={handleInputChange}
              min={1}
              required
            />

            <Select 
              label="Difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              options={[
                { value: 'Easy', label: 'Easy' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Hard', label: 'Hard' }
              ]}
              required
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-secondary-200">
            <Button
              variant="secondary"
              onClick={() => navigate('/teacher/questions')}
              className="flex-1"
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saveLoading}
              className="flex-1"
              icon={<Save className="h-4.5 w-4.5" />}
            >
              Save Question
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateQuestion;
