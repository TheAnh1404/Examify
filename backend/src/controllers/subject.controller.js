import prisma from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: { questions: true, exams: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return successResponse(res, subjects, 'Subjects retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req, res, next) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        _count: {
          select: { questions: true, exams: true }
        }
      }
    });

    if (!subject) return errorResponse(res, 'Subject not found', 404);
    return successResponse(res, subject, 'Subject retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    const exists = await prisma.subject.findUnique({ where: { code } });
    if (exists) return errorResponse(res, 'Subject code already exists', 400);

    const subject = await prisma.subject.create({
      data: { name, code, description }
    });

    return successResponse(res, subject, 'Subject created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    const subjectId = parseInt(req.params.id);

    const subject = await prisma.subject.update({
      where: { id: subjectId },
      data: { name, code, description }
    });

    return successResponse(res, subject, 'Subject updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subjectId = parseInt(req.params.id);
    await prisma.subject.delete({ where: { id: subjectId } });
    return successResponse(res, null, 'Subject deleted successfully');
  } catch (error) {
    next(error);
  }
};
