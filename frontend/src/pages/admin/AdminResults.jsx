import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { attemptService } from '../../services/attemptService';
import { settingsService } from '../../services/settingsService';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';
import { AlertTriangle, ShieldAlert, FileSpreadsheet, User, BookOpen, Eye } from 'lucide-react';

const AdminResults = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [warningThreshold, setWarningThreshold] = useState(3);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const [attemptResponse, settingsResponse] = await Promise.all([
          attemptService.getAll(),
          settingsService.get()
        ]);
        setAttempts(attemptResponse.data);
        setWarningThreshold(settingsResponse.data.tabFocusWarnings);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch system attempts gradebook.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

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
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-secondary-50 text-secondary-400 flex items-center justify-center border border-secondary-100">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-secondary-900">{row.studentName}</p>
            <p className="text-xs text-secondary-400 font-medium">{row.studentEmail}</p>
          </div>
        </div>
      ) 
    },
    { 
      header: 'Examination', 
      key: 'examTitle',
      render: (row) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary-500" />
          <span className="font-bold text-secondary-800">{row.examTitle}</span>
        </div>
      )
    },
    { 
      header: 'Performance', 
      key: 'score', 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-secondary-900">
            {row.score.toFixed(2)} / {row.examTotalMarks} pts
          </span>
          <span className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest">
            {row.scorePercentage}% Accuracy
          </span>
        </div>
      ) 
    },
    { 
      header: 'Status', 
      key: 'status', 
      render: (row) => (
        <Badge variant={row.status === 'Pass' ? 'success' : row.status === 'Fail' ? 'danger' : 'warning'} dot>
          {row.status}
        </Badge>
      ) 
    },
    { 
      header: 'Security Logs', 
      key: 'tabFocusLosses', 
      render: (row) => (
        row.tabFocusLosses >= warningThreshold ? (
          <Badge variant="danger" className="lowercase">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {row.tabFocusLosses} flagged
          </Badge>
        ) : row.tabFocusLosses > 0 ? (
          <Badge variant="warning">{row.tabFocusLosses} warnings</Badge>
        ) : (
          <Badge variant="slate">Secure</Badge>
        )
      ) 
    },
    { 
      header: 'Submitted', 
      key: 'submittedAt', 
      render: (row) => (
        <span className="text-secondary-500 font-bold text-xs">
          {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : 'Not submitted'}
        </span>
      ) 
    },
    {
      header: '',
      key: 'actions',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/admin/results/${row.id}`)}
          icon={<Eye className="h-4 w-4" />}
          aria-label={`View ${row.studentName}'s attempt`}
        />
      )
    }
  ];

  const exportCsv = () => {
    const header = ['Student', 'Email', 'Exam', 'Score', 'Score Percentage', 'Status', 'Focus Losses', 'Submitted At'];
    const rows = filteredAttempts.map((attempt) => [
      attempt.studentName,
      attempt.studentEmail,
      attempt.examTitle,
      attempt.score,
      `${attempt.scorePercentage}%`,
      attempt.status,
      attempt.tabFocusLosses,
      attempt.submittedAt || ''
    ]);
    const escape = (value) => `"${String(value).replaceAll('"', '""')}"`;
    const blob = new Blob([[header, ...rows].map((row) => row.map(escape).join(',')).join('\n')], {
      type: 'text/csv;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `examify-results-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading message="Fetching student gradebook..." />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="h1 mb-1">Submissions Log</h1>
          <p className="p">Review student scorecard entries and proctoring security logs globally.</p>
        </div>
        <Button variant="outline" icon={<FileSpreadsheet className="h-4 w-4" />} onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      {error && (
        <div className="p-6 rounded-2xl bg-danger-50 border border-danger-100 text-danger-700 flex items-center gap-4">
          <ShieldAlert className="h-6 w-6 shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <SearchBox 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search student or exam..." 
        />
        
        <FilterBar 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          label="Status:"
          options={[
            { value: 'ALL', label: 'All Results' },
            { value: 'PASS', label: 'Passing Only' },
            { value: 'FAIL', label: 'Failing Only' },
            { value: 'IN PROGRESS', label: 'In Progress' }
          ]} 
        />
      </div>

      {/* Grid listing */}
      <DataTable 
        columns={columns} 
        data={filteredAttempts} 
        pageSize={10} 
        emptyMessage="No student attempts match the current filters."
      />
    </div>
  );
};

export default AdminResults;
