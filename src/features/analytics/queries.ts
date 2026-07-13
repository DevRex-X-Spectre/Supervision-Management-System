import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { withDatabaseFallback } from "@/lib/db-error";

export async function getStudentDashboardStats(studentId: string) {
  const [project, submissions, pending, approved, notifications, deadlines] =
    await withDatabaseFallback(
      () =>
        Promise.all([
          prisma.researchProject.findUnique({
            where: { studentId },
            include: {
              milestones: { orderBy: { sortOrder: "asc" } },
              supervisor: {
                select: { id: true, firstName: true, lastName: true, title: true, email: true },
              },
            },
          }),
          prisma.submission.count({ where: { studentId } }),
          prisma.submission.count({ where: { studentId, status: "PENDING" } }),
          prisma.submission.count({ where: { studentId, status: "APPROVED" } }),
          prisma.notification.count({ where: { userId: studentId, readAt: null } }),
          prisma.deadline.findMany({
            where: {
              project: { studentId },
              dueAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
            orderBy: { dueAt: "asc" },
            take: 5,
          }),
        ]),
      [null, 0, 0, 0, 0, []],
      `getStudentDashboardStats:${studentId}`
    );

  const milestoneTotal = project?.milestones.length ?? 0;
  const milestoneDone =
    project?.milestones.filter((m) => m.status === "APPROVED").length ?? 0;

  return {
    project,
    submissions,
    pending,
    approved,
    notifications,
    deadlines,
    milestoneTotal,
    milestoneDone,
    completionRate: milestoneTotal ? Math.round((milestoneDone / milestoneTotal) * 100) : 0,
  };
}

export async function getSupervisorDashboardStats(supervisorId: string) {
  const [students, pendingReviews, reviewed] = await withDatabaseFallback(
    () =>
      Promise.all([
        prisma.user.findMany({
          where: { assignedSupervisorId: supervisorId, role: "STUDENT", status: "ACTIVE" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricNumber: true,
            department: true,
            studentProject: {
              select: {
                id: true,
                title: true,
                status: true,
                milestones: { select: { status: true } },
              },
            },
          },
        }),
        prisma.submission.findMany({
          where: {
            status: "PENDING",
            project: { supervisorId },
          },
          include: {
            student: { select: { firstName: true, lastName: true, matricNumber: true } },
          },
          orderBy: { submittedAt: "asc" },
          take: 10,
        }),
        prisma.feedback.count({ where: { supervisorId } }),
      ]),
    [[], [], 0],
    `getSupervisorDashboardStats:${supervisorId}`
  );

  return {
    studentCount: students.length,
    students,
    pendingCount: pendingReviews.length,
    pendingReviews,
    reviewed,
  };
}

export async function getCoordinatorAnalytics() {
  await requireUser(["COORDINATOR"]);

  const [
    students,
    supervisors,
    activeProjects,
    submissions,
    pending,
    approved,
    rejected,
    needsRevision,
    recentAudit,
    unassignedStudents,
  ] = await withDatabaseFallback(
    () =>
      Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "SUPERVISOR" } }),
        prisma.researchProject.count({ where: { status: "ACTIVE" } }),
        prisma.submission.count(),
        prisma.submission.count({ where: { status: "PENDING" } }),
        prisma.submission.count({ where: { status: "APPROVED" } }),
        prisma.submission.count({ where: { status: "REJECTED" } }),
        prisma.submission.count({ where: { status: "NEEDS_REVISION" } }),
        prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 15,
          include: {
            actor: { select: { firstName: true, lastName: true, role: true } },
          },
        }),
        prisma.user.count({
          where: { role: "STUDENT", assignedSupervisorId: null, status: "ACTIVE" },
        }),
      ]),
    [0, 0, 0, 0, 0, 0, 0, 0, [], 0],
    "getCoordinatorAnalytics:summary"
  );

  // Average feedback turnaround (hours) from submission to review
  const reviewedSubs = await withDatabaseFallback(
    () =>
      prisma.submission.findMany({
        where: { reviewedAt: { not: null } },
        select: { submittedAt: true, reviewedAt: true },
        take: 200,
        orderBy: { reviewedAt: "desc" },
      }),
    [],
    "getCoordinatorAnalytics:reviewedSubs"
  );

  let avgTurnaroundHours = 0;
  if (reviewedSubs.length) {
    const totalMs = reviewedSubs.reduce((sum, s) => {
      if (!s.reviewedAt) return sum;
      return sum + (s.reviewedAt.getTime() - s.submittedAt.getTime());
    }, 0);
    avgTurnaroundHours = Math.round(totalMs / reviewedSubs.length / (1000 * 60 * 60));
  }

  const submissionsByStatus = [
    { name: "Pending", value: pending },
    { name: "Approved", value: approved },
    { name: "Needs revision", value: needsRevision },
    { name: "Rejected", value: rejected },
  ];

  return {
    students,
    supervisors,
    activeProjects,
    submissions,
    pending,
    approved,
    rejected,
    needsRevision,
    unassignedStudents,
    avgTurnaroundHours,
    submissionsByStatus,
    recentAudit,
  };
}

export async function globalSearch(query: string) {
  await requireUser(["COORDINATOR"]);
  const q = query.trim();
  if (q.length < 2) {
    return { users: [], projects: [], submissions: [] };
  }

  const [users, projects, submissions] = await withDatabaseFallback(
    () =>
      Promise.all([
        prisma.user.findMany({
          where: {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { matricNumber: { contains: q, mode: "insensitive" } },
              { staffId: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 15,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            department: true,
            status: true,
            matricNumber: true,
            staffId: true,
          },
        }),
        prisma.researchProject.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { topic: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 10,
          select: {
            id: true,
            title: true,
            status: true,
            student: { select: { firstName: true, lastName: true, matricNumber: true } },
            supervisor: { select: { firstName: true, lastName: true } },
          },
        }),
        prisma.submission.findMany({
          where: {
            OR: [{ title: { contains: q, mode: "insensitive" } }],
          },
          take: 10,
          select: {
            id: true,
            title: true,
            status: true,
            submittedAt: true,
            student: { select: { firstName: true, lastName: true } },
          },
        }),
      ]),
    [[], [], []],
    `globalSearch:${q}`
  );

  return { users, projects, submissions };
}
