import { useState, useEffect } from 'react';
import { subjectService } from '../../services/subjectService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Plus, Edit, Trash2, ShieldAlert, CheckCircle } from 'lucide-react';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  // Dialog controls
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    let active = true;
    subjectService.getAll()
      .then((res) => {
        if (active) setSubjects(res.data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError('Failed to fetch subjects list.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOpen = () => {
    setError('');
    setSuccess('');
    setIsEdit(false);
    setSelectedSubject(null);
    setFormData({ code: '', name: '', description: '' });
    setModalOpen(true);
  };

  const handleEditOpen = (subject) => {
    setError('');
    setSuccess('');
    setIsEdit(true);
    setSelectedSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      description: subject.description
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      setError('Subject Code and Subject Name are required.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setSaveLoading(true);
      if (isEdit) {
        const res = await subjectService.update(selectedSubject.id, formData);
        setSubjects(prev => prev.map(s => s.id === selectedSubject.id ? res.data : s));
        setSuccess(`Subject "${res.data.name}" updated successfully.`);
      } else {
        const res = await subjectService.create(formData);
        setSubjects(prev => [...prev, res.data]);
        setSuccess(`Subject "${res.data.name}" created successfully.`);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save subject details.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteClick = (subject) => {
    setError('');
    setSuccess('');
    setSubjectToDelete(subject);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subjectToDelete) return;
    try {
      setError('');
      setSuccess('');
      setDeleteLoading(true);
      await subjectService.delete(subjectToDelete.id);
      setSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));
      setSuccess(`Subject "${subjectToDelete.name}" deleted successfully.`);
      setDeleteOpen(false);
      setSubjectToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete subject.');
      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { 
      header: 'Code', 
      key: 'code', 
      render: (row) => <span className="font-mono font-bold text-xs bg-secondary-100 px-2 py-1 border border-secondary-200 rounded text-secondary-800">{row.code}</span> 
    },
    { 
      header: 'Subject Name', 
      key: 'name', 
      render: (row) => <span className="font-semibold text-secondary-800">{row.name}</span> 
    },
    { header: 'Description', key: 'description' },
    {
      header: 'Usage',
      key: 'usage',
      render: (row) => (
        <span className="text-xs text-secondary-500 font-bold">
          {row.questionCount} questions / {row.examCount} exams
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditOpen(row)}
            icon={<Edit className="h-3.5 w-3.5" />}
            aria-label={`Edit ${row.name}`}
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            icon={<Trash2 className="h-3.5 w-3.5" />}
            aria-label={`Delete ${row.name}`}
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Subject Category Management" 
        subtitle="Organize question banks and active examinations into academic course sections."
        actions={
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleCreateOpen}
            icon={<Plus className="h-4.5 w-4.5" />}
          >
            Create Subject
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
        data={subjects} 
        loading={loading}
        pageSize={6} 
        emptyMessage="No subjects have been defined in the platform yet."
      />

      {/* Modal form */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={isEdit ? 'Modify Subject Category' : 'Create Subject Category'}
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <Input 
            label="Subject Code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="e.g. CS-101"
            required
          />

          <Input 
            label="Subject Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Computer Science"
            required
          />

          <Textarea 
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Outline topics covered under this subject..."
          />

          <div className="flex gap-3 pt-4 border-t border-secondary-200">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saveLoading}
              className="flex-1"
            >
              {isEdit ? 'Save Changes' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Subject Category"
        message={`Delete subject "${subjectToDelete?.name}" (${subjectToDelete?.code})? Subjects used by questions or exams cannot be deleted.`}
        confirmText="Delete Subject"
        loading={deleteLoading}
      />
    </div>
  );
};

export default SubjectManagement;
