import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { attemptService } from '../../services/attemptService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { authService } from '../../services/authService';
import { BookOpen, Play, CheckCircle } from 'lucide-react';

const AvailableExams = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { id: 'usr-student' };

  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, attemptsRes] = await Promise.all([
          examService.getAll(),
          attemptService.getByStudent(user.id)
        ]);
        setExams(examsRes.data);
        setAttempts(attemptsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  if (loading) return <Loading message="Loading available assessments..." />;

  const completedExamIds = attempts.map(a => a.examId);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Assessment Catalog" 
        subtitle="Browse and start published subject examinations."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        {exams.map((exam) => {
          const isTaken = completedExamIds.includes(exam.id);
          const studentAttempt = attempts.find(a => a.examId === exam.id);

          return (
            <Card 
              key={exam.id}
              title={exam.title}
              subtitle={`${exam.subjectCode} - ${exam.subjectName}`}
              hoverable
              footer={
                isTaken ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-1 text-xs font-semibold text-accent-700">
                      <CheckCircle className="h-4.5 w-4.5 text-accent-600" />
                      Completed
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/student/results/${studentAttempt.id}`)}
                    >
                      Review Score
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end w-full">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/student/exams/${exam.id}/instruction`)}
                      icon={<Play className="h-3.5 w-3.5" />}
                    >
                      View Directions
                    </Button>
                  </div>
                )
              }
            >
              <div className="space-y-4">
                <p className="text-xs text-secondary-500 font-medium leading-relaxed line-clamp-2">
                  {exam.description || 'No exam guidelines defined.'}
                </p>
                
                <div className="grid grid-cols-3 gap-3 text-center bg-secondary-50 border border-secondary-200 rounded-lg p-2.5">
                  <div>
                    <span className="text-[9px] text-secondary-400 uppercase font-semibold block">Time</span>
                    <span className="text-xs font-bold text-secondary-800">{exam.duration} mins</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-secondary-400 uppercase font-semibold block">Marks</span>
                    <span className="text-xs font-bold text-secondary-800">{exam.totalMarks} pts</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-secondary-400 uppercase font-semibold block">Passing score</span>
                    <span className="text-xs font-bold text-secondary-800">{exam.passPercentage}%</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AvailableExams;
