import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptService } from '../../services/attemptService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import { ArrowLeft, AlertTriangle, ShieldAlert } from 'lucide-react';

const AttemptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await attemptService.getById(id);
        setDetails(res.data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải chi tiết kết quả.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <Loading message="Đang tải bài làm đã chấm..." />;

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
        <ShieldAlert className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  const { attempt, student, exam } = details;
  const scorePct = exam.totalMarks > 0 ? (attempt.score / exam.totalMarks) * 100 : 0;
  const isPass = attempt.status.toUpperCase() === 'PASS';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate(-1)} // back to list
          className="p-2 rounded-lg bg-white border border-secondary-300 hover:bg-secondary-50 text-secondary-500 hover:text-secondary-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <PageHeader 
            title="Chi tiết bài làm"
            subtitle={`Đang xem phiếu điểm của: ${student?.name || 'Học sinh không xác định'}`}
          />
        </div>
      </div>

      {/* Stats Summary Banner */}
      <div className="bg-white border border-secondary-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden select-none">
        <div className="space-y-2.5 z-10 text-center md:text-left">
          <span className="text-xs font-semibold text-secondary-400 uppercase tracking-widest block">{exam.title}</span>
          <h3 className="font-display font-extrabold text-3xl text-secondary-800 tracking-tight">
            {attempt.score} <span className="text-secondary-400 text-base font-normal">/ {exam.totalMarks} điểm</span>
          </h3>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1.5 text-xs text-secondary-500 font-medium">
            <span>Điểm {scorePct.toFixed(0)}%</span>
            <span>-</span>
            <span>{attempt.totalCorrect} / {exam.questions.length} câu đúng</span>
            <span>-</span>
            <span>Ngưỡng đạt: {exam.passPercentage}%</span>
          </div>
        </div>

        <div className="z-10 text-center shrink-0">
          <Badge variant={isPass ? 'success' : 'danger'} className="text-xs px-3.5 py-1 font-bold">
            {isPass ? 'Đạt' : 'Chưa đạt'}
          </Badge>
        </div>
      </div>

      {/* Proctoring Warnings */}
      {attempt.tabFocusLosses > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 text-xs animate-slide-up leading-relaxed">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-700">Có cảnh báo giám sát</p>
            <p className="text-secondary-500 mt-0.5">
              Trình duyệt ghi nhận <strong className="text-amber-700">{attempt.tabFocusLosses} lần</strong> học sinh rời khỏi cửa sổ làm bài đang hoạt động.
            </p>
          </div>
        </div>
      )}

      {/* Question Graded details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-secondary-800 border-b border-secondary-200 pb-2.5">Đáp án và phản hồi</h3>
        
        {exam.questions.map((q, idx) => {
          const studentAnsObj = attempt.answers.find(a => a.questionId === q.id);
          const studentSelection = studentAnsObj ? studentAnsObj.selectedOption : -1;
          const isCorrect = studentSelection === q.correctOption;

          return (
            <Card 
              key={q.id}
              title={`Câu hỏi ${idx + 1}`}
              actions={
                <span className={`text-xs font-bold ${isCorrect ? 'text-accent-600' : 'text-red-600'}`}>
                  {isCorrect ? `+${q.marks} điểm` : `0 / ${q.marks} điểm`}
                </span>
              }
            >
              <div className="space-y-4">
                <p className="font-semibold text-secondary-800 text-sm leading-snug">{q.text}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 select-none">
                  {q.options.map((option, optIdx) => {
                    const isSelected = studentSelection === optIdx;
                    const isAnswerKey = q.correctOption === optIdx;

                    let style = 'bg-white text-secondary-500 border-secondary-200';
                    if (isSelected && isCorrect) {
                      style = 'bg-accent-50/25 text-accent-700 border-accent font-semibold';
                    } else if (isSelected && !isCorrect) {
                      style = 'bg-red-50/20 text-red-700 border-red-400 font-semibold';
                    } else if (isAnswerKey) {
                      style = 'bg-accent-50/10 text-accent-600 border-accent/40 border-dashed';
                    }

                    return (
                      <div 
                        key={optIdx} 
                        className={`px-4 py-2.5 rounded-xl border text-xs flex justify-between items-center ${style}`}
                      >
                        <span>{String.fromCharCode(65 + optIdx)}. {option}</span>
                        {isSelected && <span className="text-[9px] uppercase tracking-wide font-bold">{isCorrect ? 'Đúng' : 'Học sinh chọn'}</span>}
                        {!isSelected && isAnswerKey && <span className="text-[9px] uppercase tracking-wide font-bold text-accent-600">Đáp án đúng</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AttemptDetail;
