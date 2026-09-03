import { UserRole } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

const email = "faysalahmed915@gmail.com";

async function main() {
  const user = await prisma.user.update({
    where: { email },
    data: { name: "Faysal Ahmed", role: UserRole.ADMIN },
    select: { name: true, email: true, role: true },
  });
  console.log(`Promoted ${user.email} to ${user.role} as ${user.name}.`);
}

main()
  .catch((error: unknown) => {
    console.error("Admin promotion failed. Sign in or register this account first, then rerun the script.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
