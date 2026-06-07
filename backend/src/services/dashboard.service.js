import prisma from '../utils/prisma.js';

export const getAdminStats = async () => {
  const [
    totalUsers,
    totalTeachers,
    totalStudents,
    totalSubjects,
    totalExams,
    totalAttempts
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.subject.count(),
    prisma.exam.count(),
    prisma.examAttempt.count()
  ]);

  return {
    totalUsers,
    totalTeachers,
    totalStudents,
    totalSubjects,
    totalExams,
    totalAttempts
  };
};

export const getTeacherStats = async (teacherId) => {
  const [
    myQuestions,
    myExams,
    publishedExams,
    totalAttempts,
    attemptsData
  ] = await Promise.all([
    prisma.question.count({ where: { createdById: teacherId } }),
    prisma.exam.count({ where: { createdById: teacherId } }),
    prisma.exam.count({ where: { createdById: teacherId, status: 'PUBLISHED' } }),
    prisma.examAttempt.count({ where: { exam: { createdById: teacherId } } }),
    prisma.examAttempt.findMany({
      where: { exam: { createdById: teacherId }, status: 'SUBMITTED' },
      select: { score: true }
    })
  ]);

  const scores = attemptsData.map(a => Number(a.score));
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const passRate = scores.length > 0 ? (scores.filter(s => s >= 5).length / scores.length) * 100 : 0;

  return {
    myQuestions,
    myExams,
    publishedExams,
    totalAttempts,
    averageScore: averageScore.toFixed(2),
    passRate: passRate.toFixed(2) + '%'
  };
};

export const getStudentStats = async (studentId) => {
  const [
    availableExams,
    completedExams,
    bestAttempt
  ] = await Promise.all([
    prisma.exam.count({ where: { status: 'PUBLISHED' } }),
    prisma.examAttempt.count({ where: { studentId, status: 'SUBMITTED' } }),
    prisma.examAttempt.findFirst({
      where: { studentId, status: 'SUBMITTED' },
      orderBy: { score: 'desc' },
      select: { score: true }
    })
  ]);

  const attemptsData = await prisma.examAttempt.findMany({
    where: { studentId, status: 'SUBMITTED' },
    select: { score: true }
  });

  const scores = attemptsData.map(a => Number(a.score));
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return {
    availableExams,
    completedExams,
    averageScore: averageScore.toFixed(2),
    bestScore: bestAttempt ? Number(bestAttempt.score).toFixed(2) : '0.00'
  };
};
