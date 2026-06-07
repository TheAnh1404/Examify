import React, { useEffect, useState } from 'react';
import { attemptService } from '../../services/attemptService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

const AdminResults = () => {
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
        const res = await attemptService.getAll();
        setAttempts(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch system attempts gradebook.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  // Filter lists
  const filteredAttempts = attempts.filter((att) => {
    const matchesSearch = 
      att.studentName.toLowerCase().includes(search.toLowerCase()) || 
      att.examTitle.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || att.status.toUpperCase() === statusFilter.toUpperCase();
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
        <span className="font-mono font-bold text-secondary-805">
          {row.score} / {row.examTotalMarks} pts
        </span>
      ) 
    },
    { 
      header: 'Status', 
      key: 'status', 
      render: (row) => (
        <Badge variant={row.status.toUpperCase() === 'PASS' ? 'success' : 'danger'}>
          {row.status}
        </Badge>
      ) 
    },
    { 
      header: 'Security Proctor Logs', 
      key: 'tabFocusLosses', 
      render: (row) => (
        row.tabFocusLosses > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-amber-50 border border-amber-100 text-amber-600 font-sans">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {row.tabFocusLosses} Tab Violations
          </span>
        ) : (
          <span className="text-xs text-secondary-400 font-medium">Secure</span>
        )
      ) 
    },
    { 
      header: 'Submission Date', 
      key: 'submittedAt', 
      render: (row) => (
        <span className="text-secondary-450 text-xs">
          {new Date(row.submittedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="SaaS Submissions Log" 
        subtitle="Review student scorecard entries and security logs globally."
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
          <ShieldAlert className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-secondary-200 rounded-xl p-4 shadow-sm shrink-0">
        <SearchBox 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search by student name or exam..." 
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

      {/* Grid listing */}
      <DataTable 
        columns={columns} 
        data={filteredAttempts} 
        loading={loading}
        pageSize={6} 
        emptyMessage="No student attempts match the search filter."
      />
    </div>
  );
};

export default AdminResults;
