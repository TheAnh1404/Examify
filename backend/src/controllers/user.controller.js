import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        schoolName: true,
        createdAt: true,
        updatedAt: true,
        teachingSubjects: {
          include: { subject: true },
          orderBy: { subject: { name: 'asc' } }
        }
      }
    });

    return successResponse(res, users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        avatarUrl: true,
        schoolName: true,
        createdAt: true,
        updatedAt: true,
        teachingSubjects: {
          include: {
            subject: true,
            assignedBy: { select: { id: true, fullName: true } }
          },
          orderBy: { subject: { name: 'asc' } }
        }
      }
    });

    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role, teachingAssignments = [] } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!fullName?.trim() || !normalizedEmail || !password) {
      return errorResponse(res, 'Full name, email, and password are required', 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return errorResponse(res, 'Email address is invalid', 400);
    }
    if (password.length < 8) return errorResponse(res, 'Password must be at least 8 characters', 400);
    if (role && !['ADMIN', 'TEACHER', 'STUDENT'].includes(role)) {
      return errorResponse(res, 'Invalid user role', 400);
    }
    if (!Array.isArray(teachingAssignments)) {
      return errorResponse(res, 'Teaching assignments must be an array', 400);
    }
    const teachingSubjectIds = [...new Set(teachingAssignments.map(item => Number(item.subjectId)))];
    if (teachingSubjectIds.some(id => !Number.isInteger(id))) {
      return errorResponse(res, 'Every teaching assignment must contain a valid subject ID', 400);
    }
    if (role === 'TEACHER') {
      const subjectCount = await prisma.subject.count({ where: { id: { in: teachingSubjectIds } } });
      if (subjectCount !== teachingSubjectIds.length) {
        return errorResponse(res, 'One or more teaching subjects do not exist', 400);
      }
    }

    const userExists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (userExists) return errorResponse(res, 'Email already in use', 400);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          fullName: fullName.trim(),
          email: normalizedEmail,
          passwordHash,
          role: role || 'STUDENT'
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          createdAt: true
        }
      });

      if (created.role === 'TEACHER' && teachingSubjectIds.length > 0) {
        await tx.teacherSubject.createMany({
          data: teachingSubjectIds.map(subjectId => {
            const assignment = teachingAssignments.find(item => Number(item.subjectId) === subjectId);
            return {
              teacherId: created.id,
              subjectId,
              assignedById: req.user.id,
              note: assignment.note?.trim() || null
            };
          })
        });
      }
      return created;
    });

    return successResponse(res, user, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { fullName, email, role, status, password, avatarUrl, schoolName } = req.body;
    const userId = parseInt(req.params.id);

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) return errorResponse(res, 'User not found', 404);

    if (role && !['ADMIN', 'TEACHER', 'STUDENT'].includes(role)) {
      return errorResponse(res, 'Invalid user role', 400);
    }
    if (status && !['ACTIVE', 'LOCKED'].includes(status)) {
      return errorResponse(res, 'Invalid user status', 400);
    }
    if (userId === req.user.id && role && role !== existingUser.role) {
      return errorResponse(res, 'Cannot change your own administrative role', 400);
    }
    if (userId === req.user.id && status && status !== existingUser.status) {
      return errorResponse(res, 'Cannot change your own status', 400);
    }
    if (password && password.length < 8) {
      return errorResponse(res, 'Password must be at least 8 characters', 400);
    }

    const normalizedEmail = email?.trim().toLowerCase();
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return errorResponse(res, 'Email address is invalid', 400);
    }
    if (normalizedEmail && normalizedEmail !== existingUser.email) {
      const emailOwner = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (emailOwner) return errorResponse(res, 'Email already in use', 400);
    }

    const data = {
      fullName: fullName?.trim(),
      email: normalizedEmail,
      role,
      status,
      avatarUrl,
      schoolName
    };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      data.passwordHash = await bcrypt.hash(password, salt);
    }

    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          status: true,
          avatarUrl: true,
          schoolName: true
        }
      });
      if (role && role !== 'TEACHER') {
        await tx.teacherSubject.deleteMany({ where: { teacherId: userId } });
      }
      return updated;
    });

    return successResponse(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    if (userId === req.user.id) {
      return errorResponse(res, 'Cannot delete your own account', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { questions: true, exams: true, attempts: true } }
      }
    });
    if (!user) return errorResponse(res, 'User not found', 404);
    if (user._count.questions > 0 || user._count.exams > 0 || user._count.attempts > 0) {
      return errorResponse(res, 'Cannot delete a user with related questions, exams, or attempts. Lock the account instead.', 409);
    }

    await prisma.user.delete({ where: { id: userId } });
    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['ACTIVE', 'LOCKED'].includes(status)) {
      return errorResponse(res, 'Invalid user status', 400);
    }

    if (userId === req.user.id) {
      return errorResponse(res, 'Cannot change your own status', 400);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, status: true }
    });

    return successResponse(res, user, 'User status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getTeachingSubjects = async (req, res, next) => {
  try {
    const teacherId = parseInt(req.params.id);
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        fullName: true,
        role: true,
        teachingSubjects: {
          include: {
            subject: true,
            assignedBy: { select: { id: true, fullName: true } }
          },
          orderBy: { subject: { name: 'asc' } }
        }
      }
    });

    if (!teacher) return errorResponse(res, 'User not found', 404);
    if (teacher.role !== 'TEACHER') return errorResponse(res, 'User is not a teacher', 400);
    return successResponse(res, teacher.teachingSubjects, 'Teaching subjects retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTeachingSubjects = async (req, res, next) => {
  try {
    const teacherId = parseInt(req.params.id);
    const assignments = Array.isArray(req.body.assignments) ? req.body.assignments : null;
    if (!assignments) return errorResponse(res, 'Assignments must be an array', 400);

    const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher) return errorResponse(res, 'User not found', 404);
    if (teacher.role !== 'TEACHER') return errorResponse(res, 'Subjects can only be assigned to teachers', 400);

    const subjectIds = [...new Set(assignments.map(item => Number(item.subjectId)))];
    if (subjectIds.some(id => !Number.isInteger(id))) {
      return errorResponse(res, 'Every assignment must contain a valid subject ID', 400);
    }
    const subjectCount = await prisma.subject.count({ where: { id: { in: subjectIds } } });
    if (subjectCount !== subjectIds.length) return errorResponse(res, 'One or more subjects do not exist', 400);

    const normalized = subjectIds.map(subjectId => {
      const assignment = assignments.find(item => Number(item.subjectId) === subjectId);
      return {
        teacherId,
        subjectId,
        assignedById: req.user.id,
        note: assignment.note?.trim() || null
      };
    });

    const result = await prisma.$transaction(async (tx) => {
      await tx.teacherSubject.deleteMany({ where: { teacherId } });
      if (normalized.length > 0) {
        await tx.teacherSubject.createMany({ data: normalized });
      }
      return tx.teacherSubject.findMany({
        where: { teacherId },
        include: {
          subject: true,
          assignedBy: { select: { id: true, fullName: true } }
        },
        orderBy: { subject: { name: 'asc' } }
      });
    });

    return successResponse(res, result, 'Teaching subjects updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, avatarUrl, schoolName, password } = req.body;

    const data = {
      fullName: fullName?.trim() || undefined,
      avatarUrl,
      schoolName
    };

    if (password) {
      if (password.length < 8) return errorResponse(res, 'Password must be at least 8 characters', 400);
      const salt = await bcrypt.genSalt(10);
      data.passwordHash = await bcrypt.hash(password, salt);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatarUrl: true,
        schoolName: true
      }
    });

    return successResponse(res, updated, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};
