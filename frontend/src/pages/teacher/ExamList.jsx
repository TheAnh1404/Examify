import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Plus, Eye, Trash2, FolderLock, ShieldAlert, CheckCircle } from 'lucide-react';
import { formatStatus } from '../../utils/i18n';

const ExamList = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delete states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let active = true;
    examService.getAll()
      .then((response) => {
        if (active) setExams(response.data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError('Không thể tải danh sách bài thi.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDeleteClick = (exam) => {
    setError('');
    setSuccess('');
    setExamToDelete(exam);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    try {
      setError('');
      setSuccess('');
      setDeleteLoading(true);
      await examService.delete(examToDelete.id);
      setExams(prev => prev.filter(e => e.id !== examToDelete.id));
      setSuccess(`Đã xóa bài thi "${examToDelete.title}".`);
      setDeleteOpen(false);
      setExamToDelete(null);
    } catch (err) {
      setError(err.message || 'Không thể xóa bài thi.');
      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { 
      header: 'Thông tin bài thi',
      key: 'title', 
      render: (row) => (
        <div>
          <Link to={`/teacher/exams/${row.id}`} className="font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
            {row.title}
          </Link>
          <p className="text-xs text-secondary-400 mt-0.5 line-clamp-1 max-w-sm">{row.description || 'Không có mô tả'}</p>
        </div>
      ) 
    },
    { 
      header: 'Môn học',
      key: 'subjectName', 
      render: (row) => <Badge variant="indigo">{row.subjectName}</Badge> 
    },
    { 
      header: 'Thời gian',
      key: 'duration', 
      render: (row) => <span className="text-secondary-500 font-medium">{row.duration} phút</span>
    },
    { 
      header: 'Tổng điểm',
      key: 'totalMarks', 
      render: (row) => <span className="font-bold">{row.totalMarks} điểm</span>
    },
    { 
      header: 'Câu hỏi',
      key: 'questionCount', 
      render: (row) => <span className="font-medium">{row.questionCount} câu</span>
    },
    { 
      header: 'Trạng thái',
      key: 'status', 
      render: (row) => (
        <Badge variant={row.status.toUpperCase() === 'PUBLISHED' ? 'success' : 'slate'}>
          {formatStatus(row.status)}
        </Badge>
      ) 
    },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-1.5 justify-end shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/teacher/exams/${row.id}`)}
            icon={<Eye className="h-3.5 w-3.5 text-secondary-500" />}
            title="Xem chi tiết"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/teacher/exams/${row.id}/questions`)}
            icon={<FolderLock className="h-3.5 w-3.5 text-secondary-500" />}
            title="Quản lý câu hỏi"
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            icon={<Trash2 className="h-3.5 w-3.5" />}
            title="Xóa bài thi"
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Danh sách bài thi"
        subtitle="Xem, tổ chức và chỉnh sửa các bài kiểm tra."
        actions={
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => navigate('/teacher/exams/create')}
            icon={<Plus className="h-4.5 w-4.5" />}
          >
            Tạo bài thi
          </Button>
        }
      />

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

      {/* Grid listing */}
      <DataTable 
        columns={columns} 
        data={exams} 
        loading={loading}
        pageSize={6} 
        emptyMessage="Chưa có bài thi nào."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa bài thi"
        message={`Bạn có chắc muốn xóa vĩnh viễn bài thi "${examToDelete?.title}"? Tất cả lượt làm bài ghi nhận dưới bài thi này sẽ bị xóa.`}
        confirmText="Xóa bài thi"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ExamList;
