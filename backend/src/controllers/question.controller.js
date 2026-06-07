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
        subject: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // If for some reason a student is allowed here, hide correct answers
    const processedQuestions = questions.map(q => {
      if (role === 'STUDENT') {
        const { correctAnswer, ...rest } = q;
        return rest;
      }
      return q;
    });

    return successResponse(res, processedQuestions, 'Questions retrieved successfully');
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
        subject: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, fullName: true } }
      }
    });

    if (!question) return errorResponse(res, 'Question not found', 404);

    // Ownership check for teachers
    if (role === 'TEACHER' && question.createdById !== userId) {
      return errorResponse(res, 'Access denied. You can only view your own questions.', 403);
    }

    // Hide correct answer for students
    if (role === 'STUDENT') {
      const { correctAnswer, ...rest } = question;
      return successResponse(res, rest, 'Question retrieved successfully');
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

    // Validation
    if (!subjectId || !content || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return errorResponse(res, 'All fields are required', 400);
    }

    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      return errorResponse(res, 'Correct answer must be A, B, C, or D', 400);
    }

    if (difficulty && !['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      return errorResponse(res, 'Difficulty must be EASY, MEDIUM, or HARD', 400);
    }

    const subject = await prisma.subject.findUnique({ where: { id: parseInt(subjectId) } });
    if (!subject) {
      return errorResponse(res, 'Subject not found', 404);
    }

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
      },
      include: {
        subject: { select: { name: true } }
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
    
    // Ownership check
    if (existingQuestion.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied. You do not own this question.', 403);
    }

    // Validation if fields are provided
    if (correctAnswer && !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      return errorResponse(res, 'Correct answer must be A, B, C, or D', 400);
    }

    if (difficulty && !['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      return errorResponse(res, 'Difficulty must be EASY, MEDIUM, or HARD', 400);
    }

    if (subjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: parseInt(subjectId) } });
      if (!subject) return errorResponse(res, 'Subject not found', 404);
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
