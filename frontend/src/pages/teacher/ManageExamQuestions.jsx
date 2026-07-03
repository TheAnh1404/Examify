import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import { questionService } from '../../services/questionService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { ArrowLeft, Plus, Minus, ShieldAlert, CheckCircle } from 'lucide-react';
import { formatDifficulty } from '../../utils/i18n';

const ManageExamQuestions = () => {
  const { id: examId } = useParams();
  const [exam, setExam] = useState(null);
  const [subjectQuestions, setSubjectQuestions] = useState([]); // Questions in bank for this subject
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let active = true;
    examService.getById(examId)
      .then(async (examResponse) => {
        const questionResponse = await questionService.getBySubject(examResponse.data.subjectId);
        if (!active) return;
        setExam(examResponse.data);
        setSubjectQuestions(questionResponse.data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError('Không thể tải màn hình quản lý câu hỏi bài thi.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [examId]);

  const handleAddQuestion = async (question) => {
    try {
      setError('');
      setSuccess('');
      setActionLoading(true);
      await examService.addQuestionToExam(examId, question.id, question.marks);
      // Refresh exam details
      const examRes = await examService.getById(examId);
      setExam(examRes.data);
      setSuccess('Đã thêm câu hỏi vào bài thi.');
    } catch (err) {
      setError(err.message || 'Không thể thêm câu hỏi.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveQuestion = async (qId) => {
    try {
      setError('');
      setSuccess('');
      setActionLoading(true);
      await examService.removeQuestionFromExam(examId, qId);
      // Refresh exam details
      const examRes = await examService.getById(examId);
      setExam(examRes.data);
      setSuccess('Đã xóa câu hỏi khỏi bài thi.');
    } catch (err) {
      setError(err.message || 'Không thể xóa câu hỏi.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading message="Đang tải ngân hàng câu hỏi..." />;

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
        <ShieldAlert className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  // Split subject bank questions into inside vs outside exam
  const insideExam = exam.resolvedQuestions;
  const outsideExam = subjectQuestions.filter(q => !exam.questions.includes(q.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0">
        <Link 
          to={`/teacher/exams/${examId}`} 
          className="p-2 rounded-lg bg-white border border-secondary-300 hover:bg-secondary-50 text-secondary-500 hover:text-secondary-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <PageHeader 
            title="Quản lý câu hỏi bài thi"
            subtitle={`Đang chỉnh sửa đề thi: "${exam.title}" (${exam.subjectCode})`}
            actions={
              <div className="text-xs font-semibold text-secondary-500">
                Điểm: <strong className="text-primary-600">{exam.totalMarks}</strong> | Câu hỏi: <strong className="text-accent-600">{exam.questions.length}</strong>
              </div>
            }
          />
        </div>
      </div>

      {/* Action Messages */}
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

      {/* Split panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start select-none">
        
        {/* Inside Exam Pane */}
        <Card title="Câu hỏi trong bài thi" subtitle={`Tổng số: ${insideExam.length} câu`}>
          {insideExam.length === 0 ? (
            <p className="text-xs text-secondary-400 font-medium text-center py-8">
              Chưa có câu hỏi nào trong bài thi. Hãy dùng bảng bên phải để thêm câu hỏi.
            </p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {insideExam.map((q, idx) => (
                <div key={q.id} className="p-3 border border-secondary-200 bg-white rounded-lg flex items-start gap-3 justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-secondary-400">Câu {idx + 1} ({q.marks} điểm)</p>
                    <p className="text-xs font-semibold text-secondary-800 truncate mt-0.5">{q.text}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    className="p-1"
                    disabled={actionLoading}
                    onClick={() => handleRemoveQuestion(q.id)}
                    icon={<Minus className="h-3.5 w-3.5" />}
                    title="Xóa câu hỏi"
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Bank Pane */}
        <Card title="Câu hỏi có sẵn theo môn" subtitle={`Ngân hàng môn học: ${outsideExam.length} câu`}>
          {outsideExam.length === 0 ? (
            <p className="text-xs text-secondary-400 font-medium text-center py-8">
              Không còn câu hỏi nào khác trong môn học này. Tất cả câu hỏi đã được liên kết hoặc ngân hàng đang trống.
            </p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {outsideExam.map((q) => (
                <div key={q.id} className="p-3 border border-secondary-200 bg-white rounded-lg flex items-start gap-3 justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-secondary-400">{formatDifficulty(q.difficulty)} - {q.marks} điểm</p>
                    <p className="text-xs font-semibold text-secondary-800 truncate mt-0.5">{q.text}</p>
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    className="p-1"
                    disabled={actionLoading}
                    onClick={() => handleAddQuestion(q)}
                    icon={<Plus className="h-3.5 w-3.5" />}
                    title="Thêm câu hỏi"
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ManageExamQuestions;
