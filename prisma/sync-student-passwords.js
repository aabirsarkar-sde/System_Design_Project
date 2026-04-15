const bcrypt = require("bcryptjs");
const { PrismaClient, UserRole } = require("@prisma/client");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const students = await prisma.user.findMany({
    where: {
      role: UserRole.STUDENT,
      enrollmentNumber: {
        not: null,
      },
    },
    select: {
      userId: true,
      enrollmentNumber: true,
    },
  });

  const passwordCache = new Map();

  for (const student of students) {
    const enrollmentNumber = student.enrollmentNumber;

    if (!enrollmentNumber || enrollmentNumber.length < 4) {
      continue;
    }

    const password = enrollmentNumber.slice(-4);

    if (!passwordCache.has(password)) {
      passwordCache.set(password, await bcrypt.hash(password, 10));
    }

    await prisma.user.update({
      where: { userId: student.userId },
      data: {
        passwordHash: passwordCache.get(password),
      },
    });
  }

  console.log(`Updated passwords for ${students.length} student accounts.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
