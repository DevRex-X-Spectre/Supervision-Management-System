# Appendix: Key Source Code Extracts

## Appendix A: Authentication and Role-Based Access Control

**Source file:** `src/lib/session.ts`

**Function:** `requireUser()`

```ts
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) {
    redirect(roleHome(user.role));
  }
  return user;
}
```

**Summary:** This function protects server pages and server actions. It checks whether a user is signed in and optionally verifies that the user belongs to the required role before allowing access.

## Appendix B: Project Creation and Milestone Initialization

**Source file:** `src/features/projects/actions.ts`

**Function:** `upsertProjectAction()`

```ts
export async function upsertProjectAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser(["STUDENT"]);
  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    topic: formData.get("topic") || undefined,
    abstract: formData.get("abstract") || undefined,
    sessionYear: formData.get("sessionYear") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: "Please provide a valid project title and details." };
  }

  const existing = await prisma.researchProject.findUnique({
    where: { studentId: user.id },
  });

  if (existing) {
    await prisma.researchProject.update({
      where: { id: existing.id },
      data: {
        ...parsed.data,
        supervisorId: user.assignedSupervisorId,
      },
    });
  } else {
    const project = await prisma.researchProject.create({
      data: {
        ...parsed.data,
        studentId: user.id,
        supervisorId: user.assignedSupervisorId,
        status: "ACTIVE",
        startDate: new Date(),
      },
    });

    const templates = await prisma.milestoneTemplate.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (templates.length) {
      await prisma.projectMilestone.createMany({
        data: templates.map((t, index) => ({
          projectId: project.id,
          templateId: t.id,
          title: t.name,
          description: t.description,
          sortOrder: t.sortOrder,
          status: index === 0 ? "IN_PROGRESS" : "NOT_STARTED",
          dueDate: t.defaultDays
            ? new Date(Date.now() + t.defaultDays * 24 * 60 * 60 * 1000)
            : null,
        })),
      });
    }
  }

  await writeAuditLog({
    actorId: user.id,
    action: existing ? "PROJECT_UPDATED" : "PROJECT_CREATED",
    entityType: "ResearchProject",
    entityId: existing?.id,
    metadata: { title: parsed.data.title },
  });

  revalidatePath("/student/project");
  revalidatePath("/student");
  return { success: true, message: "Research project saved." };
}
```

**Summary:** This function allows a student to create or update a research project. When a new project is created, the system also initializes default milestones from active milestone templates.

## Appendix C: Submission Upload and Supervisor Notification

**Source file:** `src/features/submissions/actions.ts`

**Function:** `createSubmissionAction()`

```ts
export async function createSubmissionAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser(["STUDENT"]);

  let files: unknown[] = [];
  const filesRaw = formData.get("files");
  if (typeof filesRaw === "string" && filesRaw) {
    try {
      files = JSON.parse(filesRaw);
    } catch {
      return { success: false, error: "Invalid file payload." };
    }
  }

  const parsed = submissionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    milestoneId: formData.get("milestoneId") || null,
    files,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Please correct the form errors.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const project = await prisma.researchProject.findUnique({
    where: { studentId: user.id },
  });

  if (!project) {
    return {
      success: false,
      error: "You need an active research project before submitting progress. Contact your coordinator.",
    };
  }

  if (!project.supervisorId) {
    return {
      success: false,
      error: "No supervisor is assigned to your project yet. Submissions will open after assignment.",
    };
  }

  const versionCount = await prisma.submission.count({
    where: {
      studentId: user.id,
      milestoneId: parsed.data.milestoneId ?? undefined,
      title: parsed.data.milestoneId ? undefined : parsed.data.title,
    },
  });

  const submission = await prisma.submission.create({
    data: {
      projectId: project.id,
      studentId: user.id,
      milestoneId: parsed.data.milestoneId || null,
      title: parsed.data.title,
      description: parsed.data.description,
      status: "PENDING",
      version: versionCount + 1,
      files: {
        create: (parsed.data.files ?? []).map((f) => ({
          fileName: f.fileName,
          fileUrl: f.fileUrl,
          fileKey: f.fileKey,
          fileSize: f.fileSize,
          mimeType: f.mimeType,
        })),
      },
    },
  });

  if (parsed.data.milestoneId) {
    await prisma.projectMilestone.update({
      where: { id: parsed.data.milestoneId },
      data: { status: "SUBMITTED" },
    });
  }

  await createNotification({
    userId: project.supervisorId,
    type: "SUBMISSION",
    title: "New research progress submitted",
    body: `${user.firstName} ${user.lastName} submitted "${parsed.data.title}" for review.`,
    link: `/supervisor/reviews/${submission.id}`,
    relatedEntityType: "Submission",
    relatedEntityId: submission.id,
  });

  await writeAuditLog({
    actorId: user.id,
    action: "SUBMISSION_CREATED",
    entityType: "Submission",
    entityId: submission.id,
    metadata: { title: submission.title, projectId: project.id },
  });

  revalidatePath("/student");
  revalidatePath("/student/submissions");
  revalidatePath("/supervisor");
  revalidatePath("/supervisor/reviews");

  return { success: true, data: { id: submission.id }, message: "Progress submitted for review." };
}
```

**Summary:** This function handles student project submissions. It validates the submission, checks project and supervisor assignment, stores file metadata, updates milestone status, notifies the supervisor, and records an audit log.

## Appendix D: In-App Notification Delivery

**Source file:** `src/lib/notifications.ts`

**Function:** `createNotification()`

```ts
export async function createNotification(input: NotifyInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
    },
  });

  try {
    await pusherServer.trigger(`private-user-${input.userId}`, "notification", {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      link: notification.link,
      createdAt: notification.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Pusher notification failed", error);
  }

  if (input.email !== false) {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { email: true, firstName: true },
    });
    if (user) {
      void sendNotificationEmail({
        to: user.email,
        firstName: user.firstName,
        title: input.title,
        body: input.body,
        link: input.link,
      });
    }
  }

  return notification;
}
```

**Summary:** This function creates notification records and sends realtime notification events through Pusher. Email delivery is optional and depends on the configured email environment.

## Appendix E: AI Project Guide Response Matching

**Source file:** `src/lib/ai/project-guide-knowledge.ts`

**Function:** `answerProjectGuideQuestion()`

```ts
function scoreRule(question: string, rule: RuleResponse) {
  return rule.keywords.reduce((score, keyword) => {
    return question.includes(keyword) ? score + keyword.length : score;
  }, 0);
}

export function answerProjectGuideQuestion(question: string) {
  const normalizedQuestion = question.toLowerCase();
  const bestRule = RULE_RESPONSES.map((rule) => ({
    rule,
    score: scoreRule(normalizedQuestion, rule),
  })).sort((a, b) => b.score - a.score)[0];

  if (!bestRule || bestRule.score === 0) return FALLBACK_RESPONSE;
  return bestRule.rule.answer;
}
```

**Summary:** This function powers the rule-based AI Project Guide. It compares the student's question with predefined academic guidance rules and returns the most relevant response.
