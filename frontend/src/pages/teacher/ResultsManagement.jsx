import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attemptService } from '../../services/attemptService';
import { settingsService } from '../../services/settingsService';
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
  const [warningThreshold, setWarningThreshold] = useState(3);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const [attemptResponse, settingsResponse] = await Promise.all([
          attemptService.getAll(),
          settingsService.getPublic()
        ]);
        setAttempts(attemptResponse.data);
        setWarningThreshold(settingsResponse.data.tabFocusWarnings);
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
          {row.score.toFixed(2)} / {row.examTotalMarks} pts
        </span>
      ) 
    },
    { 
      header: 'Status', 
      key: 'status', 
      render: (row) => (
        <Badge variant={row.status === 'Pass' ? 'success' : row.status === 'Fail' ? 'danger' : 'warning'}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: 'Focus Warnings', 
      key: 'tabFocusLosses', 
      render: (row) => (
        row.tabFocusLosses > 0 ? (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded border ${
            row.tabFocusLosses >= warningThreshold
              ? 'bg-danger-50 border-danger-100 text-danger-600'
              : 'bg-warning-50 border-warning-100 text-warning-600'
          }`}>
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
          {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'Not submitted'}
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
            { value: 'FAIL', label: 'Failing Scores' },
            { value: 'IN PROGRESS', label: 'In Progress' }
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
