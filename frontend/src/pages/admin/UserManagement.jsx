import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loading from '../../components/common/Loading';
import { Plus, Edit, Trash2, ShieldAlert, CheckCircle2, UserCircle, Mail, Calendar, Lock, Unlock } from 'lucide-react';
import { authService } from '../../services/authService';
import { formatRole, formatStatus } from '../../utils/i18n';

const UserManagement = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser() || {};

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let active = true;
    userService.getAll()
      .then((res) => {
        if (active) setUsers(res.data);
      })
      .catch((err) => {
        console.error(err);
        if (active) setError('Không thể tải danh sách người dùng.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDeleteClick = (user) => {
    if (user.id === currentUser.id) {
      setError('Bạn không thể xóa tài khoản quản trị viên đang sử dụng.');
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setError('');
      setSuccess('');
      setDeleteLoading(true);
      await userService.delete(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setSuccess(`Đã xóa tài khoản "${userToDelete.name}".`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.message || 'Không thể xóa người dùng.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusToggle = async (user) => {
    const nextStatus = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    try {
      setError('');
      setSuccess('');
      setStatusLoadingId(user.id);
      await userService.updateStatus(user.id, nextStatus);
      setUsers((current) => current.map((item) => (
        item.id === user.id ? { ...item, status: nextStatus } : item
      )));
      setSuccess(`${user.name} hiện ở trạng thái ${formatStatus(nextStatus)}.`);
    } catch (err) {
      setError(err.message || 'Không thể cập nhật trạng thái tài khoản.');
    } finally {
      setStatusLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role.toUpperCase() === roleFilter.toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeVariant = (role) => {
    const r = role.toUpperCase();
    if (r === 'ADMIN') return 'purple';
    if (r === 'TEACHER') return 'primary';
    return 'success';
  };

  const columns = [
    { 
      header: 'Hồ sơ người dùng',
      key: 'name', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary-50 text-secondary-400 flex items-center justify-center border border-secondary-100">
            <UserCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-secondary-900">{row.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-secondary-400 font-medium">
              <Mail className="h-3 w-3" />
              {row.email}
            </div>
          </div>
        </div>
      ) 
    },
    { 
      header: 'Vai trò',
      key: 'role', 
      render: (row) => <Badge variant={getRoleBadgeVariant(row.role)} dot>{formatRole(row.role)}</Badge>
    },
    {
      header: 'Môn giảng dạy',
      key: 'teachingSubjects',
      render: (row) => row.role === 'TEACHER' ? (
        <div className="max-w-56 space-y-1">
          {(row.teachingSubjects || []).map((assignment) => (
            <div key={assignment.subjectId} className="text-xs">
              <span className="font-bold text-secondary-700">{assignment.subject?.code}</span>
              <span className="text-secondary-400"> {assignment.note || 'Không có ghi chú'}</span>
            </div>
          ))}
          {(row.teachingSubjects || []).length === 0 && <span className="text-xs text-warning-600">Chưa phân công</span>}
        </div>
      ) : <span className="text-xs text-secondary-300">Không áp dụng</span>
    },
    { 
      header: 'Ngày tạo',
      key: 'createdAt', 
      render: (row) => (
        <div className="flex items-center gap-2 text-secondary-500">
          <Calendar className="h-4 w-4" />
          <span className="text-xs font-bold">
            {new Date(row.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
      ) 
    },
    {
      header: 'Trạng thái',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'} dot>
          {formatStatus(row.status)}
        </Badge>
      )
    },
    {
      header: '',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/admin/users/${row.id}/edit`)}
            icon={<Edit className="h-4 w-4" />}
            aria-label={`Chỉnh sửa ${row.name}`}
          />
          <Button
            variant={row.status === 'LOCKED' ? 'success' : 'secondary'}
            size="sm"
            onClick={() => handleStatusToggle(row)}
            disabled={row.id === currentUser.id}
            loading={statusLoadingId === row.id}
            icon={row.status === 'LOCKED' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            aria-label={`${row.status === 'LOCKED' ? 'Mở khóa' : 'Khóa'} ${row.name}`}
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            disabled={row.id === currentUser.id}
            icon={<Trash2 className="h-4 w-4" />}
            aria-label={`Xóa ${row.name}`}
          />
        </div>
      )
    }
  ];

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Đang tải người dùng hệ thống..." />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="h1 mb-1">Quản lý người dùng</h1>
          <p className="p">Quản lý tài khoản, quyền giáo viên và hồ sơ học sinh.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/admin/users/create')}
          icon={<Plus className="h-5 w-5" />}
          className="shadow-lg shadow-primary-500/20"
        >
          Tạo người dùng
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

      {/* Table Filters */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
        <SearchBox 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Tìm theo tên hoặc email..."
        />
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <FilterBar
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Vai trò:"
            options={[
              { value: 'ALL', label: 'Tất cả vai trò' },
              { value: 'ADMIN', label: 'Quản trị viên' },
              { value: 'TEACHER', label: 'Giáo viên' },
              { value: 'STUDENT', label: 'Học sinh' }
            ]}
          />
          <FilterBar
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Trạng thái:"
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'ACTIVE', label: 'Hoạt động' },
              { value: 'LOCKED', label: 'Đã khóa' }
            ]}
          />
        </div>
      </div>

      {/* User Listing */}
      <DataTable 
        columns={columns} 
        data={filteredUsers} 
        pageSize={8} 
        emptyMessage="Không có tài khoản nào khớp với điều kiện tìm kiếm."
      />

      <ConfirmDialog 
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa tài khoản người dùng"
        message={`Xóa vĩnh viễn "${userToDelete?.name}"? Tài khoản đã có câu hỏi, bài thi hoặc lượt làm bài liên quan nên được khóa thay vì xóa.`}
        confirmText="Xác nhận xóa"
        loading={deleteLoading}
      />
    </div>
  );
};

export default UserManagement;
