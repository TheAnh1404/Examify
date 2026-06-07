import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { attemptService } from '../../services/attemptService';
import { dashboardService } from '../../services/dashboardService';
import { db } from '../../data/mockData';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { User, Mail, Award, CheckCircle, ShieldAlert, RotateCcw, Lock, Clipboard } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser() || { id: 'usr-student', name: 'Alex Rivera', email: 'student@examify.com', role: 'STUDENT' };

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

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
    if (currentUser.id) {
      fetchStats();
    }
  }, [currentUser.id]);

  const handleResetAttempts = async () => {
    setResetting(true);
    try {
      // Clear attempt records from db state for this student
      db.attempts = db.attempts.filter(a => a.studentId !== currentUser.id);
      db.save('attempts');
      
      // Reload stats
      await fetchStats();
      setResetConfirmOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <Loading message="Loading profile metrics..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      <PageHeader 
        title="My Profile Account" 
        subtitle="Manage your personal credentials, view academic metrics, and adjust platform settings."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card Left */}
        <div className="md:col-span-1 space-y-6">
          <Card className="text-center py-6">
            <div className="h-20 w-20 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 shadow-sm mx-auto mb-4">
              <User className="h-10 w-10" />
            </div>
            
            <h3 className="font-semibold text-lg text-secondary-800 leading-snug">{currentUser.name}</h3>
            <p className="text-xs text-secondary-400 mt-1 font-medium">{currentUser.email}</p>
            
            <div className="mt-4 flex justify-center">
              <Badge variant="info">{currentUser.role}</Badge>
            </div>
            
            <div className="mt-6 pt-6 border-t border-secondary-100 text-left space-y-3.5 px-2">
              <div className="flex items-center gap-2.5 text-xs text-secondary-500 font-medium">
                <Clipboard className="h-4 w-4 text-secondary-400 shrink-0" />
                <span>ID: <code className="bg-secondary-100 text-secondary-650 px-1 rounded text-[10px]">{currentUser.id}</code></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-secondary-500 font-medium">
                <Mail className="h-4 w-4 text-secondary-400 shrink-0" />
                <span>{currentUser.email}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Data & Actions Right */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Performance Summary Card */}
          <Card title="Assessment Metrics Overview" subtitle="High-level dashboard aggregates computed from your exam results history.">
            <div className="grid grid-cols-3 gap-4 text-center mt-2">
              <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4">
                <span className="text-[10px] text-secondary-400 uppercase font-semibold block">Total Taken</span>
                <span className="text-2xl font-bold text-secondary-800 mt-1.5 block">
                  {stats ? stats.examsTaken : 0}
                </span>
                <span className="text-[9px] text-secondary-500 block mt-1 font-medium">completed tests</span>
              </div>

              <div className="bg-primary-50/20 border border-primary-100 rounded-xl p-4">
                <span className="text-[10px] text-primary-600 uppercase font-semibold block">Average Grade</span>
                <span className="text-2xl font-bold text-primary-750 mt-1.5 block">
                  {stats ? `${stats.averageScore}%` : '0%'}
                </span>
                <span className="text-[9px] text-primary-500 block mt-1 font-medium">overall percentile</span>
              </div>

              <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4">
                <span className="text-[10px] text-emerald-600 uppercase font-semibold block">Passing Ratio</span>
                <span className="text-2xl font-bold text-emerald-750 mt-1.5 block">
                  {stats ? `${stats.passRate}%` : '0%'}
                </span>
                <span className="text-[9px] text-emerald-500 block mt-1 font-medium">success index</span>
              </div>
            </div>
          </Card>

          {/* Sandbox Controls Card */}
          <Card 
            title="Learning Sandbox Actions" 
            subtitle="Developer utility tools to clear attempt scorecards, allowing you to test available assessments catalog from scratch."
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800 leading-relaxed flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-700">Sandbox Reset Information</p>
                  <p className="mt-0.5 text-secondary-650 font-medium">
                    Triggering this action deletes all submitted attempt scorecards linked to user <strong className="text-secondary-800">{currentUser.name}</strong>. The exams will become available for testing in the catalog once more.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="danger"
                  onClick={() => setResetConfirmOpen(true)}
                  icon={<RotateCcw className="h-4 w-4" />}
                >
                  Reset My Attempt Logs
                </Button>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* Reset Confirmation dialog */}
      <ConfirmDialog 
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleResetAttempts}
        title="Reset Attempt Scorecards"
        message="Are you sure you want to wipe out your submissions history? This action is local-only and cannot be undone."
        confirmText="Yes, Clear History"
        loading={resetting}
        type="danger"
      />

    </div>
  );
};

export default Profile;
