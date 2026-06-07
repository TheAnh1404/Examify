import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  UserPlus, 
  AlertCircle,
  CheckCircle,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal control
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMsg('');
      const res = await API.post('/admin/users', formData);
      setUsers(prev => [...prev, res.data]);
      setIsAddModalOpen(false);
      setSuccessMsg(`User ${res.data.name} created successfully.`);
      // Reset form
      setFormData({ name: '', email: '', password: '', role: 'student' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating user.');
    }
  };

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // blank by default (only change if entered)
      role: user.role
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMsg('');
      
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      if (formData.password) payload.password = formData.password;

      const res = await API.put(`/admin/users/${userToEdit.id}`, payload);
      setUsers(prev => prev.map(u => u.id === userToEdit.id ? res.data : u));
      setIsEditModalOpen(false);
      setSuccessMsg(`User ${res.data.name} updated successfully.`);
      // Reset form
      setFormData({ name: '', email: '', password: '', role: 'student' });
      setUserToEdit(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user.');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (id === currentUser.id) {
      setError('You cannot delete your own active admin account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccessMsg('');
      await API.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      setSuccessMsg(`User ${name} has been deleted.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400">Admin</span>;
      case 'teacher':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400">Teacher</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">Student</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">View and manage all registered user accounts</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setSuccessMsg('');
            setFormData({ name: '', email: '', password: '', role: 'student' });
            setIsAddModalOpen(true);
          }}
          className="glow-button flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Add New User
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-slide-up">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-900/40 p-4 border border-dark-800 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-400 hidden sm:inline">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-dark-900 border border-dark-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500 w-full sm:w-40"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel overflow-hidden border border-dark-800">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No accounts found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead className="bg-dark-900/60 border-b border-dark-800 text-slate-400 text-xs font-semibold uppercase">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/80">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-dark-800/20 transition-colors duration-150">
                    <td className="px-6 py-4 font-semibold text-slate-200">{u.name}</td>
                    <td className="px-6 py-4 text-slate-400">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-500/5 border border-transparent hover:border-brand-500/20 transition-all duration-150"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/20 transition-all duration-150"
                        disabled={u.id === currentUser.id}
                        title={u.id === currentUser.id ? "Cannot delete yourself" : "Delete User"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="glass-panel max-w-md w-full p-6 relative z-10 animate-slide-up border-dark-700 bg-dark-900">
            <div className="flex items-center justify-between border-b border-dark-800 pb-3 mb-5">
              <h3 className="font-semibold text-lg text-slate-200">Add New System User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">System Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="secondary-button flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-button flex-1"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="glass-panel max-w-md w-full p-6 relative z-10 animate-slide-up border-dark-700 bg-dark-900">
            <div className="flex items-center justify-between border-b border-dark-800 pb-3 mb-5">
              <h3 className="font-semibold text-lg text-slate-200">Edit User Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Password <span className="text-[10px] text-slate-500 capitalize">(Leave empty to keep current)</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">System Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={userToEdit?.id === currentUser.id}
                  className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 disabled:opacity-50"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
                {userToEdit?.id === currentUser.id && (
                  <p className="text-[10px] text-amber-500/80 mt-1">You cannot alter your own admin role.</p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="secondary-button flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-button flex-1"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
