import prisma from '../utils/prisma.js';

export const getAdminStats = async () => {
  const settings = await prisma.systemSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 }
  });
  const [
    totalUsers,
    totalTeachers,
    totalStudents,
    totalSubjects,
    totalExams,
    totalAttempts,
    attemptsData,
    flaggedAttempts
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.subject.count(),
    prisma.exam.count({ where: { status: 'PUBLISHED' } }),
    prisma.examAttempt.count(),
    prisma.examAttempt.findMany({
      where: { status: 'SUBMITTED' },
      select: { score: true, exam: { select: { passPercentage: true } } }
    }),
    prisma.examAttempt.count({
      where: { tabFocusLosses: { gte: settings.tabFocusWarnings } }
    })
  ]);

  const scores = attemptsData.map(a => Number(a.score));
  const passedAttempts = attemptsData.filter(a => Number(a.score) * 10 >= a.exam.passPercentage).length;
  const passRate = scores.length > 0 ? (passedAttempts / scores.length) * 100 : 0;

  // Global Leaderboard
  const studentPerformanceRaw = await prisma.examAttempt.groupBy({
    by: ['studentId'],
    where: { status: 'SUBMITTED' },
    _avg: { score: true },
    _count: { _all: true },
    orderBy: { _avg: { score: 'desc' } },
    take: 5
  });

  const leaderboard = await Promise.all(studentPerformanceRaw.map(async (item) => {
    const student = await prisma.user.findUnique({
      where: { id: item.studentId },
      select: { fullName: true, email: true }
    });
    return {
      studentName: student?.fullName || 'Không xác định',
      studentEmail: student?.email || 'Không có',
      examsTaken: item._count._all,
      averageScore: Math.round(Number(item._avg.score || 0) * 10)
    };
  }));

  return {
    stats: {
      totalUsers,
      totalTeachers,
      totalStudents,
      totalSubjects,
      totalExams,
      totalSubmissions: totalAttempts,
      passRate: Math.round(passRate),
      flaggedAttempts
    },
    leaderboard,
    systemStatus: {
      database: 'UP',
      generatedAt: new Date()
    }
  };
};

export const getTeacherStats = async (teacherId) => {
  // 1. Basic counts
  const [
    myQuestions,
    myExams,
    publishedExams,
    totalAttempts,
    attemptsData,
    totalStudents
  ] = await Promise.all([
    prisma.question.count({ where: { createdById: teacherId } }),
    prisma.exam.count({ where: { createdById: teacherId } }),
    prisma.exam.count({ where: { createdById: teacherId, status: 'PUBLISHED' } }),
    prisma.examAttempt.count({ where: { exam: { createdById: teacherId } } }),
    prisma.examAttempt.findMany({
      where: { exam: { createdById: teacherId }, status: 'SUBMITTED' },
      select: { score: true, exam: { select: { passPercentage: true } } }
    }),
    prisma.user.count({ where: { role: 'STUDENT' } })
  ]);

  const scores = attemptsData.map(a => Number(a.score));
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const passRate = scores.length > 0
    ? (attemptsData.filter(a => Number(a.score) * 10 >= a.exam.passPercentage).length / scores.length) * 100
    : 0;

  // 2. Score Distribution (0-2, 2-4, 4-6, 6-8, 8-10)
  const distribution = [
    { range: '0-2', count: 0 },
    { range: '2-4', count: 0 },
    { range: '4-6', count: 0 },
    { range: '6-8', count: 0 },
    { range: '8-10', count: 0 }
  ];

  scores.forEach(s => {
    if (s < 2) distribution[0].count++;
    else if (s < 4) distribution[1].count++;
    else if (s < 6) distribution[2].count++;
    else if (s < 8) distribution[3].count++;
    else distribution[4].count++;
  });

  // 3. Top Students (Leaderboard)
  const topStudentsRaw = await prisma.examAttempt.groupBy({
    by: ['studentId'],
    where: { exam: { createdById: teacherId }, status: 'SUBMITTED' },
    _avg: { score: true },
    _count: { _all: true },
    orderBy: { _avg: { score: 'desc' } },
    take: 5
  });

  const topStudents = await Promise.all(topStudentsRaw.map(async (item) => {
    const student = await prisma.user.findUnique({
      where: { id: item.studentId },
      select: { fullName: true, email: true }
    });
    return {
      studentId: item.studentId,
      fullName: student?.fullName,
      email: student?.email,
      averageScore: Number(item._avg.score || 0).toFixed(2),
      completedExams: item._count._all
    };
  }));

  // 4. Recent Attempts
  const recentAttemptsRaw = await prisma.examAttempt.findMany({
    where: { exam: { createdById: teacherId } },
    include: {
      student: { select: { fullName: true } },
      exam: { select: { title: true } }
    },
    orderBy: { startedAt: 'desc' },
    take: 5
  });

  const recentAttempts = recentAttemptsRaw.map(a => ({
    id: a.id,
    studentName: a.student?.fullName || 'Học sinh không xác định',
    examTitle: a.exam?.title || 'Bài thi không xác định',
    score: Number(a.score),
    submittedAt: a.submittedAt,
    status: a.status
  }));

  // 5. Hardest Questions
  const hardestQuestionsRaw = await prisma.question.findMany({
    where: { createdById: teacherId },
    include: {
      studentAnswers: {
        select: { isCorrect: true }
      }
    }
  });

  const hardestQuestions = hardestQuestionsRaw.map(q => {
    const total = q.studentAnswers.length;
    const incorrect = q.studentAnswers.filter(a => !a.isCorrect).length;
    const percentageWrong = total > 0 ? (incorrect / total) * 100 : 0;
    return {
      id: q.id,
      text: q.content,
      incorrectAttempts: incorrect,
      totalAttempts: total,
      percentageWrong: Math.round(percentageWrong)
    };
  })
  .filter(q => q.totalAttempts > 0)
  .sort((a, b) => b.percentageWrong - a.percentageWrong)
  .slice(0, 3);

  return {
    stats: {
      myQuestions,
      myExams,
      totalExams: publishedExams,
      totalSubmissions: totalAttempts,
      totalStudents,
      averageScore: averageScore.toFixed(2),
      passRate: Math.round(passRate)
    },
    passRate: Math.round(passRate),
    scoreDistribution: distribution,
    topStudents,
    leaderboard: topStudents,
    recentAttempts,
    hardestQuestions
  };
};

export const getExamStats = async (examId, teacherId, role) => {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, title: true, createdById: true, passPercentage: true }
  });

  if (!exam) throw new Error('Không tìm thấy bài thi');
  if (role !== 'ADMIN' && exam.createdById !== teacherId) {
    throw new Error('Bạn không có quyền truy cập. Bạn không sở hữu bài thi này.');
  }

  const attempts = await prisma.examAttempt.findMany({
    where: { examId, status: 'SUBMITTED' },
    include: {
      student: { select: { fullName: true, email: true } }
    },
    orderBy: { score: 'desc' }
  });

  const scores = attempts.map(a => Number(a.score));
  const totalAttempts = attempts.length;
  
  const averageScore = totalAttempts > 0 ? scores.reduce((a, b) => a + b, 0) / totalAttempts : 0;
  const highestScore = totalAttempts > 0 ? Math.max(...scores) : 0;
  const lowestScore = totalAttempts > 0 ? Math.min(...scores) : 0;
  const passRate = totalAttempts > 0
    ? (scores.filter(s => s * 10 >= exam.passPercentage).length / totalAttempts) * 100
    : 0;

  const distribution = [
    { range: '0-2', count: 0 },
    { range: '2-4', count: 0 },
    { range: '4-6', count: 0 },
    { range: '6-8', count: 0 },
    { range: '8-10', count: 0 }
  ];

  scores.forEach(s => {
    if (s < 2) distribution[0].count++;
    else if (s < 4) distribution[1].count++;
    else if (s < 6) distribution[2].count++;
    else if (s < 8) distribution[3].count++;
    else distribution[4].count++;
  });

  return {
    examId: exam.id,
    examTitle: exam.title,
    totalAttempts,
    averageScore: averageScore.toFixed(2),
    highestScore: highestScore.toFixed(2),
    lowestScore: lowestScore.toFixed(2),
    passRate: Math.round(passRate),
    scoreDistribution: distribution,
    attempts
  };
};

export const getStudentStats = async (studentId) => {
  const [
    availableExams,
    completedExams,
    bestAttempt,
    attemptsData
  ] = await Promise.all([
    prisma.exam.count({ where: { status: 'PUBLISHED' } }),
    prisma.examAttempt.count({ where: { studentId, status: 'SUBMITTED' } }),
    prisma.examAttempt.findFirst({
      where: { studentId, status: 'SUBMITTED' },
      orderBy: { score: 'desc' },
      select: { score: true }
    }),
    prisma.examAttempt.findMany({
      where: { studentId, status: 'SUBMITTED' },
      include: { 
        exam: { 
          include: { subject: true }
        }
      }
    })
  ]);

  const scores = attemptsData.map(a => Number(a.score));
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  // Group by subject
  const subjectPerformance = {};
  attemptsData.forEach(attempt => {
    const subjectName = attempt.exam.subject.name;
    if (!subjectPerformance[subjectName]) {
      subjectPerformance[subjectName] = { totalScore: 0, count: 0 };
    }
    subjectPerformance[subjectName].totalScore += Number(attempt.score);
    subjectPerformance[subjectName].count += 1;
  });

  const performanceBySubject = Object.entries(subjectPerformance).map(([name, data]) => ({
    subject: name,
    averageScore: (data.totalScore / data.count).toFixed(1)
  }));

  return {
    availableExams,
    examsTaken: completedExams,
    averageScore: Math.round(Number(averageScore) * 10), // Convert to 0-100 scale for UI consistency
    passRate: Math.round((attemptsData.filter(a => Number(a.score) * 10 >= a.exam.passPercentage).length / (scores.length || 1)) * 100),
    bestScore: bestAttempt ? Number(bestAttempt.score).toFixed(2) : '0.00',
    performanceBySubject
  };
};
