import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import * as gradingService from '../services/grading.service.js';
import * as settingsService from '../services/settings.service.js';

export const startAttempt = async (req, res, next) => {
  try {
    const { examId, accessPassword } = req.body;
    const studentId = req.user.id;

    // Check if exam exists and its status
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      include: { 
        _count: { select: { examQuestions: true } }
      }
    });

    if (!exam || exam.status !== 'PUBLISHED') {
      return errorResponse(res, 'Bài thi hiện không khả dụng', 403);
    }

    // Access control for PRIVATE exams
    if (exam.visibility === 'PRIVATE') {
      const assigned = await prisma.examStudent.findUnique({
        where: { examId_studentId: { examId: parseInt(examId), studentId } }
      });
      if (!assigned && req.user.role === 'STUDENT') {
        return errorResponse(res, 'Bạn không có quyền truy cập. Bạn chưa được phân công làm bài thi riêng tư này.', 403);
      }
    }

    // Password protection check
    if (exam.accessPasswordHash) {
      if (!accessPassword) {
        return errorResponse(res, 'Vui lòng nhập mật khẩu truy cập', 403);
      }
      const isMatch = await bcrypt.compare(accessPassword, exam.accessPasswordHash);
      if (!isMatch) {
        return errorResponse(res, 'Mật khẩu truy cập không đúng', 403);
      }
    }

    // Check if student already has an in-progress attempt for this exam
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: { examId: parseInt(examId), studentId, status: 'IN_PROGRESS' },
      include: { answers: true }
    });

    if (existingAttempt) {
      return successResponse(res, existingAttempt, 'Tiếp tục lượt làm bài hiện có');
    }

    const attempt = await prisma.examAttempt.create({
      data: {
        examId: parseInt(examId),
        studentId,
        totalQuestions: exam._count.examQuestions,
        status: 'IN_PROGRESS'
      }
    });

    return successResponse(res, attempt, 'Bắt đầu lượt làm bài thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const saveAnswers = async (req, res, next) => {
  try {
    const attemptId = parseInt(req.params.id);
    const { answers } = req.body; // Array of { questionId, selectedAnswer }

    const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      return errorResponse(res, 'Không tìm thấy lượt làm bài hoặc bài đã được nộp', 400);
    }
    if (attempt.studentId !== req.user.id) {
      return errorResponse(res, 'Bạn không có quyền truy cập', 403);
    }

    const upsertPromises = answers.map(ans => {
      return prisma.studentAnswer.upsert({
        where: {
          attemptId_questionId: { attemptId, questionId: parseInt(ans.questionId) }
        },
        update: { selectedAnswer: ans.selectedAnswer },
        create: {
          attemptId,
          questionId: parseInt(ans.questionId),
          selectedAnswer: ans.selectedAnswer
        }
      });
    });

    await Promise.all(upsertPromises);
    return successResponse(res, null, 'Lưu câu trả lời thành công');
  } catch (error) {
    next(error);
  }
};

export const submitAttempt = async (req, res, next) => {
  try {
    const attemptId = parseInt(req.params.id);
    const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } });

    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      return errorResponse(res, 'Không tìm thấy lượt làm bài hoặc bài đã được nộp', 400);
    }
    if (attempt.studentId !== req.user.id) {
      return errorResponse(res, 'Bạn không có quyền truy cập', 403);
    }

    const settings = await settingsService.getSettings();
    const tabFocusLosses = settings.proctoringEnforced
      ? Math.max(0, parseInt(req.body.tabFocusLosses || 0))
      : 0;

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: { tabFocusLosses }
    });

    const result = await gradingService.gradeAttempt(attemptId);
    return successResponse(res, result, 'Nộp bài và chấm điểm thành công');
  } catch (error) {
    next(error);
  }
};

export const getAttemptResult = async (req, res, next) => {
  try {
    const attemptId = parseInt(req.params.id);
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        student: { select: { fullName: true, email: true } },
        exam: {
          include: {
            subject: true,
            examQuestions: {
              include: {
                question: true
              }
            }
          }
        },
        answers: true
      }
    });

    if (!attempt) return errorResponse(res, 'Không tìm thấy lượt làm bài', 404);

    // Security check: only the student who took it, or teacher/admin
    if (req.user.role === 'STUDENT' && attempt.studentId !== req.user.id) {
      return errorResponse(res, 'Bạn không có quyền truy cập', 403);
    }
    if (req.user.role === 'TEACHER' && attempt.exam.createdById !== req.user.id) {
      return errorResponse(res, 'Bạn không có quyền truy cập', 403);
    }

    return successResponse(res, attempt, 'Lấy kết quả làm bài thành công');
  } catch (error) {
    next(error);
  }
};

export const getStudentHistory = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const history = await prisma.examAttempt.findMany({
      where: { studentId },
      include: {
        exam: {
          include: { subject: true }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    return successResponse(res, history, 'Lấy lịch sử làm bài của học sinh thành công');
  } catch (error) {
    next(error);
  }
};

export const getAllAttempts = async (req, res, next) => {
  try {
    const where = req.user.role === 'TEACHER'
      ? { exam: { createdById: req.user.id } }
      : {};
    const attempts = await prisma.examAttempt.findMany({
      where,
      include: {
        student: { select: { fullName: true, email: true } },
        exam: {
          include: {
            examQuestions: true
          }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    return successResponse(res, attempts, 'Lấy danh sách lượt làm bài thành công');
  } catch (error) {
    next(error);
  }
};
