import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Đang nạp dữ liệu mẫu...');

  // Clear existing data
  await prisma.studentAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.examStudent.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.question.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('123456', salt);

  await prisma.systemSetting.create({ data: { id: 1 } });

  // 1. Tạo người dùng
  const admin = await prisma.user.create({
    data: { fullName: 'Quản trị hệ thống', email: 'admin@examify.com', passwordHash, role: 'ADMIN' },
  });

  const teacher = await prisma.user.create({
    data: { fullName: 'Nguyễn Minh Anh', email: 'teacher@examify.com', passwordHash, role: 'TEACHER' },
  });

  const s1 = await prisma.user.create({
    data: { fullName: 'Trần Gia Bảo', email: 'student@examify.com', passwordHash, role: 'STUDENT' },
  });

  const s2 = await prisma.user.create({
    data: { fullName: 'Lê Minh Châu', email: 'bob@examify.com', passwordHash, role: 'STUDENT' },
  });

  // 2. Tạo môn học
  const math = await prisma.subject.create({
    data: { name: 'Toán học', code: 'MATH101', description: 'Toán học cơ bản' },
  });
  await prisma.teacherSubject.create({
    data: {
      teacherId: teacher.id,
      subjectId: math.id,
      assignedById: admin.id,
      note: 'Giáo viên phụ trách môn Toán học'
    }
  });

  // 3. Tạo câu hỏi
  const q1 = await prisma.question.create({
    data: {
      subjectId: math.id, createdById: teacher.id, content: '2 + 2 bằng bao nhiêu?',
      optionA: '3', optionB: '4', optionC: '5', optionD: '6', correctAnswer: 'B', difficulty: 'EASY', defaultPoint: 10,
    },
  });

  const q2 = await prisma.question.create({
    data: {
      subjectId: math.id, createdById: teacher.id, content: 'Căn bậc hai của 16 là bao nhiêu?',
      optionA: '2', optionB: '4', optionC: '8', optionD: '16', correctAnswer: 'B', difficulty: 'EASY', defaultPoint: 10,
    },
  });

  // 4. Tạo bài thi có kiểm soát truy cập

  // Bài thi 1: PUBLIC, đã công bố
  const publicExam = await prisma.exam.create({
    data: {
      subjectId: math.id, createdById: teacher.id, title: 'Bài kiểm tra Toán tổng quát',
      durationMinutes: 30, passPercentage: 50, status: 'PUBLISHED', visibility: 'PUBLIC'
    },
  });
  await prisma.examQuestion.create({ data: { examId: publicExam.id, questionId: q1.id, questionOrder: 1, point: 10 } });

  // Bài thi 2: PRIVATE, đã công bố và phân công cho học sinh mẫu
  const privateExam = await prisma.exam.create({
    data: {
      subjectId: math.id, createdById: teacher.id, title: 'Bài kiểm tra nâng cao riêng tư',
      durationMinutes: 60, passPercentage: 60, status: 'PUBLISHED', visibility: 'PRIVATE'
    },
  });
  await prisma.examQuestion.create({ data: { examId: privateExam.id, questionId: q2.id, questionOrder: 1, point: 10 } });
  await prisma.examStudent.create({ data: { examId: privateExam.id, studentId: s1.id } });

  // Bài thi 3: có mật khẩu truy cập (mật khẩu: "secret123")
  const accessPasswordHash = await bcrypt.hash('secret123', salt);
  const protectedExam = await prisma.exam.create({
    data: {
      subjectId: math.id, createdById: teacher.id, title: 'Bài thi cuối kỳ bảo mật',
      durationMinutes: 90, passPercentage: 70, status: 'PUBLISHED', visibility: 'PUBLIC',
      accessPasswordHash
    },
  });
  await prisma.examQuestion.create({ data: { examId: protectedExam.id, questionId: q1.id, questionOrder: 1, point: 5 } });
  await prisma.examQuestion.create({ data: { examId: protectedExam.id, questionId: q2.id, questionOrder: 2, point: 5 } });

  console.log('Nạp dữ liệu mẫu hoàn tất!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
