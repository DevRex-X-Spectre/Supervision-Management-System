import { PrismaClient, Role, type Role as RoleType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

type SeedUser = {
  email: string;
  firstName: string;
  lastName: string;
  role: RoleType;
  department?: string;
  staffId?: string;
  matricNumber?: string;
  title?: string;
  specialization?: string;
  phone?: string;
};

type SeedData = {
  users: SeedUser[];
  assignments: { studentEmail: string; supervisorEmail: string }[];
  milestoneTemplates: {
    name: string;
    description: string;
    sortOrder: number;
    defaultDays?: number;
  }[];
  projects: {
    studentEmail: string;
    title: string;
    topic?: string;
    abstract?: string;
    sessionYear?: string;
  }[];
  announcements: { title: string; body: string }[];
};

async function main() {
  const seedPath = join(__dirname, "seed-data.json");
  const raw = readFileSync(seedPath, "utf-8");
  const data = JSON.parse(raw) as SeedData;
  const password = process.env.SEED_DEFAULT_PASSWORD ?? "Password123!";
  const passwordHash = await bcrypt.hash(password, 12);

  console.log("Seeding Collins for Nigerian Army University Biu...");

  const userMap = new Map<string, string>();

  for (const u of data.users) {
    const user = await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role as Role,
        department: u.department,
        staffId: u.staffId,
        matricNumber: u.matricNumber,
        title: u.title,
        specialization: u.specialization,
        phone: u.phone,
        passwordHash,
        status: "ACTIVE",
      },
      create: {
        email: u.email.toLowerCase(),
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role as Role,
        department: u.department,
        staffId: u.staffId,
        matricNumber: u.matricNumber,
        title: u.title,
        specialization: u.specialization,
        phone: u.phone,
        passwordHash,
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });
    userMap.set(u.email.toLowerCase(), user.id);
    console.log(`  User: ${u.email} (${u.role})`);
  }

  for (const a of data.assignments) {
    const studentId = userMap.get(a.studentEmail.toLowerCase());
    const supervisorId = userMap.get(a.supervisorEmail.toLowerCase());
    if (!studentId || !supervisorId) continue;
    await prisma.user.update({
      where: { id: studentId },
      data: { assignedSupervisorId: supervisorId },
    });
    console.log(`  Assignment: ${a.studentEmail} -> ${a.supervisorEmail}`);
  }

  for (const t of data.milestoneTemplates) {
    const existing = await prisma.milestoneTemplate.findFirst({
      where: { name: t.name },
    });
    if (existing) {
      await prisma.milestoneTemplate.update({
        where: { id: existing.id },
        data: {
          description: t.description,
          sortOrder: t.sortOrder,
          defaultDays: t.defaultDays,
          isActive: true,
        },
      });
    } else {
      await prisma.milestoneTemplate.create({
        data: {
          name: t.name,
          description: t.description,
          sortOrder: t.sortOrder,
          defaultDays: t.defaultDays,
          isActive: true,
        },
      });
    }
  }
  console.log(`  Milestone templates: ${data.milestoneTemplates.length}`);

  const templates = await prisma.milestoneTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  for (const p of data.projects) {
    const studentId = userMap.get(p.studentEmail.toLowerCase());
    if (!studentId) continue;
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) continue;

    const existing = await prisma.researchProject.findUnique({
      where: { studentId },
    });

    let projectId: string;
    if (existing) {
      const updated = await prisma.researchProject.update({
        where: { id: existing.id },
        data: {
          title: p.title,
          abstract: p.abstract,
          topic: p.topic,
          sessionYear: p.sessionYear,
          supervisorId: student.assignedSupervisorId,
          status: "ACTIVE",
        },
      });
      projectId = updated.id;
    } else {
      const created = await prisma.researchProject.create({
        data: {
          title: p.title,
          abstract: p.abstract,
          topic: p.topic,
          sessionYear: p.sessionYear,
          studentId,
          supervisorId: student.assignedSupervisorId,
          status: "ACTIVE",
          startDate: new Date(),
        },
      });
      projectId = created.id;

      await prisma.projectMilestone.createMany({
        data: templates.map((t, index) => ({
          projectId,
          templateId: t.id,
          title: t.name,
          description: t.description,
          sortOrder: t.sortOrder,
          status: index === 0 ? "IN_PROGRESS" : "NOT_STARTED",
          dueDate: t.defaultDays
            ? new Date(Date.now() + t.defaultDays * 24 * 60 * 60 * 1000)
            : null,
          isCustom: false,
        })),
      });
    }
    console.log(`  Project: ${p.title}`);
  }

  const coordinatorId = userMap.get("coordinator@naub.edu.ng");
  if (coordinatorId) {
    for (const ann of data.announcements) {
      const exists = await prisma.announcement.findFirst({
        where: { title: ann.title, createdById: coordinatorId },
      });
      if (!exists) {
        await prisma.announcement.create({
          data: {
            title: ann.title,
            body: ann.body,
            createdById: coordinatorId,
            isActive: true,
          },
        });
      }
    }
  }

  console.log("\nSeed complete.");
  console.log(`Default password for all seed users: ${password}`);
  console.log("Remove prisma/seed-data.json when you no longer need demo accounts.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
