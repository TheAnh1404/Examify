import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { ArrowLeft, FolderLock, ShieldAlert, Clock, Award, BookOpen, ListChecks } from 'lucide-react';

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
        setError('Không thể tải thông tin bài thi.');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Đang tải thông tin bài thi..." />
    </div>
  );

  if (error || !exam) {
    return (
      <div className="p-8 rounded-2xl bg-danger-50 border border-danger-100 text-danger-700 flex flex-col items-center gap-4 text-center animate-fade-in">
        <ShieldAlert className="h-10 w-10 shrink-0" />
        <div>
          <h4 className="text-lg font-bold">Lỗi truy cập</h4>
          <p className="font-medium text-sm mt-1">{error || 'Không tìm thấy thông tin bài thi.'}</p>
        </div>
        <Button onClick={() => navigate('/teacher/exams')} size="md" variant="primary" className="mt-2">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

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
            <h1 className="h1 mb-1">Xem trước bài thi</h1>
            <p className="p">Đang xem cấu trúc của {exam.title}</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate(`/teacher/exams/${id}/questions`)}
          icon={<FolderLock className="h-4 w-4" />}
          className="shadow-lg shadow-primary-500/20"
        >
          Quản lý câu hỏi
        </Button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card title="Cấu hình bài thi" icon={BookOpen}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-secondary-50 border border-secondary-100 rounded-2xl">
                  <div className="flex items-center gap-2 text-secondary-400 mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Thời gian</span>
                  </div>
                  <span className="text-sm font-bold text-secondary-900">{exam.duration} phút</span>
                </div>
                <div className="p-4 bg-secondary-50 border border-secondary-100 rounded-2xl">
                  <div className="flex items-center gap-2 text-secondary-400 mb-1">
                    <Award className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Điểm</span>
                  </div>
                  <span className="text-sm font-bold text-secondary-900">{exam.totalMarks} điểm</span>
                </div>
                <div className="p-4 bg-secondary-50 border border-secondary-100 rounded-2xl">
                  <div className="flex items-center gap-2 text-secondary-400 mb-1">
                    <ListChecks className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Điểm đạt</span>
                  </div>
                  <span className="text-sm font-bold text-secondary-900">{exam.passPercentage}%</span>
                </div>
                <div className="p-4 bg-secondary-50 border border-secondary-100 rounded-2xl">
                  <div className="flex items-center gap-2 text-secondary-400 mb-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Câu hỏi</span>
                  </div>
                  <span className="text-sm font-bold text-secondary-900">{exam.resolvedQuestions.length}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Hướng dẫn</h4>
                <p className="text-sm text-secondary-600 leading-relaxed font-medium bg-secondary-50/50 p-4 rounded-xl border border-secondary-100/50">
                  {exam.description || 'Chưa có hướng dẫn cho bài thi này.'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Thông tin môn học" className="bg-primary-600 border-none text-white">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-primary-200 uppercase tracking-widest block mb-1">Mã môn</span>
                <span className="text-lg font-bold">{exam.subjectCode}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary-200 uppercase tracking-widest block mb-1">Tên môn</span>
                <span className="text-lg font-bold">{exam.subjectName}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Questions Sheet */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-secondary-100 pb-4">
          <h3 className="text-lg font-bold text-secondary-900 tracking-tight">Đề thi</h3>
          <span className="text-xs font-bold text-secondary-400 uppercase tracking-widest">{exam.resolvedQuestions.length} câu hỏi</span>
        </div>
        
        {exam.resolvedQuestions.length === 0 ? (
          <div className="p-12 text-center saas-card bg-white border-dashed border-2">
            <div className="h-16 w-16 rounded-2xl bg-secondary-50 text-secondary-300 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h4 className="text-secondary-900 font-bold mb-1">Đề thi trống</h4>
            <p className="text-secondary-500 text-sm mb-6">Chưa có câu hỏi nào được liên kết vào đề thi này.</p>
            <Button variant="outline" onClick={() => navigate(`/teacher/exams/${id}/questions`)}>
              Thêm câu hỏi ngay
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {exam.resolvedQuestions.map((q, idx) => (
              <Card key={q.id} bodyClassName="p-6 sm:p-8 overflow-hidden">
                <div className="space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-xl bg-secondary-50 text-secondary-500 font-bold text-xs flex items-center justify-center shrink-0 border border-secondary-100">
                        {idx + 1}
                      </div>
                      <h4 className="font-bold text-secondary-900 leading-relaxed max-w-xl">
                        {q.text}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-secondary-400 uppercase tracking-widest bg-secondary-50 px-2 py-1 rounded-lg border border-secondary-100">
                      {q.marks} điểm
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = q.correctOption === oIdx;
                      return (
                        <div 
                          key={oIdx} 
                          className={`
                            px-4 py-3.5 rounded-xl border text-sm flex justify-between items-center transition-all
                            ${isCorrect 
                              ? 'border-accent-500 bg-accent-50/10 text-accent-700 font-bold' 
                              : 'border-secondary-100 text-secondary-500'}
                          `}
                        >
                          <span className="leading-snug">{String.fromCharCode(65 + oIdx)}. {opt}</span>
                          {isCorrect && (
                            <span className="text-[9px] font-bold text-white bg-accent-600 rounded-lg px-2 py-1 uppercase tracking-widest">
                              Đáp án
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDetail;
