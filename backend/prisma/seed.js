import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.studentAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.question.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('123456', salt);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      fullName: 'System Admin',
      email: 'admin@examify.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const teacher = await prisma.user.create({
    data: {
      fullName: 'John Teacher',
      email: 'teacher@examify.com',
      passwordHash,
      role: 'TEACHER',
    },
  });

  const student = await prisma.user.create({
    data: {
      fullName: 'Alice Student',
      email: 'student@examify.com',
      passwordHash,
      role: 'STUDENT',
    },
  });

  // 2. Create Subjects
  const math = await prisma.subject.create({
    data: { name: 'Mathematics', code: 'MATH101', description: 'Basic Mathematics' },
  });

  const science = await prisma.subject.create({
    data: { name: 'Science', code: 'SCI101', description: 'General Science' },
  });

  const history = await prisma.subject.create({
    data: { name: 'History', code: 'HIS101', description: 'World History' },
  });

  // 3. Create Questions
  const q1 = await prisma.question.create({
    data: {
      subjectId: math.id,
      createdById: teacher.id,
      content: 'What is 2 + 2?',
      optionA: '3',
      optionB: '4',
      optionC: '5',
      optionD: '6',
      correctAnswer: 'B',
      difficulty: 'EASY',
    },
  });

  const q2 = await prisma.question.create({
    data: {
      subjectId: math.id,
      createdById: teacher.id,
      content: 'What is the square root of 16?',
      optionA: '2',
      optionB: '4',
      optionC: '8',
      optionD: '16',
      correctAnswer: 'B',
      difficulty: 'EASY',
    },
  });

  const q3 = await prisma.question.create({
    data: {
      subjectId: science.id,
      createdById: teacher.id,
      content: 'What is the chemical symbol for water?',
      optionA: 'H2O',
      optionB: 'CO2',
      optionC: 'O2',
      optionD: 'N2',
      correctAnswer: 'A',
      difficulty: 'EASY',
    },
  });

  // 4. Create Exam
  const exam = await prisma.exam.create({
    data: {
      subjectId: math.id,
      createdById: teacher.id,
      title: 'Basic Math Quiz',
      description: 'A simple math quiz for beginners.',
      durationMinutes: 30,
      status: 'PUBLISHED',
    },
  });

  // 5. Add Questions to Exam
  await prisma.examQuestion.create({
    data: {
      examId: exam.id,
      questionId: q1.id,
      questionOrder: 1,
      point: 5.0,
    },
  });

  await prisma.examQuestion.create({
    data: {
      examId: exam.id,
      questionId: q2.id,
      questionOrder: 2,
      point: 5.0,
    },
  });

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
