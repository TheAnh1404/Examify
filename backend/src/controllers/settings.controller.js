import { successResponse, errorResponse } from '../utils/response.js';
import * as settingsService from '../services/settings.service.js';

export const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    return successResponse(res, {
      siteName: settings.siteName,
      registrationOpen: settings.registrationOpen,
      proctoringEnforced: settings.proctoringEnforced,
      tabFocusWarnings: settings.tabFocusWarnings
    }, 'Lấy cài đặt công khai thành công');
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    return successResponse(res, settings, 'Lấy cài đặt hệ thống thành công');
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const {
      siteName,
      contactEmail,
      registrationOpen,
      proctoringEnforced,
      tabFocusWarnings
    } = req.body;

    if (!siteName?.trim()) return errorResponse(res, 'Vui lòng nhập tên nền tảng', 400);
    if (!contactEmail?.trim()) return errorResponse(res, 'Vui lòng nhập email liên hệ', 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      return errorResponse(res, 'Email liên hệ không hợp lệ', 400);
    }
    if (typeof registrationOpen !== 'boolean' || typeof proctoringEnforced !== 'boolean') {
      return errorResponse(res, 'Cài đặt đăng ký và giám sát phải là giá trị boolean', 400);
    }

    const warningThreshold = Number(tabFocusWarnings);
    if (!Number.isInteger(warningThreshold) || warningThreshold < 1 || warningThreshold > 10) {
      return errorResponse(res, 'Ngưỡng cảnh báo chuyển tab phải nằm trong khoảng 1 đến 10', 400);
    }

    const settings = await settingsService.updateSettings({
      siteName: siteName.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      registrationOpen: Boolean(registrationOpen),
      proctoringEnforced: Boolean(proctoringEnforced),
      tabFocusWarnings: warningThreshold
    });

    return successResponse(res, settings, 'Cập nhật cài đặt hệ thống thành công');
  } catch (error) {
    next(error);
  }
};
