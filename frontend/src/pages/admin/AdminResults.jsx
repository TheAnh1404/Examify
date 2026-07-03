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
import { formatStatus } from '../../utils/i18n';

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
        setError('Không thể tải sổ điểm toàn hệ thống.');
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
      header: 'Học sinh',
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
      header: 'Bài thi',
      key: 'examTitle',
      render: (row) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary-500" />
          <span className="font-bold text-secondary-800">{row.examTitle}</span>
        </div>
      )
    },
    { 
      header: 'Kết quả',
      key: 'score', 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-secondary-900">
            {row.score.toFixed(2)} / {row.examTotalMarks} điểm
          </span>
          <span className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest">
            Độ chính xác {row.scorePercentage}%
          </span>
        </div>
      ) 
    },
    { 
      header: 'Trạng thái',
      key: 'status', 
      render: (row) => (
        <Badge variant={row.status === 'Pass' ? 'success' : row.status === 'Fail' ? 'danger' : 'warning'} dot>
          {formatStatus(row.status)}
        </Badge>
      ) 
    },
    { 
      header: 'Nhật ký giám sát',
      key: 'tabFocusLosses', 
      render: (row) => (
        row.tabFocusLosses >= warningThreshold ? (
          <Badge variant="danger" className="lowercase">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {row.tabFocusLosses} cảnh báo
          </Badge>
        ) : row.tabFocusLosses > 0 ? (
          <Badge variant="warning">{row.tabFocusLosses} cảnh báo</Badge>
        ) : (
          <Badge variant="slate">An toàn</Badge>
        )
      ) 
    },
    { 
      header: 'Đã nộp',
      key: 'submittedAt', 
      render: (row) => (
        <span className="text-secondary-500 font-bold text-xs">
          {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : 'Chưa nộp'}
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
          aria-label={`Xem lượt làm bài của ${row.studentName}`}
        />
      )
    }
  ];

  const exportCsv = () => {
    const header = ['Học sinh', 'Email', 'Bài thi', 'Điểm', 'Tỷ lệ điểm', 'Trạng thái', 'Lượt mất tập trung', 'Thời điểm nộp'];
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
      <Loading message="Đang tải sổ điểm học sinh..." />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="h1 mb-1">Nhật ký nộp bài</h1>
          <p className="p">Xem điểm số học sinh và nhật ký giám sát trên toàn hệ thống.</p>
        </div>
        <Button variant="outline" icon={<FileSpreadsheet className="h-4 w-4" />} onClick={exportCsv}>
          Xuất CSV
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
          placeholder="Tìm học sinh hoặc bài thi..."
        />
        
        <FilterBar 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          label="Trạng thái:"
          options={[
            { value: 'ALL', label: 'Tất cả kết quả' },
            { value: 'PASS', label: 'Chỉ bài đạt' },
            { value: 'FAIL', label: 'Chỉ bài chưa đạt' },
            { value: 'IN PROGRESS', label: 'Đang làm' }
          ]} 
        />
      </div>

      {/* Grid listing */}
      <DataTable 
        columns={columns} 
        data={filteredAttempts} 
        pageSize={10} 
        emptyMessage="Không có lượt làm bài nào khớp với bộ lọc."
      />
    </div>
  );
};

export default AdminResults;
