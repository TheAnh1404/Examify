import prisma from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import {
  assertSubjectAccess,
  toQuestionData,
  validateQuestionInput
} from '../services/teacherSubject.service.js';

export const getQuestions = async (req, res, next) => {
  try {
    const { subjectId, difficulty, search } = req.query;
    const { role, id: userId } = req.user;

    const where = {};
    if (role === 'TEACHER') {
      where.createdById = userId;
      where.subject = { teacherAssignments: { some: { teacherId: userId } } };
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
    if (role === 'TEACHER') await assertSubjectAccess(req.user, question.subjectId);

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
    const { subjectId, content, optionA, optionB, optionC, optionD, correctAnswer, difficulty, defaultPoint } = req.body;
    const userId = req.user.id;
    const questionInput = { subjectId, content, optionA, optionB, optionC, optionD, correctAnswer, difficulty, defaultPoint };

    try {
      validateQuestionInput(questionInput);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
    await assertSubjectAccess(req.user, subjectId);

    const question = await prisma.question.create({
      data: toQuestionData(questionInput, userId),
      include: {
        subject: { select: { id: true, name: true, code: true } }
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
    const { subjectId, content, optionA, optionB, optionC, optionD, correctAnswer, difficulty, defaultPoint } = req.body;

    const existingQuestion = await prisma.question.findUnique({ where: { id: questionId } });
    if (!existingQuestion) return errorResponse(res, 'Question not found', 404);
    
    // Ownership check
    if (existingQuestion.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied. You do not own this question.', 403);
    }
    await assertSubjectAccess(req.user, subjectId || existingQuestion.subjectId);

    // Validation if fields are provided
    if (correctAnswer && !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      return errorResponse(res, 'Correct answer must be A, B, C, or D', 400);
    }

    if (difficulty && !['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
      return errorResponse(res, 'Difficulty must be EASY, MEDIUM, or HARD', 400);
    }

    if (subjectId) {
      await assertSubjectAccess(req.user, subjectId);
    }
    if (defaultPoint !== undefined && (!Number.isFinite(Number(defaultPoint)) || Number(defaultPoint) <= 0)) {
      return errorResponse(res, 'Question point must be greater than 0', 400);
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
        difficulty,
        defaultPoint: defaultPoint !== undefined ? Number(defaultPoint) : undefined
      }
    });

    return successResponse(res, question, 'Question updated successfully');
  } catch (error) {
    next(error);
  }
};

export const createQuestionsBulk = async (req, res, next) => {
  try {
    const questions = req.body.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      return errorResponse(res, 'Questions must be a non-empty array', 400);
    }
    if (questions.length > 100) {
      return errorResponse(res, 'A maximum of 100 questions can be created at once', 400);
    }

    try {
      questions.forEach(validateQuestionInput);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }

    for (const subjectId of [...new Set(questions.map(question => Number(question.subjectId)))]) {
      await assertSubjectAccess(req.user, subjectId);
    }

    const created = await prisma.$transaction(async (tx) => {
      const records = [];
      for (const question of questions) {
        records.push(await tx.question.create({
          data: toQuestionData(question, req.user.id),
          include: { subject: { select: { id: true, name: true, code: true } } }
        }));
      }
      return records;
    });

    return successResponse(res, created, `${created.length} questions created successfully`, 201);
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
    await assertSubjectAccess(req.user, existingQuestion.subjectId);

    const usageCount = await prisma.examQuestion.count({ where: { questionId } });
    if (usageCount > 0) {
      return errorResponse(res, 'Cannot delete a question that is linked to an exam', 409);
    }

    await prisma.question.delete({ where: { id: questionId } });
    return successResponse(res, null, 'Question deleted successfully');
  } catch (error) {
    next(error);
  }
};
