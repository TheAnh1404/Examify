import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import { questionService } from '../../services/questionService';
import { subjectService } from '../../services/subjectService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import { ArrowLeft, BookOpen, CheckCircle2, Plus, Save, Send, ShieldAlert, Trash2 } from 'lucide-react';
import { formatDifficulty, formatStatus } from '../../utils/i18n';

const emptyQuestion = () => ({
  text: '',
  options: ['', '', '', ''],
  correctOption: '0',
  marks: '1',
  difficulty: 'Medium'
});

const CreateExamWizard = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [newQuestions, setNewQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    duration: '30',
    passPercentage: '50',
    visibility: 'PRIVATE',
    accessPassword: ''
  });

  useEffect(() => {
    let active = true;
    Promise.all([subjectService.getAll(), questionService.getAll()])
      .then(([subjectResponse, questionResponse]) => {
        if (!active) return;
        setSubjects(subjectResponse.data);
        setQuestions(questionResponse.data);
        setForm((current) => ({ ...current, subjectId: subjectResponse.data[0]?.id || '' }));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Không thể tải dữ liệu tạo bài thi.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const subjectQuestions = useMemo(
    () => questions.filter(question => question.subjectId === form.subjectId),
    [form.subjectId, questions]
  );

  const totalPoints = useMemo(() => (
    Object.values(selectedQuestions).reduce((sum, point) => sum + Number(point), 0)
      + newQuestions.reduce((sum, question) => sum + Number(question.marks || 0), 0)
  ), [newQuestions, selectedQuestions]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const changeSubject = (subjectId) => {
    setForm((current) => ({ ...current, subjectId }));
    setSelectedQuestions({});
  };

  const toggleExistingQuestion = (question) => {
    setSelectedQuestions((current) => {
      const next = { ...current };
      if (Object.hasOwn(next, question.id)) delete next[question.id];
      else next[question.id] = question.marks;
      return next;
    });
  };

  const updateNewQuestion = (index, field, value) => {
    setNewQuestions((current) => current.map((question, questionIndex) => (
      questionIndex === index ? { ...question, [field]: value } : question
    )));
  };

  const updateNewOption = (questionIndex, optionIndex, value) => {
    setNewQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex) return question;
      const options = [...question.options];
      options[optionIndex] = value;
      return { ...question, options };
    }));
  };

  const validate = () => {
    if (!form.subjectId) return 'Bạn chưa được phân công giảng dạy môn nào.';
    if (!form.title.trim()) return 'Vui lòng nhập tiêu đề bài thi.';
    if (Number(form.duration) <= 0) return 'Thời gian làm bài phải lớn hơn 0.';
    if (Object.keys(selectedQuestions).length + newQuestions.length === 0) return 'Vui lòng thêm ít nhất một câu hỏi có sẵn hoặc câu hỏi mới.';
    for (const [index, question] of newQuestions.entries()) {
      if (!question.text.trim() || question.options.some(option => !option.trim())) {
        return `Câu hỏi mới ${index + 1} cần có nội dung và đủ bốn lựa chọn.`;
      }
      if (Number(question.marks) <= 0) return `Điểm của câu hỏi mới ${index + 1} phải lớn hơn 0.`;
    }
    return '';
  };

  const saveExam = async (publish) => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError('');
      setSuccess('');
      setSaving(true);
      await examService.createBulk({
        ...form,
        duration: Number(form.duration),
        passPercentage: Number(form.passPercentage),
        publish,
        existingQuestions: Object.entries(selectedQuestions).map(([questionId, point]) => ({
          questionId: Number(questionId),
          point: Number(point)
        })),
        newQuestions: newQuestions.map(question => ({
          ...question,
          correctOption: Number(question.correctOption),
          marks: Number(question.marks)
        }))
      });
      setSuccess(publish ? 'Đã tạo và công bố bài thi thành công.' : 'Đã lưu bản nháp bài thi thành công.');
      setTimeout(() => navigate('/teacher/exams'), 900);
    } catch (requestError) {
      setError(requestError.message || 'Không thể tạo bài thi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Đang chuẩn bị trình tạo bài thi..." />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4">
        <Link
          to="/teacher/exams"
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-secondary-200 text-secondary-500 hover:text-secondary-900"
          aria-label="Quay lại danh sách bài thi"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="h1 mb-1">Tạo bài thi</h1>
          <p className="p">Tạo bài thi, tái sử dụng ngân hàng câu hỏi và thêm câu hỏi mới trong một lần lưu.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-sm font-semibold">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-50 border border-accent-100 text-accent-700 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {subjects.length === 0 ? (
        <Card>
          <div className="py-10 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-secondary-300 mx-auto" />
            <h3 className="font-bold text-secondary-900">Chưa có môn được phân công</h3>
            <p className="text-sm text-secondary-500">Quản trị viên cần phân công môn học trước khi bạn tạo bài thi.</p>
          </div>
        </Card>
      ) : (
        <>
          <Card title="1. Cấu hình bài thi" subtitle="Quy tắc truy cập và thiết lập bài thi">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Tiêu đề bài thi"
                  value={form.title}
                  onChange={(event) => updateForm('title', event.target.value)}
                  required
                />
                <Select
                  label="Môn được phân công"
                  value={form.subjectId}
                  onChange={(event) => changeSubject(event.target.value)}
                  options={subjects.map(subject => ({
                    value: subject.id,
                    label: `${subject.code} - ${subject.name}${subject.assignmentNote ? ` (${subject.assignmentNote})` : ''}`
                  }))}
                />
              </div>
              <Textarea
                label="Hướng dẫn cho học sinh"
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Thời gian làm bài (phút)"
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={(event) => updateForm('duration', event.target.value)}
                />
                <Input
                  label="Ngưỡng đạt (%)"
                  type="number"
                  min={0}
                  max={100}
                  value={form.passPercentage}
                  onChange={(event) => updateForm('passPercentage', event.target.value)}
                />
                <Select
                  label="Phạm vi hiển thị"
                  value={form.visibility}
                  onChange={(event) => updateForm('visibility', event.target.value)}
                  options={[
                    { value: 'PRIVATE', label: formatStatus('PRIVATE') },
                    { value: 'PUBLIC', label: formatStatus('PUBLIC') }
                  ]}
                />
                <Input
                  label="Mật khẩu truy cập"
                  type="password"
                  value={form.accessPassword}
                  onChange={(event) => updateForm('accessPassword', event.target.value)}
                  placeholder="Không bắt buộc"
                />
              </div>
            </div>
          </Card>

          <Card
            title="2. Chọn câu hỏi có sẵn"
            subtitle={`${Object.keys(selectedQuestions).length} câu đã chọn từ ngân hàng câu hỏi`}
          >
            {subjectQuestions.length === 0 ? (
              <p className="text-sm text-secondary-500 py-6 text-center">Chưa có câu hỏi nào cho môn học này.</p>
            ) : (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
                {subjectQuestions.map((question) => {
                  const selected = Object.hasOwn(selectedQuestions, question.id);
                  return (
                    <div
                      key={question.id}
                      className={`rounded-xl border p-4 transition-colors ${selected ? 'border-primary-300 bg-primary-50/30' : 'border-secondary-200'}`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleExistingQuestion(question)}
                          className="mt-1 h-4 w-4 rounded border-secondary-300 text-primary-600"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-secondary-900">{question.text}</p>
                          <Badge variant="slate" className="mt-2">{formatDifficulty(question.difficulty)}</Badge>
                        </div>
                        {selected && (
                          <input
                            type="number"
                            min={0.1}
                            step={0.1}
                            value={selectedQuestions[question.id]}
                            onChange={(event) => setSelectedQuestions((current) => ({
                              ...current,
                              [question.id]: event.target.value
                            }))}
                            className="saas-input w-24"
                            aria-label={`Điểm cho ${question.text}`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card
            title="3. Tạo câu hỏi mới cùng bài thi"
            subtitle={`${newQuestions.length} câu hỏi mới sẽ được lưu vào ngân hàng của bạn`}
          >
            <div className="space-y-5">
              {newQuestions.map((question, questionIndex) => (
                <div key={questionIndex} className="rounded-2xl border border-secondary-200 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-secondary-900">Câu hỏi mới {questionIndex + 1}</h4>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setNewQuestions((current) => current.filter((_, index) => index !== questionIndex))}
                      icon={<Trash2 className="h-4 w-4" />}
                      aria-label={`Xóa câu hỏi mới ${questionIndex + 1}`}
                    />
                  </div>
                  <Input
                    label="Nội dung câu hỏi"
                    value={question.text}
                    onChange={(event) => updateNewQuestion(questionIndex, 'text', event.target.value)}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {question.options.map((option, optionIndex) => (
                      <Input
                        key={optionIndex}
                        label={`Lựa chọn ${String.fromCharCode(65 + optionIndex)}`}
                        value={option}
                        onChange={(event) => updateNewOption(questionIndex, optionIndex, event.target.value)}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      label="Đáp án đúng"
                      value={question.correctOption}
                      onChange={(event) => updateNewQuestion(questionIndex, 'correctOption', event.target.value)}
                      options={[0, 1, 2, 3].map(index => ({
                        value: String(index),
                        label: `Lựa chọn ${String.fromCharCode(65 + index)}`
                      }))}
                    />
                    <Input
                      label="Điểm câu hỏi"
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={question.marks}
                      onChange={(event) => updateNewQuestion(questionIndex, 'marks', event.target.value)}
                    />
                    <Select
                      label="Độ khó"
                      value={question.difficulty}
                      onChange={(event) => updateNewQuestion(questionIndex, 'difficulty', event.target.value)}
                      options={['Easy', 'Medium', 'Hard'].map(value => ({ value, label: formatDifficulty(value) }))}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() => setNewQuestions((current) => [...current, emptyQuestion()])}
                icon={<Plus className="h-4 w-4" />}
              >
                Tạo câu hỏi mới trong bài thi này
              </Button>
            </div>
          </Card>

          <div className="sticky bottom-4 bg-white/95 backdrop-blur border border-secondary-200 rounded-2xl shadow-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-secondary-600">
              <strong>{Object.keys(selectedQuestions).length + newQuestions.length}</strong> câu hỏi,
              {' '}<strong>{totalPoints}</strong> tổng điểm
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                loading={saving}
                onClick={() => saveExam(false)}
                icon={<Save className="h-4 w-4" />}
              >
                Lưu bản nháp
              </Button>
              <Button
                loading={saving}
                onClick={() => saveExam(true)}
                icon={<Send className="h-4 w-4" />}
              >
                Công bố bài thi
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateExamWizard;
