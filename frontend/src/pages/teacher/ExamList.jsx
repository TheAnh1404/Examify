import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { examService } from '../../services/examService';
import { subjectService } from '../../services/subjectService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Plus, Eye, Trash2, FolderLock, ShieldAlert, CheckCircle } from 'lucide-react';

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

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await examService.getAll();
      setExams(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch examinations list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
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
      setSuccess(`Exam "${examToDelete.title}" deleted successfully.`);
      setDeleteOpen(false);
      setExamToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete exam.');
      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { 
      header: 'Exam Details', 
      key: 'title', 
      render: (row) => (
        <div>
          <Link to={`/teacher/exams/${row.id}`} className="font-semibold text-secondary-800 hover:text-primary-600 transition-colors">
            {row.title}
          </Link>
          <p className="text-xs text-secondary-400 mt-0.5 line-clamp-1 max-w-sm">{row.description || 'No description'}</p>
        </div>
      ) 
    },
    { 
      header: 'Subject', 
      key: 'subjectName', 
      render: (row) => <Badge variant="indigo">{row.subjectName}</Badge> 
    },
    { 
      header: 'Duration', 
      key: 'duration', 
      render: (row) => <span className="text-secondary-500 font-medium">{row.duration} mins</span> 
    },
    { 
      header: 'Total Marks', 
      key: 'totalMarks', 
      render: (row) => <span className="font-bold">{row.totalMarks} pts</span> 
    },
    { 
      header: 'Questions', 
      key: 'questionCount', 
      render: (row) => <span className="font-medium">{row.questionCount} Qs</span> 
    },
    { 
      header: 'Status', 
      key: 'status', 
      render: (row) => (
        <Badge variant={row.status.toUpperCase() === 'PUBLISHED' ? 'success' : 'slate'}>
          {row.status}
        </Badge>
      ) 
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-1.5 justify-end shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/teacher/exams/${row.id}`)}
            icon={<Eye className="h-3.5 w-3.5 text-secondary-500" />}
            title="View Details"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/teacher/exams/${row.id}/questions`)}
            icon={<FolderLock className="h-3.5 w-3.5 text-secondary-500" />}
            title="Manage Questions"
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            icon={<Trash2 className="h-3.5 w-3.5" />}
            title="Delete Exam"
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Examination List" 
        subtitle="Review, structure, and modify academic quizzes."
        actions={
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => navigate('/teacher/exams/create')}
            icon={<Plus className="h-4.5 w-4.5" />}
          >
            Create Exam
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
        emptyMessage="No exams have been published yet."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Examination"
        message={`Are you sure you want to permanently delete exam "${examToDelete?.title}"? All student attempts logged under this exam will be deleted.`}
        confirmText="Delete Exam"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ExamList;
