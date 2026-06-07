import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { ArrowLeft, Edit, ShieldAlert, CheckCircle2 } from 'lucide-react';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await questionService.getById(id);
        setQuestion(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load question details.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  if (loading) return <Loading message="Retrieving question prompt..." />;

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
        <ShieldAlert className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  const getDifficultyVariant = (diff) => {
    const d = diff.toLowerCase();
    if (d === 'easy') return 'success';
    if (d === 'medium') return 'warning';
    return 'danger';
  };

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
            title="Question Prompt Details" 
            subtitle={`Reviewing details for ID: ${id}`}
            actions={
              <Button
                variant="primary"
                onClick={() => navigate(`/teacher/questions/${id}/edit`)}
                icon={<Edit className="h-4 w-4" />}
                size="sm"
              >
                Edit Prompt
              </Button>
            }
          />
        </div>
      </div>

      <Card title="Question Preview" subtitle={`${question.subjectCode} - ${question.subjectName}`}>
        <div className="space-y-6">
          {/* Question Text */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-secondary-400 uppercase tracking-widest">Question prompt text</span>
            <p className="text-base font-semibold text-secondary-800 leading-relaxed">{question.text}</p>
          </div>

          {/* Options Review */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-secondary-400 uppercase tracking-widest block mb-1">Option Choices</span>
            {question.options.map((option, idx) => {
              const label = String.fromCharCode(65 + idx); // A, B, C, D
              const isCorrect = question.correctOption === idx;

              return (
                <div 
                  key={idx}
                  className={`
                    flex items-center gap-3.5 p-3 rounded-xl border transition-all select-none
                    ${isCorrect 
                      ? 'border-accent bg-accent-50/30 text-secondary-800 font-semibold' 
                      : 'border-secondary-200 text-secondary-500'}
                  `}
                >
                  <span className={`
                    h-7 w-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 transition-colors
                    ${isCorrect 
                      ? 'bg-accent border-accent-600 text-white' 
                      : 'bg-secondary-50 border-secondary-200 text-secondary-400'}
                  `}>
                    {label}
                  </span>
                  
                  <span className="text-sm flex-1">{option}</span>
                  
                  {isCorrect && (
                    <span className="flex items-center gap-1 text-[10px] text-accent-700 bg-accent-100/40 rounded px-1.5 py-0.5 border border-accent-200 uppercase font-bold tracking-wider">
                      <CheckCircle2 className="h-3 w-3" />
                      Correct Key
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Metas */}
          <div className="pt-4 border-t border-secondary-200 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-secondary-450 uppercase font-semibold block">Weight Allocation</span>
              <span className="text-sm font-bold text-secondary-800">{question.marks} points</span>
            </div>
            <div>
              <span className="text-[10px] text-secondary-450 uppercase font-semibold block">Difficulty Rank</span>
              <Badge variant={getDifficultyVariant(question.difficulty)} className="mt-0.5">{question.difficulty}</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuestionDetail;
