import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function ensureBootstrapCoordinator(prisma: PrismaClient) {
  const email = process.env.BOOTSTRAP_COORDINATOR_EMAIL?.toLowerCase().trim();
  const rawPassword = process.env.BOOTSTRAP_COORDINATOR_PASSWORD?.trim();

  if (!email || !rawPassword) return;

  const passwordHash = await bcrypt.hash(rawPassword, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      firstName: process.env.BOOTSTRAP_COORDINATOR_FIRST_NAME?.trim() || "Admin",
      lastName: process.env.BOOTSTRAP_COORDINATOR_LAST_NAME?.trim() || "User",
      role: "COORDINATOR",
      department: process.env.BOOTSTRAP_COORDINATOR_DEPARTMENT?.trim() || "Administration",
      passwordHash,
      status: "ACTIVE",
      emailVerified: new Date(),
    },
    create: {
      email,
      firstName: process.env.BOOTSTRAP_COORDINATOR_FIRST_NAME?.trim() || "Admin",
      lastName: process.env.BOOTSTRAP_COORDINATOR_LAST_NAME?.trim() || "User",
      role: "COORDINATOR",
      department: process.env.BOOTSTRAP_COORDINATOR_DEPARTMENT?.trim() || "Administration",
      passwordHash,
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  console.log(`  Bootstrap coordinator: ${user.email}`);
}

async function main() {
  console.log("Seeding NAUB Prism for Nigerian Army University Biu...");

  await ensureBootstrapCoordinator(prisma);

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
