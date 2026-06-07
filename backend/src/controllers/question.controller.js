import prisma from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getQuestions = async (req, res, next) => {
  try {
    const { subjectId, difficulty, search } = req.query;
    const { role, id: userId } = req.user;

    const where = {};
    if (role === 'TEACHER') {
      where.createdById = userId;
    }
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (difficulty) where.difficulty = difficulty;
    if (search) {
      where.content = { contains: search, mode: 'insensitive' };
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        subject: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, questions, 'Questions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (req, res, next) => {
  try {
    const questionId = parseInt(req.params.id);
    const { role, id: userId } = req.user;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        subject: { select: { name: true, code: true } }
      }
    });

    if (!question) return errorResponse(res, 'Question not found', 404);

    // Ownership check for teachers
    if (role === 'TEACHER' && question.createdById !== userId) {
      return errorResponse(res, 'Access denied. You can only view your own questions.', 403);
    }

    return successResponse(res, question, 'Question retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const { subjectId, content, optionA, optionB, optionC, optionD, correctAnswer, difficulty } = req.body;
    const userId = req.user.id;

    const question = await prisma.question.create({
      data: {
        subjectId: parseInt(subjectId),
        createdById: userId,
        content,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        difficulty: difficulty || 'EASY'
      }
    });

    return successResponse(res, question, 'Question created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const questionId = parseInt(req.params.id);
    const userId = req.user.id;
    const { subjectId, content, optionA, optionB, optionC, optionD, correctAnswer, difficulty } = req.body;

    const existingQuestion = await prisma.question.findUnique({ where: { id: questionId } });
    if (!existingQuestion) return errorResponse(res, 'Question not found', 404);
    if (existingQuestion.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        subjectId: subjectId ? parseInt(subjectId) : undefined,
        content,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        difficulty
      }
    });

    return successResponse(res, question, 'Question updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const questionId = parseInt(req.params.id);
    const userId = req.user.id;

    const existingQuestion = await prisma.question.findUnique({ where: { id: questionId } });
    if (!existingQuestion) return errorResponse(res, 'Question not found', 404);
    if (existingQuestion.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    await prisma.question.delete({ where: { id: questionId } });
    return successResponse(res, null, 'Question deleted successfully');
  } catch (error) {
    next(error);
  }
};
