import prisma from '../utils/prisma.js';

export const teacherCanAccessSubject = async (teacherId, subjectId, client = prisma) => {
  const assignment = await client.teacherSubject.findUnique({
    where: {
      teacherId_subjectId: {
        teacherId: Number(teacherId),
        subjectId: Number(subjectId)
      }
    }
  });
  return Boolean(assignment);
};

export const assertSubjectAccess = async (user, subjectId, client = prisma) => {
  const subject = await client.subject.findUnique({ where: { id: Number(subjectId) } });
  if (!subject) {
    const error = new Error('Không tìm thấy môn học');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'TEACHER' && !(await teacherCanAccessSubject(user.id, subjectId, client))) {
    const error = new Error('Bạn chưa được phân công giảng dạy môn học này');
    error.statusCode = 403;
    throw error;
  }

  return subject;
};

export const validateQuestionInput = (question) => {
  const required = [
    question.subjectId,
    question.content?.trim(),
    question.optionA?.trim(),
    question.optionB?.trim(),
    question.optionC?.trim(),
    question.optionD?.trim(),
    question.correctAnswer
  ];
  if (required.some(value => !value)) throw new Error('Vui lòng nhập đầy đủ thông tin câu hỏi');
  if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
    throw new Error('Đáp án đúng phải là A, B, C hoặc D');
  }
  if (question.difficulty && !['EASY', 'MEDIUM', 'HARD'].includes(question.difficulty)) {
    throw new Error('Độ khó phải là EASY, MEDIUM hoặc HARD');
  }
  const defaultPoint = Number(question.defaultPoint ?? 1);
  if (!Number.isFinite(defaultPoint) || defaultPoint <= 0) {
    throw new Error('Điểm của câu hỏi phải lớn hơn 0');
  }
};

export const toQuestionData = (question, createdById) => ({
  subjectId: Number(question.subjectId),
  createdById,
  content: question.content.trim(),
  optionA: question.optionA.trim(),
  optionB: question.optionB.trim(),
  optionC: question.optionC.trim(),
  optionD: question.optionD.trim(),
  correctAnswer: question.correctAnswer,
  difficulty: question.difficulty || 'EASY',
  defaultPoint: Number(question.defaultPoint ?? 1)
});
