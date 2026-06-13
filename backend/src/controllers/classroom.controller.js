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
    let { name, code, description, schoolName, subjectId, bannerUrl } = req.body;
    const teacherId = req.user.id;

    if (!name || !subjectId) {
      return errorResponse(res, 'Name and subjectId are required', 400);
    }

    // Auto-generate code if not provided
    if (!code) {
      code = name.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    const existingCode = await prisma.classroom.findUnique({ where: { code } });
    if (existingCode) return errorResponse(res, 'Classroom code already in use. Please provide a unique code.', 400);

    // Verify subject exists
    const subject = await prisma.subject.findUnique({ where: { id: parseInt(subjectId) } });
    if (!subject) return errorResponse(res, 'Invalid subjectId', 400);

    const classroom = await prisma.classroom.create({
      data: {
        name,
        code,
        description,
        schoolName,
        bannerUrl,
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
    const { name, description, schoolName, subjectId, bannerUrl, status } = req.body;

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
        bannerUrl,
        status,
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

export const searchStudents = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return successResponse(res, [], 'Search query too short');
    }

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        status: 'ACTIVE',
        OR: [
          { fullName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { schoolName: { contains: query, mode: 'insensitive' } },
          { id: isNaN(parseInt(query)) ? undefined : parseInt(query) }
        ].filter(Boolean)
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        schoolName: true
      },
      take: 10
    });

    return successResponse(res, students, 'Students found successfully');
  } catch (error) {
    next(error);
  }
};

export const addStudentToClass = async (req, res, next) => {
  try {
    const classroomId = parseInt(req.params.id);
    const { studentId, studentEmail } = req.body;

    let targetStudentId = studentId;

    if (!targetStudentId && studentEmail) {
      const student = await prisma.user.findUnique({ where: { email: studentEmail.toLowerCase() } });
      if (!student || student.role !== 'STUDENT') {
        return errorResponse(res, 'Student not found with this email', 404);
      }
      targetStudentId = student.id;
    }

    if (!targetStudentId) return errorResponse(res, 'Student ID or Email is required', 400);

    const enrollment = await prisma.classStudent.create({
      data: {
        classroomId,
        studentId: parseInt(targetStudentId)
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
