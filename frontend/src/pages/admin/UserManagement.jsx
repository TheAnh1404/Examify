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
        if (active) setError('Failed to fetch users catalog.');
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
      setError('You cannot delete your own active administrator profile.');
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
      setSuccess(`User account for "${userToDelete.name}" deleted successfully.`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
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
      setSuccess(`${user.name} is now ${nextStatus.toLowerCase()}.`);
    } catch (err) {
      setError(err.message || 'Failed to update account status.');
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
      header: 'User Profile', 
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
      header: 'Role Permissions', 
      key: 'role', 
      render: (row) => <Badge variant={getRoleBadgeVariant(row.role)} dot>{row.role}</Badge> 
    },
    {
      header: 'Teaching Subjects',
      key: 'teachingSubjects',
      render: (row) => row.role === 'TEACHER' ? (
        <div className="max-w-56 space-y-1">
          {(row.teachingSubjects || []).map((assignment) => (
            <div key={assignment.subjectId} className="text-xs">
              <span className="font-bold text-secondary-700">{assignment.subject?.code}</span>
              <span className="text-secondary-400"> {assignment.note || 'No note'}</span>
            </div>
          ))}
          {(row.teachingSubjects || []).length === 0 && <span className="text-xs text-warning-600">Not assigned</span>}
        </div>
      ) : <span className="text-xs text-secondary-300">Not applicable</span>
    },
    { 
      header: 'Registration', 
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
      header: 'Status',
      key: 'status',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'} dot>
          {row.status}
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
            aria-label={`Edit ${row.name}`}
          />
          <Button
            variant={row.status === 'LOCKED' ? 'success' : 'secondary'}
            size="sm"
            onClick={() => handleStatusToggle(row)}
            disabled={row.id === currentUser.id}
            loading={statusLoadingId === row.id}
            icon={row.status === 'LOCKED' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            aria-label={`${row.status === 'LOCKED' ? 'Unlock' : 'Lock'} ${row.name}`}
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            disabled={row.id === currentUser.id}
            icon={<Trash2 className="h-4 w-4" />}
            aria-label={`Delete ${row.name}`}
          />
        </div>
      )
    }
  ];

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Loading system users..." />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="h1 mb-1">User Management</h1>
          <p className="p">Manage and provision client credentials, teacher permissions, and student profiles.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => navigate('/admin/users/create')}
          icon={<Plus className="h-5 w-5" />}
          className="shadow-lg shadow-primary-500/20"
        >
          Create New User
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
          placeholder="Search by name or email..." 
        />
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <FilterBar
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Role:"
            options={[
              { value: 'ALL', label: 'All System Roles' },
              { value: 'ADMIN', label: 'Administrators' },
              { value: 'TEACHER', label: 'Teachers' },
              { value: 'STUDENT', label: 'Students' }
            ]}
          />
          <FilterBar
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status:"
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'LOCKED', label: 'Locked' }
            ]}
          />
        </div>
      </div>

      {/* User Listing */}
      <DataTable 
        columns={columns} 
        data={filteredUsers} 
        pageSize={8} 
        emptyMessage="No account records matched the current criteria search."
      />

      <ConfirmDialog 
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        message={`Permanently delete "${userToDelete?.name}"? Accounts with related questions, exams, or attempts must be locked instead.`}
        confirmText="Confirm Deletion"
        loading={deleteLoading}
      />
    </div>
  );
};

export default UserManagement;
