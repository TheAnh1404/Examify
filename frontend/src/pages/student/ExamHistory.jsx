import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { attemptService } from '../../services/attemptService';
import { authService } from '../../services/authService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';
import { Eye, ShieldAlert, Award } from 'lucide-react';

const ExamHistory = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { id: 'usr-student' };

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const res = await attemptService.getByStudent(user.id);
        setAttempts(res.data);
      } catch (err) {
        console.error(err);
        setError('Không thể tải lịch sử làm bài.');
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      fetchAttempts();
    }
  }, [user.id]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Filter and search logic
  const filteredAttempts = attempts.filter(att => {
    const matchesSearch = att.examTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || att.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Bài thi',
      key: 'examTitle',
      render: (row) => (
        <div>
          <p className="font-semibold text-secondary-800 text-sm leading-snug">{row.examTitle}</p>
          <span className="text-[10px] text-secondary-400 font-semibold">{row.examId}</span>
        </div>
      )
    },
    {
      header: 'Ngày nộp',
      key: 'submittedAt',
      render: (row) => {
        const dateObj = new Date(row.submittedAt);
        return (
          <div>
            <p className="text-xs font-semibold text-secondary-700">
              {dateObj.toLocaleDateString('vi-VN', { dateStyle: 'medium' })}
            </p>
            <p className="text-[10px] text-secondary-400 mt-0.5">
              {dateObj.toLocaleTimeString('vi-VN', { timeStyle: 'short' })}
            </p>
          </div>
        );
      }
    },
    {
      header: 'Nhật ký giám sát',
      key: 'tabFocusLosses',
      render: (row) => (
        <span className={`text-xs font-semibold ${row.tabFocusLosses > 0 ? 'text-amber-600 font-bold' : 'text-secondary-400'}`}>
          {row.tabFocusLosses === 0 ? 'Không có cảnh báo' : `${row.tabFocusLosses} lần rời cửa sổ`}
        </span>
      )
    },
    {
      header: 'Điểm',
      key: 'score',
      render: (row) => {
        const pct = row.examTotalMarks > 0 ? (row.score / row.examTotalMarks) * 100 : 0;
        return (
          <div>
            <span className="text-sm font-bold text-secondary-800">
              {row.score} <span className="text-secondary-400 text-xs font-normal">/ {row.examTotalMarks}</span>
            </span>
            <p className="text-[10px] text-secondary-400 font-semibold mt-0.5">({pct.toFixed(0)}%)</p>
          </div>
        );
      }
    },
    {
      header: 'Kết quả',
      key: 'status',
      render: (row) => {
        const status = row.status.toUpperCase();
        return status === 'PASS' ? (
          <Badge variant="success">Đạt</Badge>
        ) : (
          <Badge variant="danger">Chưa đạt</Badge>
        );
      }
    },
    {
      header: 'Thao tác',
      key: 'actions',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/student/results/${row.id}`)}
          icon={<Eye className="h-3.5 w-3.5" />}
        >
          Xem kết quả
        </Button>
      )
    }
  ];

  if (loading) return <Loading message="Đang tải lịch sử nộp bài..." />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Lịch sử làm bài"
        subtitle="Xem các lượt nộp bài, kết quả chấm điểm và cảnh báo giám sát."
      />

      {error ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-3">
          <ShieldAlert className="h-5 w-5" />
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Filters card */}
          <Card>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <SearchBox 
                value={search}
                onChange={handleSearchChange}
                placeholder="Tìm bài thi theo tiêu đề..."
              />
              <FilterBar 
                value={statusFilter}
                onChange={handleFilterChange}
                options={[
                  { value: 'ALL', label: 'Tất cả kết quả' },
                  { value: 'PASS', label: 'Chỉ bài đạt' },
                  { value: 'FAIL', label: 'Chỉ bài chưa đạt' }
                ]}
                label="Kết quả:"
              />
            </div>
          </Card>

          {/* Table */}
          <DataTable 
            columns={columns}
            data={filteredAttempts}
            pageSize={10}
            emptyMessage="Không có lượt làm bài nào khớp với tiêu chí tìm kiếm."
          />
        </div>
      )}
    </div>
  );
};

export default ExamHistory;
