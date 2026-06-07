import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attemptService } from '../../services/attemptService';
import PageHeader from '../../components/layout/PageHeader';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Eye, AlertTriangle, ShieldAlert } from 'lucide-react';

const ResultsManagement = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const res = await attemptService.getAll(); // pulls mock attempts
        setAttempts(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch student attempts.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const filtered = attempts.filter(a => {
    const matchesSearch = 
      a.studentName.toLowerCase().includes(search.toLowerCase()) || 
      a.examTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      header: 'Student', 
      key: 'studentName', 
      render: (row) => (
        <div>
          <p className="font-semibold text-secondary-800">{row.studentName}</p>
          <p className="text-xs text-secondary-400 mt-0.5">{row.studentEmail}</p>
        </div>
      ) 
    },
    { header: 'Exam Title', key: 'examTitle' },
    { 
      header: 'Score', 
      key: 'score', 
      render: (row) => (
        <span className="font-mono font-bold text-secondary-800">
          {row.score} / {row.examTotalMarks} pts
        </span>
      ) 
    },
    { 
      header: 'Status', 
      key: 'status', 
      render: (row) => <Badge variant={row.status.toUpperCase() === 'PASS' ? 'success' : 'danger'}>{row.status}</Badge> 
    },
    { 
      header: 'Focus Warnings', 
      key: 'tabFocusLosses', 
      render: (row) => (
        row.tabFocusLosses > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded bg-amber-50 border border-amber-100 text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {row.tabFocusLosses} Switches
          </span>
        ) : (
          <span className="text-xs text-secondary-400 font-medium">None</span>
        )
      ) 
    },
    { 
      header: 'Date Submitted', 
      key: 'submittedAt', 
      render: (row) => (
        <span className="text-secondary-450 text-xs">
          {new Date(row.submittedAt).toLocaleDateString(undefined, {
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
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/teacher/results/${row.id}`)}
            icon={<Eye className="h-3.5 w-3.5 text-secondary-500" />}
            title="Review Sheet"
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gradebook & Results" 
        subtitle="Audit student submissions, view scoring breakdowns, and monitor visual proctoring logs."
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-105 text-red-700 text-sm flex items-center gap-3">
          <ShieldAlert className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-secondary-200 rounded-xl p-4 shadow-sm shrink-0">
        <SearchBox 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search by student or exam..." 
        />
        
        <FilterBar 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Attempt Statuses' },
            { value: 'PASS', label: 'Passing Scores' },
            { value: 'FAIL', label: 'Failing Scores' }
          ]} 
        />
      </div>

      <DataTable 
        columns={columns} 
        data={filtered} 
        loading={loading}
        pageSize={6}
      />
    </div>
  );
};

export default ResultsManagement;
