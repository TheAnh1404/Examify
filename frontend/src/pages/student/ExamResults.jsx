import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Award, CheckCircle, ShieldAlert, ArrowLeft, AlertTriangle, AlertCircle } from 'lucide-react';

const ExamResults = () => {
  const { id: submissionId } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/submissions/${submissionId}`);
        setDetails(res.data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải kết quả bài nộp.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 border-4 border-brand-500/25 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
        <ShieldAlert className="h-6 w-6" />
        <p>{error}</p>
      </div>
    );
  }

  const { submission, exam } = details;
  const percentage = exam.totalMarks > 0 ? (submission.score / exam.totalMarks) * 150 : 0; // simple score visual length
  const scorePct = exam.totalMarks > 0 ? (submission.score / exam.totalMarks) * 100 : 0;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Back button */}
      <div className="flex items-center gap-4 shrink-0">
        <Link 
          to="/student" 
          className="p-2 rounded-lg bg-dark-900 border border-dark-800 hover:border-dark-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100">Kết quả đã chấm</h2>
          <p className="text-sm text-slate-400">Xem điểm số và đáp án đúng</p>
        </div>
      </div>

      {/* Performance Summary Banner */}
      <div className="glass-panel p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Visual Glow */}
        <div className={`absolute top-0 right-0 h-48 w-48 rounded-full blur-[100px] pointer-events-none opacity-20
          ${submission.status === 'pass' ? 'bg-emerald-500' : 'bg-red-500'}
        `}></div>

        <div className="space-y-3 relative z-10 text-center md:text-left">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{exam.title}</p>
          <h3 className="font-display font-extrabold text-3xl text-slate-100">
            {submission.score} <span className="text-slate-500 text-base font-normal">/ {exam.totalMarks} điểm</span>
          </h3>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-xs">
            <span className="text-slate-400 font-semibold">Điểm {scorePct.toFixed(0)}%</span>
            <span>-</span>
            <span className="text-slate-400">{submission.totalCorrect} / {exam.questions.length} câu đúng</span>
            <span>-</span>
            <span className="text-slate-500">Ngưỡng đạt: {exam.passPercentage}%</span>
          </div>
        </div>

        <div className="relative z-10 shrink-0 text-center">
          {submission.status === 'pass' ? (
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/5 mb-3">
                <CheckCircle className="h-9 w-9" />
              </div>
              <span className="px-3.5 py-1 text-sm font-bold uppercase tracking-wider rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                Đạt
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/5 mb-3">
                <AlertCircle className="h-9 w-9" />
              </div>
              <span className="px-3.5 py-1 text-sm font-bold uppercase tracking-wider rounded-full bg-red-500/15 border border-red-500/25 text-red-400">
                Chưa đạt
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Security Incident Banner */}
      {submission.tabFocusLosses > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs leading-relaxed animate-slide-up">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-400">Đã ghi nhận cảnh báo giám sát</p>
            <p className="mt-0.5 text-slate-400">
              Hệ thống ghi nhận <strong className="text-amber-500">{submission.tabFocusLosses} lần</strong> trình duyệt mất tập trung. Nhật ký này được lưu cùng bài làm và hiển thị cho giáo viên.
            </p>
          </div>
        </div>
      )}

      {/* Answer Key Grid */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-slate-200 border-b border-dark-800 pb-2.5">Xem lại đáp án</h3>
        
        {exam.questions.map((q, idx) => {
          const studentSelection = submission.answers.find(a => a.questionId === q.id)?.selectedOption;
          const isCorrect = studentSelection === q.correctOption;

          return (
            <div key={q.id} className="glass-card p-5 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded bg-dark-900 border border-dark-800 text-xs font-bold text-slate-400 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm md:text-base font-semibold text-slate-200 leading-snug">{q.text}</h4>
                </div>
                <span className={`text-xs font-bold shrink-0 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isCorrect ? `+${q.marks} điểm` : `0 / ${q.marks} điểm`}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {q.options.map((option, optIdx) => {
                  const isSelected = studentSelection === optIdx;
                  const isAnswerKey = q.correctOption === optIdx;

                  let style = 'bg-dark-900/40 text-slate-400 border-dark-800';
                  if (isSelected && isCorrect) {
                    style = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    style = 'bg-red-500/10 text-red-300 border-red-500/40 font-semibold';
                  } else if (isAnswerKey) {
                    style = 'bg-emerald-500/5 text-emerald-400/80 border-emerald-500/20 border-dashed';
                  }

                  return (
                    <div 
                      key={optIdx} 
                      className={`px-4 py-2.5 rounded-xl border text-xs flex justify-between items-center ${style}`}
                    >
                      <span>{String.fromCharCode(65 + optIdx)}. {option}</span>
                      {isSelected && <span className="text-[9px] uppercase tracking-wide font-bold">{isCorrect ? 'Đúng' : 'Chọn sai'}</span>}
                      {!isSelected && isAnswerKey && <span className="text-[9px] uppercase tracking-wide font-bold text-emerald-500/80">Đáp án đúng</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamResults;
