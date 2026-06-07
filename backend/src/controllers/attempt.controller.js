import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import * as gradingService from '../services/grading.service.js';

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
      return errorResponse(res, 'Exam not available', 403);
    }

    // Access control for PRIVATE exams
    if (exam.visibility === 'PRIVATE') {
      const assigned = await prisma.examStudent.findUnique({
        where: { examId_studentId: { examId: parseInt(examId), studentId } }
      });
      if (!assigned && req.user.role === 'STUDENT') {
        return errorResponse(res, 'Access denied. You are not assigned to this private exam.', 403);
      }
    }

    // Password protection check
    if (exam.accessPasswordHash) {
      if (!accessPassword) {
        return errorResponse(res, 'Access password required', 403);
      }
      const isMatch = await bcrypt.compare(accessPassword, exam.accessPasswordHash);
      if (!isMatch) {
        return errorResponse(res, 'Invalid access password', 403);
      }
    }

    // Check if student already has an in-progress attempt for this exam
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: { examId: parseInt(examId), studentId, status: 'IN_PROGRESS' }
    });

    if (existingAttempt) {
      return successResponse(res, existingAttempt, 'Resuming existing attempt');
    }

    const attempt = await prisma.examAttempt.create({
      data: {
        examId: parseInt(examId),
        studentId,
        totalQuestions: exam._count.examQuestions,
        status: 'IN_PROGRESS'
      }
    });

    return successResponse(res, attempt, 'Exam attempt started', 201);
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
      return errorResponse(res, 'Attempt not found or already submitted', 400);
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
    return successResponse(res, null, 'Answers saved successfully');
  } catch (error) {
    next(error);
  }
};

export const submitAttempt = async (req, res, next) => {
  try {
    const attemptId = parseInt(req.params.id);
    const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } });

    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      return errorResponse(res, 'Attempt not found or already submitted', 400);
    }

    const result = await gradingService.gradeAttempt(attemptId);
    return successResponse(res, result, 'Exam submitted and graded successfully');
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

    if (!attempt) return errorResponse(res, 'Attempt not found', 404);

    // Security check: only the student who took it, or teacher/admin
    if (req.user.role === 'STUDENT' && attempt.studentId !== req.user.id) {
      return errorResponse(res, 'Access denied', 403);
    }

    return successResponse(res, attempt, 'Attempt result retrieved');
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

    return successResponse(res, history, 'Student history retrieved');
  } catch (error) {
    next(error);
  }
};

export const getAllAttempts = async (req, res, next) => {
  try {
    const attempts = await prisma.examAttempt.findMany({
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

    return successResponse(res, attempts, 'All exam attempts retrieved');
  } catch (error) {
    next(error);
  }
};
