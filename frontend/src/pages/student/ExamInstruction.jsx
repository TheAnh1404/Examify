import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { ArrowLeft, Play, ShieldAlert, CheckCircle } from 'lucide-react';

const ExamInstruction = () => {
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
        setError('Failed to fetch exam guidelines.');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  if (loading) return <Loading message="Loading guidelines..." />;

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
        <ShieldAlert className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto select-none">
      <div className="flex items-center gap-3 shrink-0">
        <Link 
          to="/student/exams" 
          className="p-2 rounded-lg bg-white border border-secondary-300 hover:bg-secondary-50 text-secondary-500 hover:text-secondary-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <PageHeader 
            title="Exam Instructions" 
            subtitle={`Preparing for: "${exam.title}"`}
          />
        </div>
      </div>

      <Card title="Assessment Rules & Procedures" subtitle="Review policies before initiating test countdown">
        <div className="space-y-6">
          
          <div className="space-y-2">
            <h4 className="font-semibold text-secondary-800 text-sm">Exam Parameters</h4>
            <div className="grid grid-cols-3 gap-4 text-center bg-secondary-50 border border-secondary-200 rounded-lg p-3">
              <div>
                <span className="text-[10px] text-secondary-400 uppercase font-semibold block">Time Limit</span>
                <span className="text-sm font-bold text-secondary-800">{exam.duration} minutes</span>
              </div>
              <div>
                <span className="text-[10px] text-secondary-400 uppercase font-semibold block">Total Marks</span>
                <span className="text-sm font-bold text-secondary-800">{exam.totalMarks} points</span>
              </div>
              <div>
                <span className="text-[10px] text-secondary-400 uppercase font-semibold block">Questions</span>
                <span className="text-sm font-bold text-secondary-800">{exam.resolvedQuestions.length} Qs</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-secondary-800 text-sm">Security & Integrity Policies</h4>
            <ul className="text-xs text-secondary-500 space-y-3 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-accent-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Visual Proctoring:</strong> The platform will monitor browser tab switches. Navigating away from the active exam screen logs warnings and increments proctor counts.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-accent-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Expiration:</strong> A countdown clock runs in the upper header. The instant time reaches `00:00`, current answers submit automatically.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-accent-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Submission rules:</strong> Ensure you complete all selections. Unsaved entries will register as zero marks. You can review submissions immediately post-testing.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-5 border-t border-secondary-200">
            <Button
              variant="primary"
              onClick={() => navigate(`/student/exams/${exam.id}/take`)}
              className="w-full flex items-center justify-center gap-2 py-3 font-semibold shadow-md hover:shadow-primary-500/10"
              icon={<Play className="h-4.5 w-4.5" />}
            >
              Start Proctoring & Take Exam
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExamInstruction;
