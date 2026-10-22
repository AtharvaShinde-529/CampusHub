import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const memberships = await prisma.membership.findMany({
    include: {
      user: { include: { studentProfile: true } },
      organization: true
    }
  });

  console.log("STUDENT NAME | ROLE | CLUB NAME");
  console.log("---------------------------------");
  memberships.forEach(m => {
    if (m.user.studentProfile) {
      const name = m.user.studentProfile.firstName;
      console.log(`${name.padEnd(15)} | ${m.role.padEnd(17)} | ${m.organization.name}`);
    }
  });
}
main().finally(() => prisma.$disconnect());
