import { db } from '../data/mockData';

export const dashboardService = {
  getAdminStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 250));
    return { data: db.getAnalytics() };
  },

  getTeacherStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Calculate passing and failing averages, and total exam counts
    const analytics = db.getAnalytics();
    return {
      data: {
        stats: analytics.stats,
        leaderboard: analytics.leaderboard,
        hardestQuestions: analytics.hardestQuestions,
        recentScoresTrend: analytics.recentScoresTrend
      }
    };
  },

  getStudentStats: async (studentId) => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const studentAttempts = db.attempts.filter(a => a.studentId === studentId);
    const totalTaken = studentAttempts.length;
    const passCount = studentAttempts.filter(a => a.status === 'Pass').length;
    const passRate = totalTaken > 0 ? (passCount / totalTaken) * 100 : 0;

    const averageScore = totalTaken > 0
      ? studentAttempts.reduce((sum, att) => {
          const exam = db.exams.find(e => e.id === att.examId);
          const maxMarks = exam ? exam.totalMarks : 100;
          return sum + (att.score / maxMarks) * 100;
        }, 0) / totalTaken
      : 0;

    return {
      data: {
        examsTaken: totalTaken,
        passRate: Math.round(passRate),
        averageScore: Math.round(averageScore)
      }
    };
  }
};
