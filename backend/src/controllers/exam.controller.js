import prisma from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getExams = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const { status, subjectId } = req.query;

    const where = {};
    if (role === 'STUDENT') {
      where.status = 'PUBLISHED';
    } else if (role === 'TEACHER') {
      where.createdById = userId;
    }

    if (status) where.status = status;
    if (subjectId) where.subjectId = parseInt(subjectId);

    const exams = await prisma.exam.findMany({
      where,
      include: {
        subject: { select: { name: true, code: true } },
        createdBy: { select: { fullName: true } },
        _count: { select: { examQuestions: true, attempts: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, exams, 'Exams retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getExamById = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const { role, id: userId } = req.user;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        subject: { select: { name: true, code: true } },
        createdBy: { select: { fullName: true } },
        examQuestions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                difficulty: true,
                correctAnswer: role !== 'STUDENT' // Hide correct answer from students
              }
            }
          },
          orderBy: { questionOrder: 'asc' }
        }
      }
    });

    if (!exam) return errorResponse(res, 'Exam not found', 404);

    if (role === 'STUDENT' && exam.status !== 'PUBLISHED') {
      return errorResponse(res, 'This exam is not available.', 403);
    }

    if (role === 'TEACHER' && exam.createdById !== userId) {
      return errorResponse(res, 'Access denied.', 403);
    }

    return successResponse(res, exam, 'Exam retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const { subjectId, title, description, durationMinutes, startTime, endTime } = req.body;
    const userId = req.user.id;

    const exam = await prisma.exam.create({
      data: {
        subjectId: parseInt(subjectId),
        createdById: userId,
        title,
        description,
        durationMinutes: parseInt(durationMinutes),
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        status: 'DRAFT'
      }
    });

    return successResponse(res, exam, 'Exam created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const userId = req.user.id;
    const { subjectId, title, description, durationMinutes, startTime, endTime, status } = req.body;

    const existingExam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!existingExam) return errorResponse(res, 'Exam not found', 404);
    if (existingExam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    const exam = await prisma.exam.update({
      where: { id: examId },
      data: {
        subjectId: subjectId ? parseInt(subjectId) : undefined,
        title,
        description,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        status
      }
    });

    return successResponse(res, exam, 'Exam updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const userId = req.user.id;

    const existingExam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!existingExam) return errorResponse(res, 'Exam not found', 404);
    if (existingExam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    await prisma.exam.delete({ where: { id: examId } });
    return successResponse(res, null, 'Exam deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const addQuestionToExam = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const { questionId, point, questionOrder } = req.body;

    const examQuestion = await prisma.examQuestion.create({
      data: {
        examId,
        questionId: parseInt(questionId),
        point: point || 1.0,
        questionOrder
      }
    });

    return successResponse(res, examQuestion, 'Question added to exam');
  } catch (error) {
    next(error);
  }
};

export const removeQuestionFromExam = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const questionId = parseInt(req.params.questionId);

    await prisma.examQuestion.delete({
      where: {
        examId_questionId: { examId, questionId }
      }
    });

    return successResponse(res, null, 'Question removed from exam');
  } catch (error) {
    next(error);
  }
};

export const publishExam = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);

    // Check if exam has questions
    const questionCount = await prisma.examQuestion.count({ where: { examId } });
    if (questionCount === 0) {
      return errorResponse(res, 'Cannot publish exam without questions', 400);
    }

    const exam = await prisma.exam.update({
      where: { id: examId },
      data: { status: 'PUBLISHED' }
    });

    return successResponse(res, exam, 'Exam published successfully');
  } catch (error) {
    next(error);
  }
};

export const closeExam = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const exam = await prisma.exam.update({
      where: { id: examId },
      data: { status: 'CLOSED' }
    });
    return successResponse(res, exam, 'Exam closed successfully');
  } catch (error) {
    next(error);
  }
};
