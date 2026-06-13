import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { dashboardService } from '../../services/dashboardService';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { User, Mail, Award, CheckCircle, ShieldAlert, RotateCcw, Lock, Clipboard, School, Camera, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    schoolName: currentUser?.schoolName || '',
    avatarUrl: currentUser?.avatarUrl || ''
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStudentStats(currentUser.id);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchStats();
    }
  }, [currentUser?.id]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await userService.updateProfile(formData);
      // Update local storage and state
      const updatedUser = { ...currentUser, ...res.data, name: res.data.fullName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading profile metrics..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none">
      <PageHeader 
        title="My Profile Account" 
        subtitle="Manage your personal credentials, view academic metrics, and adjust platform settings."
        actions={
          !isEditing ? (
            <Button variant="primary" onClick={() => setIsEditing(true)} icon={<Edit2 className="h-4 w-4" />}>
              Edit Profile
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card Left */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center py-10 relative">
            <div className="relative inline-block mx-auto mb-6 group">
              <div className="h-32 w-32 rounded-[2.5rem] bg-primary-50 text-primary-600 flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden ring-1 ring-secondary-100">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16" />
                )}
              </div>
              {isEditing && (
                <div className="absolute inset-0 rounded-[2.5rem] bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            
            <h3 className="font-extrabold text-2xl text-secondary-900 leading-snug tracking-tight">{currentUser.name}</h3>
            <div className="mt-2 flex justify-center gap-2">
              <Badge variant="info" className="uppercase tracking-widest text-[10px] py-1 px-3">{currentUser.role}</Badge>
            </div>

            <div className="mt-8 pt-8 border-t border-secondary-50 text-left space-y-4 px-4">
              <div className="flex items-center gap-3 text-sm text-secondary-500 font-bold">
                <div className="h-8 w-8 rounded-xl bg-secondary-50 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-secondary-400" />
                </div>
                <span className="truncate">{currentUser.email}</span>
              </div>
              {currentUser.schoolName && (
                <div className="flex items-center gap-3 text-sm text-secondary-500 font-bold">
                  <div className="h-8 w-8 rounded-xl bg-secondary-50 flex items-center justify-center shrink-0">
                    <School className="h-4 w-4 text-secondary-400" />
                  </div>
                  <span className="truncate">{currentUser.schoolName}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-secondary-500 font-bold">
                <div className="h-8 w-8 rounded-xl bg-secondary-50 flex items-center justify-center shrink-0">
                  <Clipboard className="h-4 w-4 text-secondary-400" />
                </div>
                <span>ID: <code className="bg-secondary-100 text-secondary-650 px-1.5 py-0.5 rounded text-[10px]">{currentUser.id}</code></span>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Data & Actions Right */}
        <div className="lg:col-span-2 space-y-8">
          
          {isEditing ? (
            <Card title="Update Personal Information" subtitle="Keep your profile data accurate for academic reporting.">
              <form onSubmit={handleUpdateProfile} className="space-y-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    placeholder="Enter your legal name"
                  />
                  <Input
                    label="School / Institution"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    placeholder="e.g. Stanford University"
                  />
                </div>
                <Input
                  label="Avatar Image URL"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  description="Provide a direct link to your profile picture."
                />
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-50">
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving} icon={<X className="h-4 w-4" />}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={saving} icon={<Save className="h-4 w-4" />}>
                    Save Profile
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <>
              {/* Performance Summary Card */}
              <Card title="Assessment Metrics Overview" subtitle="High-level dashboard aggregates computed from your exam results history.">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
                  <div className="bg-secondary-50 border border-secondary-100 rounded-3xl p-6 shadow-sm">
                    <span className="text-[10px] text-secondary-400 uppercase font-extrabold tracking-widest block mb-2">Total Taken</span>
                    <span className="text-4xl font-black text-secondary-900 block tracking-tighter">
                      {stats ? stats.examsTaken : 0}
                    </span>
                    <span className="text-[11px] text-secondary-500 block mt-2 font-bold uppercase tracking-tight">completed tests</span>
                  </div>

                  <div className="bg-primary-50/30 border border-primary-100 rounded-3xl p-6 shadow-sm">
                    <span className="text-[10px] text-primary-600 uppercase font-extrabold tracking-widest block mb-2">Average Grade</span>
                    <span className="text-4xl font-black text-primary-750 block tracking-tighter">
                      {stats ? `${stats.averageScore}%` : '0%'}
                    </span>
                    <span className="text-[11px] text-primary-600/70 block mt-2 font-bold uppercase tracking-tight">overall percentile</span>
                  </div>

                  <div className="bg-accent-50/30 border border-accent-100 rounded-3xl p-6 shadow-sm">
                    <span className="text-[10px] text-accent-600 uppercase font-extrabold tracking-widest block mb-2">Passing Ratio</span>
                    <span className="text-4xl font-black text-accent-750 block tracking-tighter">
                      {stats ? `${stats.passRate}%` : '0%'}
                    </span>
                    <span className="text-[11px] text-accent-600/70 block mt-2 font-bold uppercase tracking-tight">success index</span>
                  </div>
                </div>
              </Card>

              {/* Account Security Card */}
              <Card 
                title="Account Security & Access" 
                subtitle="Manage your authentication settings and session credentials."
              >
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-secondary-50 border border-secondary-100 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white border border-secondary-200 flex items-center justify-center text-secondary-500 shadow-sm">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-secondary-900 text-sm">Account Password</p>
                        <p className="text-[11px] text-secondary-500 font-bold uppercase tracking-wider">Security enabled</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">Update</Button>
                  </div>
                </div>
              </Card>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
