import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  const classrooms = await prisma.classroom.findMany();
  const enrollments = await prisma.classStudent.findMany();
  console.log('USERS:', users);
  console.log('CLASSROOMS:', classrooms);
  console.log('ENROLLMENTS:', enrollments);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
