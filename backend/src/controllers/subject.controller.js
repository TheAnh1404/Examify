import prisma from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getSubjects = async (req, res, next) => {
  try {
    const where = req.user.role === 'TEACHER'
      ? { teacherAssignments: { some: { teacherId: req.user.id } } }
      : {};
    const subjects = await prisma.subject.findMany({
      where,
      include: {
        _count: {
          select: { questions: true, exams: true }
        },
        teacherAssignments: req.user.role === 'TEACHER'
          ? { where: { teacherId: req.user.id }, select: { note: true, assignedAt: true } }
          : false
      },
      orderBy: { name: 'asc' }
    });

    return successResponse(res, subjects, 'Lấy danh sách môn học thành công');
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req, res, next) => {
  try {
    const subjectId = parseInt(req.params.id);
    if (req.user.role === 'TEACHER') {
      const assignment = await prisma.teacherSubject.findUnique({
        where: { teacherId_subjectId: { teacherId: req.user.id, subjectId } }
      });
      if (!assignment) return errorResponse(res, 'Bạn chưa được phân công giảng dạy môn học này', 403);
    }
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        _count: {
          select: { questions: true, exams: true }
        }
      }
    });

    if (!subject) return errorResponse(res, 'Không tìm thấy môn học', 404);
    return successResponse(res, subject, 'Lấy thông tin môn học thành công');
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    if (!name?.trim() || !code?.trim()) return errorResponse(res, 'Vui lòng nhập tên và mã môn học', 400);
    const normalizedCode = code.trim().toUpperCase();
    const exists = await prisma.subject.findUnique({ where: { code: normalizedCode } });
    if (exists) return errorResponse(res, 'Mã môn học đã tồn tại', 400);

    const subject = await prisma.subject.create({
      data: { name: name.trim(), code: normalizedCode, description: description?.trim() || null },
      include: { _count: { select: { questions: true, exams: true } } }
    });

    return successResponse(res, subject, 'Tạo môn học thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    const subjectId = parseInt(req.params.id);

    if (!name?.trim() || !code?.trim()) return errorResponse(res, 'Vui lòng nhập tên và mã môn học', 400);

    const normalizedCode = code.trim().toUpperCase();
    const duplicate = await prisma.subject.findFirst({
      where: { code: normalizedCode, NOT: { id: subjectId } }
    });
    if (duplicate) return errorResponse(res, 'Mã môn học đã tồn tại', 400);

    const subject = await prisma.subject.update({
      where: { id: subjectId },
      data: { name: name.trim(), code: normalizedCode, description: description?.trim() || null },
      include: { _count: { select: { questions: true, exams: true } } }
    });

    return successResponse(res, subject, 'Cập nhật môn học thành công');
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subjectId = parseInt(req.params.id);
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: { _count: { select: { questions: true, exams: true } } }
    });
    if (!subject) return errorResponse(res, 'Không tìm thấy môn học', 404);
    if (subject._count.questions > 0 || subject._count.exams > 0) {
      return errorResponse(res, 'Không thể xóa môn học đang được dùng bởi câu hỏi hoặc bài thi', 409);
    }

    await prisma.subject.delete({ where: { id: subjectId } });
    return successResponse(res, null, 'Xóa môn học thành công');
  } catch (error) {
    next(error);
  }
};
