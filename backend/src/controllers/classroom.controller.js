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

// ============================================================
// Enrollment Request Endpoints
// ============================================================

export const checkClassCode = async (req, res, next) => {
  try {
    const { code } = req.params;

    const classroom = await prisma.classroom.findUnique({
      where: { code },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        schoolName: true,
        bannerUrl: true,
        status: true,
        teacher: { select: { id: true, fullName: true, avatarUrl: true } },
        subject: { select: { id: true, name: true, code: true } },
        _count: { select: { students: true } }
      }
    });

    if (!classroom) {
      return errorResponse(res, 'No classroom found with this code', 404);
    }

    if (classroom.status !== 'ACTIVE') {
      return errorResponse(res, 'This classroom is no longer active', 400);
    }

    return successResponse(res, classroom, 'Classroom found');
  } catch (error) {
    next(error);
  }
};

export const enrollRequest = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { classroomId, message } = req.body;

    if (!classroomId) {
      return errorResponse(res, 'classroomId is required', 400);
    }

    const parsedClassroomId = parseInt(classroomId);

    // Check classroom exists and is active
    const classroom = await prisma.classroom.findUnique({
      where: { id: parsedClassroomId }
    });
    if (!classroom) return errorResponse(res, 'Classroom not found', 404);
    if (classroom.status !== 'ACTIVE') {
      return errorResponse(res, 'This classroom is no longer active', 400);
    }

    // Check if already a member
    const existingMember = await prisma.classStudent.findUnique({
      where: {
        classroomId_studentId: { classroomId: parsedClassroomId, studentId }
      }
    });
    if (existingMember) {
      return errorResponse(res, 'You are already a member of this classroom', 400);
    }

    // Check existing request
    const existingRequest = await prisma.enrollmentRequest.findUnique({
      where: {
        studentId_classroomId: { studentId, classroomId: parsedClassroomId }
      }
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return errorResponse(res, 'You already have a pending request for this classroom', 400);
      }
      // If previously rejected, allow re-request by updating
      if (existingRequest.status === 'REJECTED') {
        const updated = await prisma.enrollmentRequest.update({
          where: { id: existingRequest.id },
          data: { status: 'PENDING', message: message || null },
          include: {
            classroom: {
              select: { id: true, name: true, code: true },
            }
          }
        });
        return successResponse(res, updated, 'Join request re-submitted successfully', 201);
      }
    }

    const request = await prisma.enrollmentRequest.create({
      data: {
        studentId,
        classroomId: parsedClassroomId,
        message: message || null
      },
      include: {
        classroom: {
          select: { id: true, name: true, code: true },
        }
      }
    });

    return successResponse(res, request, 'Join request sent successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const requests = await prisma.enrollmentRequest.findMany({
      where: { studentId },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            code: true,
            schoolName: true,
            bannerUrl: true,
            subject: { select: { id: true, name: true } },
            teacher: { select: { id: true, fullName: true, avatarUrl: true } },
            _count: { select: { students: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, requests, 'Enrollment requests retrieved');
  } catch (error) {
    next(error);
  }
};

export const getEnrollmentRequests = async (req, res, next) => {
  try {
    const classroomId = parseInt(req.params.id);
    const teacherId = req.user.id;

    // Verify ownership
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId }
    });
    if (!classroom) return errorResponse(res, 'Classroom not found', 404);
    if (classroom.teacherId !== teacherId) {
      return errorResponse(res, 'Access denied. You are not the owner of this classroom.', 403);
    }

    const { status } = req.query;
    const where = { classroomId };
    if (status) {
      where.status = status;
    } else {
      where.status = 'PENDING';
    }

    const requests = await prisma.enrollmentRequest.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            schoolName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, requests, 'Enrollment requests retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateEnrollmentStatus = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.requestId);
    const teacherId = req.user.id;
    const { status } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return errorResponse(res, 'Status must be APPROVED or REJECTED', 400);
    }

    // Fetch request with classroom for ownership check
    const enrollmentRequest = await prisma.enrollmentRequest.findUnique({
      where: { id: requestId },
      include: {
        classroom: true,
        student: { select: { id: true, fullName: true, email: true } }
      }
    });

    if (!enrollmentRequest) {
      return errorResponse(res, 'Enrollment request not found', 404);
    }
    if (enrollmentRequest.classroom.teacherId !== teacherId) {
      return errorResponse(res, 'Access denied. You are not the owner of this classroom.', 403);
    }
    if (enrollmentRequest.status !== 'PENDING') {
      return errorResponse(res, 'This request has already been processed', 400);
    }

    if (status === 'APPROVED') {
      // Use transaction: update request status + add student to class
      const [updatedRequest] = await prisma.$transaction([
        prisma.enrollmentRequest.update({
          where: { id: requestId },
          data: { status: 'APPROVED' },
          include: {
            student: { select: { id: true, fullName: true, email: true } }
          }
        }),
        prisma.classStudent.create({
          data: {
            classroomId: enrollmentRequest.classroomId,
            studentId: enrollmentRequest.studentId
          }
        })
      ]);
      return successResponse(res, updatedRequest, 'Student approved and added to classroom');
    } else {
      const updatedRequest = await prisma.enrollmentRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
        include: {
          student: { select: { id: true, fullName: true, email: true } }
        }
      });
      return successResponse(res, updatedRequest, 'Enrollment request rejected');
    }
  } catch (error) {
    next(error);
  }
};
