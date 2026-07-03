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

export const settingsService = {
  get: () => handle(() => API.get('/settings'), 'Không thể tải cài đặt hệ thống'),
  getPublic: () => handle(() => API.get('/settings/public'), 'Không thể tải cài đặt công khai'),
  update: (settings) => handle(() => API.put('/settings', settings), 'Không thể cập nhật cài đặt hệ thống')
};
