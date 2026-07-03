export const roleLabels = {
  ADMIN: 'Quản trị viên',
  TEACHER: 'Giáo viên',
  STUDENT: 'Học sinh',
  admin: 'Quản trị viên',
  teacher: 'Giáo viên',
  student: 'Học sinh'
};

export const statusLabels = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Đã khóa',
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Đã công bố',
  CLOSED: 'Đã đóng',
  PUBLIC: 'Công khai',
  PRIVATE: 'Riêng tư',
  PASS: 'Đạt',
  Pass: 'Đạt',
  pass: 'Đạt',
  PASSED: 'Đạt',
  Passed: 'Đạt',
  FAILED: 'Chưa đạt',
  FAIL: 'Chưa đạt',
  Fail: 'Chưa đạt',
  fail: 'Chưa đạt',
  Available: 'Có thể làm',
  AVAILABLE: 'Có thể làm',
  Attempted: 'Đã làm',
  UPCOMING: 'Sắp diễn ra',
  Upcoming: 'Sắp diễn ra',
  COMPLETED: 'Đã hoàn thành',
  Completed: 'Đã hoàn thành',
  PENDING: 'Đang chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
  SUBMITTED: 'Đã nộp',
  'IN PROGRESS': 'Đang làm',
  'In Progress': 'Đang làm',
  IN_PROGRESS: 'Đang làm'
};

export const difficultyLabels = {
  EASY: 'Dễ',
  Easy: 'Dễ',
  easy: 'Dễ',
  MEDIUM: 'Trung bình',
  Medium: 'Trung bình',
  medium: 'Trung bình',
  HARD: 'Khó',
  Hard: 'Khó',
  hard: 'Khó'
};

export const formatRole = (role) => roleLabels[role] || roleLabels[String(role || '').toUpperCase()] || role;

export const formatStatus = (status) => statusLabels[status] || statusLabels[String(status || '').toUpperCase()] || status;

export const formatDifficulty = (difficulty) => (
  difficultyLabels[difficulty] || difficultyLabels[String(difficulty || '').toUpperCase()] || difficulty
);
