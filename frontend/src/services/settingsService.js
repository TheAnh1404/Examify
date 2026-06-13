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
  get: () => handle(() => API.get('/settings'), 'Failed to load system settings'),
  getPublic: () => handle(() => API.get('/settings/public'), 'Failed to load public settings'),
  update: (settings) => handle(() => API.put('/settings', settings), 'Failed to update system settings')
};
