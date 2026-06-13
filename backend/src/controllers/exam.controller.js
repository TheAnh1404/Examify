import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import {
  assertSubjectAccess,
  toQuestionData,
  validateQuestionInput
} from '../services/teacherSubject.service.js';

export const getExams = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const { status, subjectId } = req.query;

    const where = {};
    if (role === 'STUDENT') {
      where.status = 'PUBLISHED';
      where.OR = [
        { visibility: 'PUBLIC' },
        { assignedStudents: { some: { studentId: userId } } },
        { assignedClassrooms: { some: { classroom: { students: { some: { studentId: userId } } } } } }
      ];
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
        examQuestions: { select: { point: true } },
        _count: { select: { examQuestions: true, attempts: true, assignedStudents: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform response to include computed fields
    const data = exams.map(exam => {
      const { accessPasswordHash, _count, ...rest } = exam;
      return {
        ...rest,
        hasAccessPassword: !!accessPasswordHash,
        totalQuestions: _count.examQuestions,
        totalAttempts: _count.attempts,
        assignedStudentCount: _count.assignedStudents
      };
    });

    return successResponse(res, data, 'Exams retrieved successfully');
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
        subject: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, fullName: true } },
        _count: { select: { assignedStudents: true, assignedClassrooms: true } },
        assignedClassrooms: {
          include: { classroom: { select: { id: true, name: true, code: true } } }
        },
        examQuestions: {
          include: {
            question: {
              select: {
                id: true,
                subjectId: true,
                content: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                difficulty: true,
                defaultPoint: true,
                correctAnswer: role !== 'STUDENT'
              }
            }
          },
          orderBy: { questionOrder: 'asc' }
        }
      }
    });

    if (!exam) return errorResponse(res, 'Exam not found', 404);

    if (role === 'STUDENT') {
      if (exam.status !== 'PUBLISHED') {
        return errorResponse(res, 'This exam is not available.', 403);
      }
      if (exam.visibility === 'PRIVATE') {
        const assigned = await prisma.examStudent.findUnique({
          where: { examId_studentId: { examId, studentId: userId } }
        });
        if (!assigned) return errorResponse(res, 'You are not assigned to this exam.', 403);
      }
    }

    if (role === 'TEACHER' && exam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    const { accessPasswordHash, _count, ...rest } = exam;
    return successResponse(res, {
      ...rest,
      hasAccessPassword: !!accessPasswordHash,
      assignedStudentCount: _count.assignedStudents
    }, 'Exam retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const { subjectId, title, description, durationMinutes, passPercentage, startTime, endTime, visibility, accessPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title) return errorResponse(res, 'Title is required', 400);
    if (!subjectId) return errorResponse(res, 'Subject ID is required', 400);
    
    if (durationMinutes !== undefined && parseInt(durationMinutes) <= 0) {
      return errorResponse(res, 'Duration must be greater than 0 minutes', 400);
    }
    if (passPercentage !== undefined && (parseInt(passPercentage) < 0 || parseInt(passPercentage) > 100)) {
      return errorResponse(res, 'Pass percentage must be between 0 and 100', 400);
    }

    if (visibility && !['PUBLIC', 'PRIVATE'].includes(visibility)) {
      return errorResponse(res, 'Visibility must be PUBLIC or PRIVATE', 400);
    }

    if (accessPassword && accessPassword.length < 4) {
      return errorResponse(res, 'Access password must be at least 4 characters', 400);
    }

    await assertSubjectAccess(req.user, subjectId);

    let accessPasswordHash = null;
    if (accessPassword) {
      const salt = await bcrypt.genSalt(10);
      accessPasswordHash = await bcrypt.hash(accessPassword, salt);
    }

    const exam = await prisma.exam.create({
      data: {
        subjectId: parseInt(subjectId),
        createdById: userId,
        title,
        description,
        durationMinutes: parseInt(durationMinutes || 0),
        passPercentage: parseInt(passPercentage ?? 50),
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        visibility: visibility || 'PRIVATE',
        accessPasswordHash,
        status: 'DRAFT'
      }
    });

    const { accessPasswordHash: _, ...rest } = exam;
    return successResponse(res, rest, 'Exam created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const userId = req.user.id;
    const { subjectId, title, description, durationMinutes, passPercentage, startTime, endTime, status, visibility, accessPassword } = req.body;

    const existingExam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!existingExam) return errorResponse(res, 'Exam not found', 404);
    
    if (existingExam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }
    // Validation
    if (title === '') return errorResponse(res, 'Title cannot be empty', 400);
    
    if (durationMinutes !== undefined && parseInt(durationMinutes) <= 0) {
      return errorResponse(res, 'Duration must be greater than 0 minutes', 400);
    }
    if (passPercentage !== undefined && (parseInt(passPercentage) < 0 || parseInt(passPercentage) > 100)) {
      return errorResponse(res, 'Pass percentage must be between 0 and 100', 400);
    }

    if (visibility && !['PUBLIC', 'PRIVATE'].includes(visibility)) {
      return errorResponse(res, 'Visibility must be PUBLIC or PRIVATE', 400);
    }

    if (subjectId) {
      await assertSubjectAccess(req.user, subjectId);
    }

    const data = {
      subjectId: subjectId ? parseInt(subjectId) : undefined,
      title,
      description,
      durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
      passPercentage: passPercentage !== undefined ? parseInt(passPercentage) : undefined,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      status,
      visibility
    };

    if (accessPassword !== undefined) {
      if (accessPassword === null || accessPassword === '') {
        data.accessPasswordHash = null;
      } else {
        if (accessPassword.length < 4) {
          return errorResponse(res, 'Access password must be at least 4 characters', 400);
        }
        const salt = await bcrypt.genSalt(10);
        data.accessPasswordHash = await bcrypt.hash(accessPassword, salt);
      }
    }

    const exam = await prisma.exam.update({
      where: { id: examId },
      data
    });

    const { accessPasswordHash: _, ...rest } = exam;
    return successResponse(res, rest, 'Exam updated successfully');
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
    const attemptCount = await prisma.examAttempt.count({ where: { examId } });
    if (attemptCount > 0) {
      return errorResponse(res, 'Cannot delete an exam with student attempts. Close the exam instead.', 409);
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
    const userId = req.user.id;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return errorResponse(res, 'Exam not found', 404);
    
    if (exam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    const question = await prisma.question.findUnique({ where: { id: parseInt(questionId) } });
    if (!question) return errorResponse(res, 'Question not found', 404);
    if (question.subjectId !== exam.subjectId) {
      return errorResponse(res, 'Question must belong to the same subject as the exam', 400);
    }
    if (req.user.role === 'TEACHER' && question.createdById !== userId) {
      return errorResponse(res, 'You can only add your own questions to an exam', 403);
    }
    if (!Number.isFinite(Number(point)) || Number(point) <= 0) {
      return errorResponse(res, 'Question point must be greater than 0', 400);
    }

    const existing = await prisma.examQuestion.findUnique({
      where: { examId_questionId: { examId, questionId: parseInt(questionId) } }
    });
    if (existing) return errorResponse(res, 'Question already added to this exam', 400);

    const examQuestion = await prisma.examQuestion.create({
      data: {
        examId,
        questionId: parseInt(questionId),
        point: Number(point),
        questionOrder
      }
    });

    return successResponse(res, examQuestion, 'Question added to exam');
  } catch (error) {
    next(error);
  }
};

export const createExamBulk = async (req, res, next) => {
  try {
    const {
      subjectId,
      title,
      description,
      durationMinutes,
      passPercentage,
      startTime,
      endTime,
      visibility,
      accessPassword,
      publish,
      existingQuestions = [],
      newQuestions = []
    } = req.body;

    if (!title?.trim()) return errorResponse(res, 'Title is required', 400);
    if (!subjectId) return errorResponse(res, 'Subject ID is required', 400);
    if (!Number.isInteger(Number(durationMinutes)) || Number(durationMinutes) <= 0) {
      return errorResponse(res, 'Duration must be greater than 0 minutes', 400);
    }
    if (!Number.isInteger(Number(passPercentage)) || Number(passPercentage) < 0 || Number(passPercentage) > 100) {
      return errorResponse(res, 'Pass percentage must be between 0 and 100', 400);
    }
    if (visibility && !['PUBLIC', 'PRIVATE'].includes(visibility)) {
      return errorResponse(res, 'Visibility must be PUBLIC or PRIVATE', 400);
    }
    if (accessPassword && accessPassword.length < 4) {
      return errorResponse(res, 'Access password must be at least 4 characters', 400);
    }
    if (!Array.isArray(existingQuestions) || !Array.isArray(newQuestions)) {
      return errorResponse(res, 'Existing and new questions must be arrays', 400);
    }
    if (existingQuestions.length + newQuestions.length === 0) {
      return errorResponse(res, 'At least one question is required', 400);
    }
    if (existingQuestions.length + newQuestions.length > 100) {
      return errorResponse(res, 'An exam can contain at most 100 questions', 400);
    }

    await assertSubjectAccess(req.user, subjectId);

    try {
      newQuestions.forEach(question => validateQuestionInput({ ...question, subjectId }));
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }

    const existingQuestionIds = existingQuestions.map(item => Number(item.questionId));
    if (existingQuestionIds.some(id => !Number.isInteger(id)) || new Set(existingQuestionIds).size !== existingQuestionIds.length) {
      return errorResponse(res, 'Existing question IDs must be valid and unique', 400);
    }
    const existingRecords = existingQuestionIds.length > 0
      ? await prisma.question.findMany({ where: { id: { in: existingQuestionIds } } })
      : [];
    if (existingRecords.length !== existingQuestionIds.length) {
      return errorResponse(res, 'One or more selected questions do not exist', 400);
    }
    if (existingRecords.some(question => question.subjectId !== Number(subjectId))) {
      return errorResponse(res, 'All questions must belong to the exam subject', 400);
    }
    if (req.user.role === 'TEACHER' && existingRecords.some(question => question.createdById !== req.user.id)) {
      return errorResponse(res, 'You can only use your own questions', 403);
    }

    const allPoints = [
      ...existingQuestions.map(item => Number(item.point)),
      ...newQuestions.map(item => Number(item.point ?? item.defaultPoint ?? 1))
    ];
    if (allPoints.some(point => !Number.isFinite(point) || point <= 0)) {
      return errorResponse(res, 'Every question point must be greater than 0', 400);
    }

    let accessPasswordHash = null;
    if (accessPassword) {
      accessPasswordHash = await bcrypt.hash(accessPassword, await bcrypt.genSalt(10));
    }

    const exam = await prisma.$transaction(async (tx) => {
      const createdExam = await tx.exam.create({
        data: {
          subjectId: Number(subjectId),
          createdById: req.user.id,
          title: title.trim(),
          description: description?.trim() || null,
          durationMinutes: Number(durationMinutes),
          passPercentage: Number(passPercentage),
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          visibility: visibility || 'PRIVATE',
          accessPasswordHash,
          status: publish ? 'PUBLISHED' : 'DRAFT'
        }
      });

      let order = 1;
      for (const item of existingQuestions) {
        await tx.examQuestion.create({
          data: {
            examId: createdExam.id,
            questionId: Number(item.questionId),
            point: Number(item.point),
            questionOrder: order++
          }
        });
      }
      for (const question of newQuestions) {
        const createdQuestion = await tx.question.create({
          data: toQuestionData({ ...question, subjectId }, req.user.id)
        });
        await tx.examQuestion.create({
          data: {
            examId: createdExam.id,
            questionId: createdQuestion.id,
            point: Number(question.point ?? question.defaultPoint ?? 1),
            questionOrder: order++
          }
        });
      }
      return createdExam;
    });

    return successResponse(res, exam, publish ? 'Exam created and published successfully' : 'Exam draft created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const removeQuestionFromExam = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const questionId = parseInt(req.params.questionId);
    const userId = req.user.id;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return errorResponse(res, 'Exam not found', 404);
    
    if (exam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

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
    const userId = req.user.id;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return errorResponse(res, 'Exam not found', 404);
    
    if (exam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    const questionCount = await prisma.examQuestion.count({ where: { examId } });
    if (questionCount === 0) {
      return errorResponse(res, 'Cannot publish exam without questions', 400);
    }

    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: { status: 'PUBLISHED' }
    });

    return successResponse(res, updatedExam, 'Exam published successfully');
  } catch (error) {
    next(error);
  }
};

export const closeExam = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const userId = req.user.id;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return errorResponse(res, 'Exam not found', 404);
    
    if (exam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: { status: 'CLOSED' }
    });
    return successResponse(res, updatedExam, 'Exam closed successfully');
  } catch (error) {
    next(error);
  }
};

export const assignStudents = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const { studentIds } = req.body;
    const userId = req.user.id;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return errorResponse(res, 'Exam not found', 404);
    if (exam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    const assignments = await Promise.all(studentIds.map(async (studentId) => {
      const student = await prisma.user.findFirst({ where: { id: studentId, role: 'STUDENT' } });
      if (!student) return null;

      return prisma.examStudent.upsert({
        where: { examId_studentId: { examId, studentId } },
        update: {},
        create: { examId, studentId }
      });
    }));

    return successResponse(res, assignments.filter(a => a !== null), 'Students assigned successfully');
  } catch (error) {
    next(error);
  }
};

export const removeStudent = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);
    const userId = req.user.id;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return errorResponse(res, 'Exam not found', 404);
    if (exam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    await prisma.examStudent.delete({
      where: { examId_studentId: { examId, studentId } }
    });

    return successResponse(res, null, 'Student removed from exam');
  } catch (error) {
    next(error);
  }
};

export const getAssignedStudents = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const userId = req.user.id;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return errorResponse(res, 'Exam not found', 404);
    if (exam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    const assignments = await prisma.examStudent.findMany({
      where: { examId },
      include: {
        student: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    return successResponse(res, assignments, 'Assigned students retrieved');
  } catch (error) {
    next(error);
  }
};

export const assignClassrooms = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const { classroomIds } = req.body;
    const userId = req.user.id;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return errorResponse(res, 'Exam not found', 404);
    if (exam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    const assignments = await Promise.all(classroomIds.map(async (classroomId) => {
      const cls = await prisma.classroom.findUnique({ where: { id: classroomId } });
      if (!cls) return null;

      return prisma.examClassroom.upsert({
        where: { examId_classroomId: { examId, classroomId } },
        update: {},
        create: { examId, classroomId }
      });
    }));

    return successResponse(res, assignments.filter(a => a !== null), 'Classrooms assigned successfully');
  } catch (error) {
    next(error);
  }
};

export const removeClassroom = async (req, res, next) => {
  try {
    const examId = parseInt(req.params.id);
    const classroomId = parseInt(req.params.classroomId);
    const userId = req.user.id;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) return errorResponse(res, 'Exam not found', 404);
    if (exam.createdById !== userId && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Access denied.', 403);
    }

    await prisma.examClassroom.delete({
      where: { examId_classroomId: { examId, classroomId } }
    });

    return successResponse(res, null, 'Classroom removed from exam');
  } catch (error) {
    next(error);
  }
};
