import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import { subjectService } from '../../services/subjectService';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loading from '../../components/common/Loading';
import { Plus, Eye, Edit, Trash2, ShieldAlert, CheckCircle2, BookMarked } from 'lucide-react';
import { formatDifficulty } from '../../utils/i18n';

const QuestionBank = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
        questionService.getAll(),
        subjectService.getAll()
      ])
      .then(([questionsRes, subjectsRes]) => {
        if (!active) return;
        setQuestions(questionsRes.data);
        setSubjects(subjectsRes.data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError('Không thể tải ngân hàng câu hỏi.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDeleteClick = (question) => {
    setError('');
    setSuccess('');
    setQuestionToDelete(question);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;
    try {
      setError('');
      setSuccess('');
      setDeleteLoading(true);
      await questionService.delete(questionToDelete.id);
      setQuestions(prev => prev.filter(q => q.id !== questionToDelete.id));
      setSuccess('Đã xóa câu hỏi.');
      setDeleteOpen(false);
      setQuestionToDelete(null);
    } catch (err) {
      setError(err.message || 'Không thể xóa câu hỏi.');
      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === 'ALL' || q.subjectId === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const getDifficultyVariant = (diff) => {
    const d = diff?.toLowerCase() || 'medium';
    if (d === 'easy') return 'success';
    if (d === 'medium') return 'warning';
    return 'danger';
  };

  const columns = [
    { 
      header: 'Môn học',
      key: 'subjectCode', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-secondary-50 text-secondary-500">
            <BookMarked className="h-4 w-4" />
          </div>
          <span className="font-bold text-secondary-900">
            {row.subjectCode || 'Không có'}
          </span>
        </div>
      ) 
    },
    { 
      header: 'Nội dung câu hỏi',
      key: 'text', 
      render: (row) => (
        <div className="max-w-md">
          <Link to={`/teacher/questions/${row.id}`} className="font-bold text-secondary-900 hover:text-primary-600 transition-colors line-clamp-1">
            {row.text}
          </Link>
          <p className="text-xs text-secondary-400 font-medium mt-0.5">{row.options?.length || 0} lựa chọn</p>
        </div>
      ) 
    },
    { 
      header: 'Điểm',
      key: 'marks', 
      render: (row) => <span className="font-bold text-secondary-700">{row.marks} điểm</span>
    },
    { 
      header: 'Độ khó',
      key: 'difficulty', 
      render: (row) => <Badge variant={getDifficultyVariant(row.difficulty)} dot>{formatDifficulty(row.difficulty)}</Badge>
    },
    {
      header: '',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/teacher/questions/${row.id}`)}
            icon={<Eye className="h-4 w-4" />}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/teacher/questions/${row.id}/edit`)}
            icon={<Edit className="h-4 w-4" />}
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            icon={<Trash2 className="h-4 w-4" />}
          />
        </div>
      )
    }
  ];

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Đang tải câu hỏi..." />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="h1 mb-1">Ngân hàng câu hỏi</h1>
          <p className="p">Quản lý câu hỏi theo môn và liên kết vào các bài thi.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/teacher/questions/create')}
          icon={<Plus className="h-5 w-5" />}
          className="shadow-lg shadow-primary-500/20"
        >
          Thêm câu hỏi
        </Button>
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

      {/* Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <SearchBox 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Tìm nội dung câu hỏi..."
        />
        
        <FilterBar 
          value={subjectFilter} 
          onChange={(e) => setSubjectFilter(e.target.value)}
          label="Môn học:"
          options={[
            { value: 'ALL', label: 'Tất cả môn học' },
            ...subjects.map(s => ({ value: s.id, label: s.name }))
          ]} 
        />
      </div>

      {/* Grid listing */}
      <DataTable 
        columns={columns} 
        data={filteredQuestions} 
        pageSize={8} 
        emptyMessage="Không có câu hỏi nào khớp với bộ lọc hiện tại."
      />

      <ConfirmDialog 
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa câu hỏi"
        message="Bạn có chắc muốn xóa vĩnh viễn câu hỏi này khỏi ngân hàng? Câu hỏi đã liên kết với bài thi đã công bố sẽ không thể xóa."
        confirmText="Xác nhận xóa"
        loading={deleteLoading}
      />
    </div>
  );
};

export default QuestionBank;
