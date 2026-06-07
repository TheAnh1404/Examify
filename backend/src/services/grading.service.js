import prisma from '../utils/prisma.js';

export const gradeAttempt = async (attemptId) => {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          examQuestions: {
            include: { question: true }
          }
        }
      },
      answers: true
    }
  });

  if (!attempt) throw new Error('Attempt not found');

  const examQuestions = attempt.exam.examQuestions;
  const studentAnswers = attempt.answers;

  let correctCount = 0;
  const totalQuestions = examQuestions.length;

  // Grade each answer
  const gradingPromises = studentAnswers.map(async (answer) => {
    const questionLink = examQuestions.find(eq => eq.questionId === answer.questionId);
    if (!questionLink) return;

    const isCorrect = answer.selectedAnswer === questionLink.question.correctAnswer;
    if (isCorrect) correctCount++;

    return prisma.studentAnswer.update({
      where: { id: answer.id },
      data: { isCorrect }
    });
  });

  await Promise.all(gradingPromises);

  const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;

  return prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      correctCount,
      totalQuestions,
      score,
      status: 'SUBMITTED',
      submittedAt: new Date()
    }
  });
};
