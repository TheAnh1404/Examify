import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { attemptService } from '../../services/attemptService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { authService } from '../../services/authService';
import { BookOpen, Play, CheckCircle2, Clock, Award, Filter, Search } from 'lucide-react';
import SearchBox from '../../components/common/SearchBox';

const AvailableExams = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { id: 'usr-student' };

  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Loading available assessments..." />
    </div>
  );

  const completedExamIds = attempts.map(a => a.examId);
  
  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.subjectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="h1 mb-1">Assessment Catalog</h1>
          <p className="p">Browse and start published subject examinations.</p>
        </div>
        <SearchBox 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search assessments..." 
        />
      </div>

      {filteredExams.length === 0 ? (
        <div className="saas-card bg-white border-dashed border-2 p-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-secondary-50 text-secondary-300 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h4 className="text-secondary-900 font-bold mb-1">No assessments found</h4>
          <p className="text-secondary-500 text-sm">We couldn't find any exams matching your current criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const isTaken = completedExamIds.includes(exam.id);
            const studentAttempt = attempts.find(a => a.examId === exam.id);

            return (
              <Card 
                key={exam.id}
                hover
                title={exam.title}
                subtitle={exam.subjectName}
                className="h-full flex flex-col"
                bodyClassName="flex-1 flex flex-col"
                footer={
                  isTaken ? (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => navigate(`/student/results/${studentAttempt.id}`)}
                      icon={<Award className="h-4 w-4" />}
                    >
                      View Graded Result
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => navigate(`/student/exams/${exam.id}/instruction`)}
                      icon={<Play className="h-4 w-4" />}
                      className="shadow-lg shadow-primary-500/20"
                    >
                      View Directions
                    </Button>
                  )
                }
              >
                <div className="space-y-6 flex-1">
                  <p className="text-sm text-secondary-500 font-medium leading-relaxed line-clamp-2">
                    {exam.description || 'Standard proctored multiple-choice assessment for the selected subject category.'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-secondary-50 border border-secondary-100 rounded-xl">
                      <div className="flex items-center gap-1.5 text-secondary-400 mb-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Duration</span>
                      </div>
                      <span className="text-sm font-bold text-secondary-900">{exam.duration}m</span>
                    </div>
                    <div className="p-3 bg-secondary-50 border border-secondary-100 rounded-xl">
                      <div className="flex items-center gap-1.5 text-secondary-400 mb-1">
                        <Award className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Weight</span>
                      </div>
                      <span className="text-sm font-bold text-secondary-900">{exam.totalMarks}pt</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Badge variant={isTaken ? 'success' : 'primary'} dot>
                      {isTaken ? 'Attempted' : 'Available'}
                    </Badge>
                    <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">
                      ID: {exam.id.slice(-6)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableExams;
