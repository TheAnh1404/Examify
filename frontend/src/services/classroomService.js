import API from './api';
import { getApiErrorMessage } from './serviceUtils';

const handle = async (request, fallback) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallback), { cause: error });
  }
};

const toClassroomView = (classroom) => ({
  ...classroom,
  id: String(classroom.id),
  subjectId: String(classroom.subjectId),
  teacherId: String(classroom.teacherId),
  studentCount: classroom._count?.students ?? 0,
  examCount: classroom._count?.exams ?? 0
});

export const classroomService = {
  getAll: async (params = {}) => {
    const result = await handle(() => API.get('/classrooms', { params }), 'Không thể tải danh sách lớp học');
    return { ...result, data: result.data.map(toClassroomView) };
  },

  getById: async (id) => {
    const result = await handle(() => API.get(`/classrooms/${id}`), 'Không thể tải chi tiết lớp học');
    return { ...result, data: toClassroomView(result.data) };
  },

  create: async (data) => {
    const result = await handle(() => API.post('/classrooms', data), 'Không thể tạo lớp học');
    return { ...result, data: toClassroomView(result.data) };
  },

  update: async (id, data) => {
    const result = await handle(() => API.put(`/classrooms/${id}`, data), 'Không thể cập nhật lớp học');
    return { ...result, data: toClassroomView(result.data) };
  },

  delete: async (id) => {
    return handle(() => API.delete(`/classrooms/${id}`), 'Không thể xóa lớp học');
  },

  addStudent: async (classId, { studentEmail, studentId }) => {
    return handle(() => API.post(`/classrooms/${classId}/students`, { studentEmail, studentId }), 'Không thể thêm học sinh');
  },

  searchStudents: async (query) => {
    return handle(() => API.get('/classrooms/search-students', { params: { query } }), 'Không thể tìm học sinh');
  },

  removeStudent: async (classId, studentId) => {
    return handle(() => API.delete(`/classrooms/${classId}/students/${studentId}`), 'Không thể xóa học sinh khỏi lớp');
  },

  // API yêu cầu tham gia lớp
  checkCode: async (code) => {
    return handle(() => API.get(`/classrooms/check-code/${code}`), 'Không thể kiểm tra mã lớp');
  },

  enrollRequest: async (data) => {
    return handle(() => API.post('/classrooms/enroll', data), 'Không thể gửi yêu cầu tham gia');
  },

  getMyRequests: async () => {
    return handle(() => API.get('/classrooms/my-requests'), 'Không thể tải yêu cầu tham gia');
  },

  getEnrollmentRequests: async (classId, params = {}) => {
    return handle(() => API.get(`/classrooms/${classId}/enrollments`, { params }), 'Không thể tải yêu cầu ghi danh');
  },

  updateEnrollmentStatus: async (requestId, data) => {
    return handle(() => API.patch(`/classrooms/enrollments/${requestId}`, data), 'Không thể cập nhật trạng thái ghi danh');
  }
};

