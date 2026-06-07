import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { ArrowLeft, Edit, FolderLock, ShieldAlert, CheckCircle2 } from 'lucide-react';

const ExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await examService.getById(id);
        setExam(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load exam details.');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  if (loading) return <Loading message="Loading exam parameters..." />;

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-55 border border-red-100 text-red-700 text-sm flex items-center gap-3">
        <ShieldAlert className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

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
            title="Exam Template Preview" 
            subtitle={`Reviewing details for ID: ${id}`}
            actions={
              <>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/teacher/exams/${id}/questions`)}
                  icon={<FolderLock className="h-4 w-4" />}
                  size="sm"
                >
                  Manage Questions
                </Button>
              </>
            }
          />
        </div>
      </div>

      {/* Settings Grid */}
      <Card title="Exam Settings Summary" subtitle={`${exam.subjectCode} - ${exam.subjectName}`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 select-none">
          <div className="p-3 bg-secondary-50 border border-secondary-100 rounded-lg">
            <span className="text-[10px] text-secondary-400 uppercase font-semibold block">Duration</span>
            <span className="text-sm font-bold text-secondary-800">{exam.duration} minutes</span>
          </div>
          <div className="p-3 bg-secondary-50 border border-secondary-100 rounded-lg">
            <span className="text-[10px] text-secondary-400 uppercase font-semibold block">Weighting</span>
            <span className="text-sm font-bold text-secondary-800">{exam.totalMarks} points</span>
          </div>
          <div className="p-3 bg-secondary-50 border border-secondary-100 rounded-lg">
            <span className="text-[10px] text-secondary-400 uppercase font-semibold block">Passing Threshold</span>
            <span className="text-sm font-bold text-secondary-800">{exam.passPercentage}%</span>
          </div>
          <div className="p-3 bg-secondary-50 border border-secondary-100 rounded-lg">
            <span className="text-[10px] text-secondary-400 uppercase font-semibold block">Questions</span>
            <span className="text-sm font-bold text-secondary-800">{exam.resolvedQuestions.length} Qs</span>
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <span className="text-xs font-semibold text-secondary-400 uppercase tracking-widest block">Instructions Description</span>
          <p className="text-sm text-secondary-600 leading-relaxed font-medium">{exam.description || 'No instructions provided.'}</p>
        </div>
      </Card>

      {/* Questions Sheet */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-secondary-800 border-b border-secondary-200 pb-2">Questions Sheet</h3>
        
        {exam.resolvedQuestions.length === 0 ? (
          <EmptyState 
            title="Exam is empty"
            description="There are no questions added to this exam template. Please link questions."
            actionText="Link Questions"
            onAction={() => navigate(`/teacher/exams/${id}/questions`)}
          />
        ) : (
          exam.resolvedQuestions.map((q, idx) => (
            <Card 
              key={q.id} 
              title={`Question ${idx + 1}`} 
              actions={<span className="text-xs font-bold text-secondary-500">{q.marks} pts</span>}
            >
              <div className="space-y-4">
                <p className="font-semibold text-secondary-800 text-sm leading-snug">{q.text}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 select-none">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = q.correctOption === oIdx;
                    return (
                      <div 
                        key={oIdx} 
                        className={`
                          p-3 rounded-lg border text-xs flex justify-between items-center
                          ${isCorrect 
                            ? 'border-accent bg-accent-50/20 text-secondary-800 font-semibold' 
                            : 'border-secondary-200 text-secondary-450'}
                        `}
                      >
                        <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                        {isCorrect && (
                          <span className="text-[8px] font-bold text-accent-700 bg-accent-100 rounded px-1 uppercase tracking-wider">
                            Answer Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ExamDetail;
