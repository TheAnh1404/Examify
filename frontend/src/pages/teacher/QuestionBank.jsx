import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import { subjectService } from '../../services/subjectService';
import PageHeader from '../../components/layout/PageHeader';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Plus, Eye, Edit, Trash2, ShieldAlert, CheckCircle } from 'lucide-react';

const QuestionBank = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  // Deletions
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [questionsRes, subjectsRes] = await Promise.all([
        questionService.getAll(),
        subjectService.getAll()
      ]);
      setQuestions(questionsRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch questionnaires from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      setSuccess('Question prompt deleted successfully.');
      setDeleteOpen(false);
      setQuestionToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete question.');
      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter list
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === 'ALL' || q.subjectId === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const getDifficultyVariant = (diff) => {
    const d = diff.toLowerCase();
    if (d === 'easy') return 'success';
    if (d === 'medium') return 'warning';
    return 'danger';
  };

  const columns = [
    { 
      header: 'Subject', 
      key: 'subjectCode', 
      render: (row) => (
        <span className="font-mono font-bold text-xs bg-secondary-100 border border-secondary-200 text-secondary-800 px-2 py-0.5 rounded">
          {row.subjectCode || 'No Subject'}
        </span>
      ) 
    },
    { 
      header: 'Question Prompt', 
      key: 'text', 
      render: (row) => (
        <Link to={`/teacher/questions/${row.id}`} className="font-medium text-secondary-800 hover:text-primary-600 transition-colors line-clamp-2 max-w-lg">
          {row.text}
        </Link>
      ) 
    },
    { 
      header: 'Weight', 
      key: 'marks', 
      render: (row) => <span className="font-semibold">{row.marks} pts</span> 
    },
    { 
      header: 'Difficulty', 
      key: 'difficulty', 
      render: (row) => <Badge variant={getDifficultyVariant(row.difficulty)}>{row.difficulty}</Badge> 
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2 justify-end shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/teacher/questions/${row.id}`)}
            icon={<Eye className="h-3.5 w-3.5 text-secondary-500" />}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/teacher/questions/${row.id}/edit`)}
            icon={<Edit className="h-3.5 w-3.5 text-secondary-500" />}
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            icon={<Trash2 className="h-3.5 w-3.5" />}
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Question Bank Catalog" 
        subtitle="Manage and pool subject questions. Link them into active examination sheets."
        actions={
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => navigate('/teacher/questions/create')}
            icon={<Plus className="h-4.5 w-4.5" />}
          >
            Create Question
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

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-secondary-200 rounded-xl p-4 shadow-sm shrink-0">
        <SearchBox 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search question prompts..." 
        />
        
        <FilterBar 
          value={subjectFilter} 
          onChange={(e) => setSubjectFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Subject Categories' },
            ...subjects.map(s => ({ value: s.id, label: s.name }))
          ]} 
        />
      </div>

      {/* Grid listing */}
      <DataTable 
        columns={columns} 
        data={filteredQuestions} 
        loading={loading}
        pageSize={6} 
        emptyMessage="No question records matched the current filters."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Question Prompt"
        message="Are you sure you want to permanently delete this question from the Question Bank pool? (Note: Questions linked in published examinations cannot be deleted)."
        confirmText="Delete Question"
        loading={deleteLoading}
      />
    </div>
  );
};

export default QuestionBank;
