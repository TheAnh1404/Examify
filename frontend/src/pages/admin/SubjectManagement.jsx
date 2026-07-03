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
        if (active) setError('Không thể tải danh sách môn học.');
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
      setError('Mã môn học và tên môn học là bắt buộc.');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setSaveLoading(true);
      if (isEdit) {
        const res = await subjectService.update(selectedSubject.id, formData);
        setSubjects(prev => prev.map(s => s.id === selectedSubject.id ? res.data : s));
        setSuccess(`Đã cập nhật môn học "${res.data.name}".`);
      } else {
        const res = await subjectService.create(formData);
        setSubjects(prev => [...prev, res.data]);
        setSuccess(`Đã tạo môn học "${res.data.name}".`);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.message || 'Không thể lưu thông tin môn học.');
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
      setSuccess(`Đã xóa môn học "${subjectToDelete.name}".`);
      setDeleteOpen(false);
      setSubjectToDelete(null);
    } catch (err) {
      setError(err.message || 'Không thể xóa môn học.');
      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { 
      header: 'Mã',
      key: 'code', 
      render: (row) => <span className="font-mono font-bold text-xs bg-secondary-100 px-2 py-1 border border-secondary-200 rounded text-secondary-800">{row.code}</span> 
    },
    { 
      header: 'Tên môn học',
      key: 'name', 
      render: (row) => <span className="font-semibold text-secondary-800">{row.name}</span> 
    },
    { header: 'Mô tả', key: 'description' },
    {
      header: 'Sử dụng',
      key: 'usage',
      render: (row) => (
        <span className="text-xs text-secondary-500 font-bold">
          {row.questionCount} câu hỏi / {row.examCount} bài thi
        </span>
      )
    },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditOpen(row)}
            icon={<Edit className="h-3.5 w-3.5" />}
            aria-label={`Chỉnh sửa ${row.name}`}
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            icon={<Trash2 className="h-3.5 w-3.5" />}
            aria-label={`Xóa ${row.name}`}
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Quản lý môn học"
        subtitle="Tổ chức ngân hàng câu hỏi và bài thi theo từng môn học."
        actions={
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleCreateOpen}
            icon={<Plus className="h-4.5 w-4.5" />}
          >
            Tạo môn học
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
        emptyMessage="Chưa có môn học nào trong hệ thống."
      />

      {/* Modal form */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={isEdit ? 'Chỉnh sửa môn học' : 'Tạo môn học'}
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <Input 
            label="Mã môn học"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="Ví dụ: CS-101"
            required
          />

          <Input 
            label="Tên môn học"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ví dụ: Tin học"
            required
          />

          <Textarea 
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Mô tả các chủ đề thuộc môn học này..."
          />

          <div className="flex gap-3 pt-4 border-t border-secondary-200">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saveLoading}
              className="flex-1"
            >
              {isEdit ? 'Lưu thay đổi' : 'Tạo môn học'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa môn học"
        message={`Xóa môn học "${subjectToDelete?.name}" (${subjectToDelete?.code})? Môn học đang được dùng bởi câu hỏi hoặc bài thi sẽ không thể xóa.`}
        confirmText="Xóa môn học"
        loading={deleteLoading}
      />
    </div>
  );
};

export default SubjectManagement;
