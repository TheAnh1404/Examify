import prisma from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getClassrooms = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const { search } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { schoolName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Role-based filtering
    if (role === 'TEACHER') {
      where.teacherId = userId;
    } else if (role === 'STUDENT') {
      where.students = {
        some: { studentId: userId }
      };
    }

    const classrooms = await prisma.classroom.findMany({
      where,
      include: {
        teacher: { select: { id: true, fullName: true, avatarUrl: true } },
        subject: { select: { id: true, name: true, code: true } },
        _count: { select: { students: true, exams: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, classrooms, 'Classrooms retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getClassroomById = async (req, res, next) => {
  try {
    const classroomId = parseInt(req.params.id);
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        teacher: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
        subject: { select: { id: true, name: true, code: true } },
        students: {
          include: {
            student: { select: { id: true, fullName: true, email: true, avatarUrl: true, schoolName: true } }
          },
          orderBy: { student: { fullName: 'asc' } }
        },
        exams: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                status: true,
                durationMinutes: true,
                startTime: true,
                endTime: true
              }
            }
          }
        }
      }
    });

    if (!classroom) return errorResponse(res, 'Classroom not found', 404);
    
    // Auth check
    const { role, id: userId } = req.user;
    if (role === 'TEACHER' && classroom.teacherId !== userId) {
      return errorResponse(res, 'Access denied', 403);
    }
    if (role === 'STUDENT') {
      const isEnrolled = classroom.students.some(s => s.studentId === userId);
      if (!isEnrolled) return errorResponse(res, 'Access denied', 403);
    }

    return successResponse(res, classroom, 'Classroom details retrieved');
  } catch (error) {
    next(error);
  }
};

export const createClassroom = async (req, res, next) => {
  try {
    const { name, code, description, schoolName, subjectId } = req.body;
    const teacherId = req.user.id;

    if (!name || !code || !subjectId) {
      return errorResponse(res, 'Name, code, and subjectId are required', 400);
    }

    const existingCode = await prisma.classroom.findUnique({ where: { code } });
    if (existingCode) return errorResponse(res, 'Classroom code already in use', 400);

    const classroom = await prisma.classroom.create({
      data: {
        name,
        code,
        description,
        schoolName,
        teacherId,
        subjectId: parseInt(subjectId)
      },
      include: {
        subject: true
      }
    });

    return successResponse(res, classroom, 'Classroom created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateClassroom = async (req, res, next) => {
  try {
    const classroomId = parseInt(req.params.id);
    const { name, description, schoolName, subjectId } = req.body;

    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!classroom) return errorResponse(res, 'Classroom not found', 404);
    if (req.user.role !== 'ADMIN' && classroom.teacherId !== req.user.id) {
      return errorResponse(res, 'Access denied', 403);
    }

    const updated = await prisma.classroom.update({
      where: { id: classroomId },
      data: {
        name,
        description,
        schoolName,
        subjectId: subjectId ? parseInt(subjectId) : undefined
      }
    });

    return successResponse(res, updated, 'Classroom updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteClassroom = async (req, res, next) => {
  try {
    const classroomId = parseInt(req.params.id);
    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    
    if (!classroom) return errorResponse(res, 'Classroom not found', 404);
    if (req.user.role !== 'ADMIN' && classroom.teacherId !== req.user.id) {
      return errorResponse(res, 'Access denied', 403);
    }

    await prisma.classroom.delete({ where: { id: classroomId } });
    return successResponse(res, null, 'Classroom deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const addStudentToClass = async (req, res, next) => {
  try {
    const classroomId = parseInt(req.params.id);
    const { studentEmail } = req.body;

    if (!studentEmail) return errorResponse(res, 'Student email is required', 400);

    const student = await prisma.user.findUnique({ where: { email: studentEmail.toLowerCase() } });
    if (!student || student.role !== 'STUDENT') {
      return errorResponse(res, 'Student not found', 404);
    }

    const enrollment = await prisma.classStudent.create({
      data: {
        classroomId,
        studentId: student.id
      },
      include: {
        student: { select: { id: true, fullName: true, email: true } }
      }
    });

    return successResponse(res, enrollment, 'Student added to classroom');
  } catch (error) {
    if (error.code === 'P2002') return errorResponse(res, 'Student is already in this class', 400);
    next(error);
  }
};

export const removeStudentFromClass = async (req, res, next) => {
  try {
    const classroomId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    await prisma.classStudent.delete({
      where: {
        classroomId_studentId: { classroomId, studentId }
      }
    });

    return successResponse(res, null, 'Student removed from classroom');
  } catch (error) {
    next(error);
  }
};
