import API from './api';
import { getApiErrorMessage, toUserView } from './serviceUtils';

const handle = async (request, fallback) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, fallback), { cause: error });
  }
};

export const userService = {
  getAll: async (params = {}) => {
    const result = await handle(() => API.get('/users', { params }), 'Failed to fetch users');
    return { ...result, data: result.data.map(toUserView) };
  },

  getById: async (id) => {
    const result = await handle(() => API.get(`/users/${id}`), 'Failed to fetch user');
    return { ...result, data: toUserView(result.data) };
  },

  create: async (userData) => {
    const result = await handle(() => API.post('/users', {
      fullName: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      teachingAssignments: userData.teachingAssignments || []
    }), 'Failed to create user');
    return { ...result, data: toUserView(result.data) };
  },

  update: async (id, userData) => {
    const result = await handle(() => API.put(`/users/${id}`, {
      fullName: userData.name,
      email: userData.email,
      password: userData.password || undefined,
      role: userData.role,
      status: userData.status
    }), 'Failed to update user');
    return { ...result, data: toUserView(result.data) };
  },

  updateStatus: async (id, status) => {
    const result = await handle(() => API.patch(`/users/${id}/status`, { status }), 'Failed to update user status');
    return result;
  },

  getTeachingSubjects: async (id) => {
    const result = await handle(() => API.get(`/users/${id}/teaching-subjects`), 'Failed to fetch teaching subjects');
    return {
      ...result,
      data: result.data.map((assignment) => ({
        ...assignment,
        subjectId: String(assignment.subjectId),
        subject: { ...assignment.subject, id: String(assignment.subject.id) }
      }))
    };
  },

  updateTeachingSubjects: async (id, assignments) => {
    return handle(() => API.put(`/users/${id}/teaching-subjects`, { assignments }), 'Failed to update teaching subjects');
  },

  updateProfile: async (profileData) => {
    const result = await handle(() => API.put('/users/profile', {
      fullName: profileData.fullName,
      avatarUrl: profileData.avatarUrl,
      schoolName: profileData.schoolName,
      password: profileData.password || undefined
    }), 'Failed to update profile');
    return { ...result, data: toUserView(result.data) };
  },

  delete: async (id) => {
    return handle(() => API.delete(`/users/${id}`), 'Failed to delete user');
  }
};
