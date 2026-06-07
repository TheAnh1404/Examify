import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.studentAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.examStudent.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.question.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('123456', salt);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: { fullName: 'System Admin', email: 'admin@examify.com', passwordHash, role: 'ADMIN' },
  });

  const teacher = await prisma.user.create({
    data: { fullName: 'John Teacher', email: 'teacher@examify.com', passwordHash, role: 'TEACHER' },
  });

  const s1 = await prisma.user.create({
    data: { fullName: 'Alice Student', email: 'student@examify.com', passwordHash, role: 'STUDENT' },
  });

  const s2 = await prisma.user.create({
    data: { fullName: 'Bob Smith', email: 'bob@examify.com', passwordHash, role: 'STUDENT' },
  });

  // 2. Create Subjects
  const math = await prisma.subject.create({
    data: { name: 'Mathematics', code: 'MATH101', description: 'Basic Mathematics' },
  });

  // 3. Create Questions
  const q1 = await prisma.question.create({
    data: {
      subjectId: math.id, createdById: teacher.id, content: 'What is 2 + 2?',
      optionA: '3', optionB: '4', optionC: '5', optionD: '6', correctAnswer: 'B', difficulty: 'EASY',
    },
  });

  const q2 = await prisma.question.create({
    data: {
      subjectId: math.id, createdById: teacher.id, content: 'What is the square root of 16?',
      optionA: '2', optionB: '4', optionC: '8', optionD: '16', correctAnswer: 'B', difficulty: 'EASY',
    },
  });

  // 4. Create Exams with Access Control

  // Exam 1: PUBLIC Published
  const publicExam = await prisma.exam.create({
    data: {
      subjectId: math.id, createdById: teacher.id, title: 'General Math Quiz',
      durationMinutes: 30, status: 'PUBLISHED', visibility: 'PUBLIC'
    },
  });
  await prisma.examQuestion.create({ data: { examId: publicExam.id, questionId: q1.id, questionOrder: 1, point: 10 } });

  // Exam 2: PRIVATE Published (Assigned to Alice)
  const privateExam = await prisma.exam.create({
    data: {
      subjectId: math.id, createdById: teacher.id, title: 'Advanced Private Test',
      durationMinutes: 60, status: 'PUBLISHED', visibility: 'PRIVATE'
    },
  });
  await prisma.examQuestion.create({ data: { examId: privateExam.id, questionId: q2.id, questionOrder: 1, point: 10 } });
  await prisma.examStudent.create({ data: { examId: privateExam.id, studentId: s1.id } });

  // Exam 3: Password Protected (Password: "secret123")
  const accessPasswordHash = await bcrypt.hash('secret123', salt);
  const protectedExam = await prisma.exam.create({
    data: {
      subjectId: math.id, createdById: teacher.id, title: 'Secret Final Exam',
      durationMinutes: 90, status: 'PUBLISHED', visibility: 'PUBLIC',
      accessPasswordHash
    },
  });
  await prisma.examQuestion.create({ data: { examId: protectedExam.id, questionId: q1.id, questionOrder: 1, point: 5 } });
  await prisma.examQuestion.create({ data: { examId: protectedExam.id, questionId: q2.id, questionOrder: 2, point: 5 } });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
