import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import PageHeader from '../../components/layout/PageHeader';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Plus, Edit, Trash2, ShieldAlert, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';

const UserManagement = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser() || {};

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Delete Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAll();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  // Filter accounts
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role.toUpperCase() === roleFilter.toUpperCase();
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role) => {
    const r = role.toUpperCase();
    if (r === 'ADMIN') return 'purple';
    if (r === 'TEACHER') return 'primary';
    return 'success';
  };

  const columns = [
    { 
      header: 'Name', 
      key: 'name', 
      render: (row) => <span className="font-semibold text-secondary-800">{row.name}</span> 
    },
    { header: 'Email', key: 'email' },
    { 
      header: 'Role', 
      key: 'role', 
      render: (row) => <Badge variant={getRoleBadgeVariant(row.role)}>{row.role}</Badge> 
    },
    { 
      header: 'Joined Date', 
      key: 'createdAt', 
      render: (row) => (
        <span className="text-secondary-450 text-xs">
          {new Date(row.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
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
            onClick={() => navigate(`/admin/users/${row.id}/edit`)}
            icon={<Edit className="h-3.5 w-3.5" />}
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            disabled={row.id === currentUser.id}
            icon={<Trash2 className="h-3.5 w-3.5" />}
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="User Account Management" 
        subtitle="Manage and provision client credentials, teacher permissions, and student profiles."
        actions={
          <Button 
            variant="primary" 
            size="md" 
            onClick={() => navigate('/admin/users/create')}
            icon={<Plus className="h-4.5 w-4.5" />}
          >
            Create User
          </Button>
        }
      />

      {/* Action Banners */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-105 text-red-700 text-sm animate-slide-up">
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

      {/* Table Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-secondary-200 rounded-xl p-4 shadow-sm shrink-0">
        <SearchBox 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search by user name or email..." 
        />
        
        <FilterBar 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All System Roles' },
            { value: 'ADMIN', label: 'Administrators' },
            { value: 'TEACHER', label: 'Teachers' },
            { value: 'STUDENT', label: 'Students' }
          ]} 
        />
      </div>

      {/* Grid listing */}
      <DataTable 
        columns={columns} 
        data={filteredUsers} 
        loading={loading}
        pageSize={6} 
        emptyMessage="No account records matched the current criteria search."
      />

      {/* Delete Dialog */}
      <ConfirmDialog 
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${userToDelete?.name}"? All related data will be archived.`}
        confirmText="Delete Account"
        loading={deleteLoading}
      />
    </div>
  );
};

export default UserManagement;
