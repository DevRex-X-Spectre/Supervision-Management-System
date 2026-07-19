# NAUB Prism Implementation

## 1. System Overview

NAUB Prism is a web-based interactive research supervision system for Nigerian Army University Biu. The system digitizes undergraduate final-year project supervision by giving students, supervisors, and project coordinators separate role-based dashboards for managing projects, submissions, feedback, deadlines, notifications, chat, and analytics.

The implementation is a modern full-stack Next.js application. It uses server-rendered pages and server actions for most workflows, PostgreSQL for persistent storage, Prisma for database access, Auth.js for authentication, UploadThing for document upload, Pusher for realtime communication, and Inngest for scheduled background jobs.

The implemented system supports three roles:

- `STUDENT`
- `SUPERVISOR`
- `COORDINATOR`

Students create project records, submit progress, upload project documents, receive feedback, chat with assigned supervisors, and use the AI Project Guide. Supervisors manage assigned students, review submissions, give feedback, set deadlines, and chat with students. Coordinators manage users, assign supervisors, configure milestone templates, publish announcements, view analytics, and inspect audit logs.

## 2. Technology Stack

| Layer | Implementation |
| --- | --- |
| Application framework | Next.js 15 App Router |
| Language | TypeScript |
| UI | React 19, Tailwind CSS, custom shadcn-style components |
| Database | PostgreSQL |
| ORM | Prisma with `@prisma/adapter-pg` |
| Authentication | Auth.js / NextAuth v5 credentials provider |
| Session strategy | JWT sessions |
| File upload | UploadThing |
| Realtime chat and notifications | Pusher |
| Background jobs | Inngest |
| Validation | Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Email support | Optional Resend integration, skipped if `RESEND_API_KEY` is not configured |

The actual implementation is based on Next.js, PostgreSQL, and Prisma. It is not a PHP/MySQL/LAMP implementation.

## 3. Project Structure

```txt
src/
  app/                  Application routes, layouts, API endpoints
  components/           UI, shared forms, dashboard widgets
  features/             Domain server actions and queries
  inngest/              Scheduled background job definitions
  lib/                  Infrastructure helpers and service wrappers
  types/                Shared TypeScript types
prisma/
  schema.prisma         Database schema
  seed.ts               Bootstrap coordinator seed
```

The codebase separates the route layer from business logic. Pages and layouts live under `src/app`, while domain workflows live in `src/features`. Shared infrastructure such as authentication, Prisma, Pusher, notifications, UploadThing, audit logging, and validation schemas live in `src/lib`.

## 4. Routing and Application Layout

The app uses the Next.js App Router. Routes are grouped by purpose:

```txt
src/app/(auth)/
  login/
  register/
  forgot-password/
  reset-password/

src/app/(dashboard)/
  student/
  supervisor/
  coordinator/

src/app/api/
  auth/[...nextauth]/
  uploadthing/
  pusher/auth/
  inngest/
  ai/project-guide/
```

The dashboard routes are role-specific. Each role has a layout that calls `requireUser()` and passes the authenticated user into a shared dashboard shell.

The shared dashboard shell is implemented in:

```txt
src/components/layout/dashboard-shell.tsx
src/components/layout/sidebar.tsx
src/components/layout/topbar.tsx
```

Each role defines its own sidebar links, but all dashboards use the same shell structure. This keeps navigation consistent while allowing each role to expose only relevant pages.

## 5. Authentication and Authorization

Authentication is implemented with Auth.js in:

```txt
src/lib/auth.ts
src/features/auth/actions.ts
src/lib/auth-credentials.ts
src/lib/session.ts
src/middleware.ts
```

The system uses a credentials provider. Users log in with email and password. Passwords are hashed with bcrypt and verified during sign-in. Session data is stored in a JWT so middleware can read role information without querying the database on every request.

The session includes:

- user ID
- email
- first name
- last name
- role
- status
- department
- title
- avatar URL
- assigned supervisor ID

Authorization happens in two layers.

First, `src/middleware.ts` protects routes. It redirects unauthenticated users to `/login` and prevents users from opening dashboards that do not match their role. For example, a student cannot open `/supervisor`, and a supervisor cannot open `/coordinator`.

Second, server pages and server actions call `requireUser()`. This ensures that even if a route is reached, the actual operation is still protected on the server.

Example:

```ts
const user = await requireUser(["STUDENT"]);
```

This pattern is used throughout project creation, submissions, feedback, coordinator actions, chat, and analytics.

## 6. Database Implementation

The database is PostgreSQL, accessed through Prisma. The Prisma client is configured in:

```txt
src/lib/prisma.ts
```

The Prisma schema is defined in:

```txt
prisma/schema.prisma
```

The main models are:

| Model | Purpose |
| --- | --- |
| `User` | Stores students, supervisors, and coordinators |
| `ResearchProject` | Stores each student's research project |
| `MilestoneTemplate` | Stores reusable milestone templates |
| `ProjectMilestone` | Stores project-specific milestones |
| `Submission` | Stores student progress submissions |
| `SubmissionFile` | Stores uploaded file metadata |
| `Feedback` | Stores supervisor review comments and decisions |
| `Conversation` | Stores chat conversation metadata |
| `Message` | Stores chat messages |
| `Notification` | Stores in-app notifications |
| `Announcement` | Stores coordinator announcements |
| `Deadline` | Stores project or milestone deadlines |
| `AuditLog` | Stores high-level activity logs |

Important relationships include:

- One student has one research project.
- One supervisor can supervise many students.
- One research project can have many milestones.
- One submission belongs to one student and one project.
- One submission can have many uploaded files.
- One submission can have many feedback records.
- One conversation has two participants and many messages.
- One user can have many notifications.

The schema uses indexes on role, status, supervisor assignment, project status, submission status, submitted date, notification read state, and audit log fields. These indexes support common dashboard and search queries.

## 7. Server Actions and Feature Layer

The app uses Next.js server actions for most mutations. These actions are grouped by domain under `src/features`.

```txt
src/features/auth/actions.ts
src/features/users/actions.ts
src/features/projects/actions.ts
src/features/submissions/actions.ts
src/features/chat/actions.ts
src/features/notifications/actions.ts
src/features/analytics/queries.ts
```

Most server actions follow the same implementation pattern:

1. Require an authenticated user with the correct role.
2. Read submitted `FormData`.
3. Validate input with Zod.
4. Check ownership and permissions.
5. Perform Prisma database operations.
6. Create notifications or audit logs where needed.
7. Revalidate affected pages with `revalidatePath()`.
8. Return a structured `ActionResult`.

This pattern keeps validation, authorization, and data mutation close together.

## 8. Student Workflow Implementation

Student features are implemented mainly under:

```txt
src/app/(dashboard)/student/
src/features/projects/actions.ts
src/features/submissions/actions.ts
src/components/shared/project-form.tsx
src/components/shared/submission-form.tsx
```

A student can:

- register and log in;
- view the student dashboard;
- create or update a research project;
- view milestones;
- upload project documents;
- submit progress for review;
- view submission history;
- read supervisor feedback;
- receive notifications;
- chat with assigned supervisor;
- use the Project Guide.

When a student creates a project, `upsertProjectAction()` checks whether the student already has a project. If a project exists, it updates it. If not, it creates a new project and generates project milestones from active milestone templates.

When a student submits work, `createSubmissionAction()` validates the submission, confirms the student has a project, confirms a supervisor is assigned, stores file metadata, creates a submission record, updates the milestone status, notifies the supervisor, writes an audit log, and revalidates the student and supervisor pages.

## 9. Supervisor Workflow Implementation

Supervisor features are implemented mainly under:

```txt
src/app/(dashboard)/supervisor/
src/features/submissions/actions.ts
src/features/projects/actions.ts
src/components/shared/feedback-form.tsx
src/components/shared/deadline-forms.tsx
```

A supervisor can:

- view assigned students;
- view pending review queue;
- open individual submissions;
- give structured feedback;
- approve, reject, or request revision;
- set project or milestone deadlines;
- create custom milestones;
- receive notifications;
- chat with assigned students.

The main feedback workflow is handled by `submitFeedbackAction()`. It requires a supervisor role, validates the decision and comment, checks that the submission belongs to one of the supervisor's assigned projects, creates a feedback record, updates submission status, updates milestone status, notifies the student, writes an audit log, and revalidates affected pages.

The feedback statuses are:

- `APPROVED`
- `REJECTED`
- `NEEDS_REVISION`

For milestone submissions, approval marks the milestone as approved. Rejection or revision moves the milestone back into progress.

## 10. Coordinator Workflow Implementation

Coordinator features are implemented mainly under:

```txt
src/app/(dashboard)/coordinator/
src/features/users/actions.ts
src/features/projects/actions.ts
src/features/analytics/queries.ts
src/features/notifications/actions.ts
```

A coordinator can:

- view institutional analytics;
- manage users;
- create users;
- activate, suspend, or deactivate users;
- assign supervisors to students;
- manage milestone templates;
- create announcements;
- view global search results;
- view audit logs;
- monitor unassigned students and pending reviews.

Supervisor assignment is handled by `assignSupervisorAction()`. The action requires coordinator access, validates the student and supervisor, updates the student's `assignedSupervisorId`, updates any existing research project supervisor ID, notifies both student and supervisor, writes an audit log, and revalidates coordinator pages.

Coordinator analytics are implemented in `src/features/analytics/queries.ts`. The analytics include:

- number of students;
- number of supervisors;
- active projects;
- total submissions;
- pending submissions;
- approved submissions;
- rejected submissions;
- submissions needing revision;
- unassigned students;
- average feedback turnaround;
- recent audit events.

The coordinator can see metadata and system activity, but the app intentionally restricts access to private chat transcripts and uploaded research document contents.

## 11. File Upload Implementation

File upload is implemented with UploadThing in:

```txt
src/lib/uploadthing.ts
src/app/api/uploadthing/route.ts
src/lib/uploadthing-components.ts
src/components/shared/submission-form.tsx
```

The upload router defines a `researchDocument` endpoint. It accepts:

- PDF files;
- DOCX files.

The upload middleware requires an authenticated user. Students and supervisors can upload research documents, while coordinators are blocked from uploading research documents because their role is administrative.

After upload, the client receives file metadata:

- file name;
- URL;
- storage key;
- size;
- MIME type.

The metadata is submitted with the progress form and stored in the `SubmissionFile` table. The database stores file references, not raw document binary content.

## 12. Realtime Chat Implementation

Chat is implemented in:

```txt
src/features/chat/actions.ts
src/components/shared/chat-panel.tsx
src/lib/pusher-client.ts
src/lib/pusher-server.ts
src/app/api/pusher/auth/route.ts
```

The system supports three conversation types:

- `STUDENT_SUPERVISOR`
- `COORDINATOR_STUDENT`
- `COORDINATOR_SUPERVISOR`

The function `canMessage()` enforces chat rules:

- A student can message only the assigned supervisor.
- A supervisor can message only assigned students.
- A coordinator can message students or supervisors.
- Inactive users cannot use messaging.

When a message is sent, the system creates a `Message` record, updates the conversation's `lastMessageAt`, triggers a Pusher event on a private conversation channel, creates a notification for the recipient, and revalidates chat-related pages.

Message reading is also protected. Only direct participants in a conversation can load message content. This prevents coordinators from reading unrelated student-supervisor conversations.

## 13. Notification Implementation

Notifications are implemented in:

```txt
src/lib/notifications.ts
src/features/notifications/actions.ts
src/components/shared/notifications-list.tsx
```

The `createNotification()` function stores notification records in PostgreSQL and triggers a realtime Pusher event on a private user channel.

Notification types include:

- `SUBMISSION`
- `FEEDBACK`
- `MESSAGE`
- `DEADLINE`
- `ASSIGNMENT`
- `ANNOUNCEMENT`
- `SYSTEM`

The notification system supports read and unread states through the `readAt` field. Dashboard layouts fetch unread counts and display them in the topbar.

Email support exists through `src/lib/email.ts`, but it is optional. If `RESEND_API_KEY` is not configured, email sending is skipped. Therefore, the core implemented notification path is in-app notification plus realtime Pusher delivery.

## 14. AI Project Guide Implementation

The AI Project Guide is implemented in:

```txt
src/components/shared/project-guide-chat.tsx
src/app/api/ai/project-guide/route.ts
src/lib/ai/project-guide-knowledge.ts
```

The Project Guide is a rule-based academic assistant. It does not use a live external large language model. Its knowledge base contains guidance on:

- project topic selection;
- Chapter One structure;
- literature review;
- methodology;
- results and analysis;
- conclusion and recommendations;
- APA 7 citation and referencing;
- academic writing standards;
- supervisor feedback practices.

The API route accepts recent chat messages, normalizes them, limits message length, and extracts the latest user question. It then calls `answerProjectGuideQuestion()`, which scores the user's question against predefined keyword rules and returns the best matching answer.

If no rule matches, the system returns a fallback response explaining what the guide can help with.

This implementation keeps the AI scope controlled. The guide supports academic understanding but does not write complete projects, invent sources, replace supervisors, or make department-specific decisions.

## 15. Analytics and Dashboard Queries

Dashboard data is implemented in:

```txt
src/features/analytics/queries.ts
```

The student dashboard loads:

- project record;
- milestone progress;
- submission counts;
- pending submissions;
- approved submissions;
- unread notifications;
- upcoming deadlines;
- recent submissions;
- announcements.

The supervisor dashboard loads:

- assigned students;
- pending reviews;
- feedback count;
- student project progress.

The coordinator dashboard loads:

- total students;
- total supervisors;
- active projects;
- submission distribution;
- unassigned students;
- average review turnaround;
- recent audit logs.

Some dashboard queries use `withDatabaseFallback()` from `src/lib/db-error.ts`. This provides a fallback value if the database is temporarily unavailable and supports lightweight in-memory caching for selected reads.

## 16. Audit Logging

Audit logging is implemented in:

```txt
src/lib/audit.ts
```

The system writes audit records for important actions such as:

- user login;
- user registration;
- project creation or update;
- submission creation;
- feedback submission;
- supervisor assignment;
- user status update;
- password reset request and completion.

Audit logs store:

- actor ID;
- action;
- entity type;
- entity ID;
- metadata;
- timestamp.

Coordinators can view audit metadata as part of institutional oversight.

## 17. Background Jobs

Background jobs are implemented with Inngest in:

```txt
src/inngest/client.ts
src/inngest/functions.ts
src/app/api/inngest/route.ts
```

The implemented jobs are:

- daily deadline reminders;
- weekly supervisor pending review digest.

The deadline reminder job checks deadlines due within 48 hours or already overdue and sends notifications to students. It also marks overdue milestones as `OVERDUE` when their due dates have passed and their status is still `NOT_STARTED` or `IN_PROGRESS`.

The supervisor digest job checks active supervisors and notifies them if they have pending submissions awaiting review.

## 18. Validation

Validation schemas are implemented with Zod in:

```txt
src/lib/validations/auth.ts
src/lib/validations/users.ts
src/lib/validations/project.ts
src/lib/validations/submission.ts
```

The system validates:

- login credentials;
- registration data;
- password reset data;
- project forms;
- milestones;
- deadlines;
- submissions;
- feedback;
- user creation;
- supervisor assignment;
- profile updates;
- chat messages.

Validation is performed on the server before database operations. This protects the database from malformed or incomplete inputs.

## 19. UI Implementation

The UI is built with reusable components:

```txt
src/components/ui/
src/components/shared/
src/components/layout/
```

The `ui` directory contains base components such as:

- buttons;
- inputs;
- labels;
- cards;
- badges;
- status badges;
- stat cards;
- empty states;
- loading indicators.

The `shared` directory contains feature-level components such as:

- auth forms;
- project form;
- submission form;
- feedback form;
- deadline forms;
- coordinator forms;
- chat panel;
- notification list;
- Project Guide chat;
- analytics charts.

The `layout` directory contains dashboard shell, sidebar, and topbar components.

The interface is mobile-responsive and uses an academic visual identity based on deep green, gold accents, neutral backgrounds, and clear dashboard cards.

## 20. Security Considerations

The implementation includes the following security decisions:

- Passwords are hashed with bcrypt.
- Sessions are handled through signed JWTs.
- Middleware protects route access.
- Server actions repeat role checks before mutations.
- Zod validates submitted data.
- UploadThing middleware blocks unauthenticated uploads.
- Coordinators cannot upload research documents.
- Coordinators cannot read private student-supervisor chat content unless they are direct participants.
- Coordinators see submission metadata but should not inspect private document contents through coordinator flows.
- Password reset tokens expire after one hour.
- Audit logs preserve high-level activity history.

## 21. Main Workflows

### Student Submission Workflow

1. Student logs in.
2. Student creates or updates project profile.
3. System links the project to assigned supervisor where available.
4. Student selects milestone or general progress update.
5. Student uploads PDF/DOCX files.
6. Student submits progress.
7. Server validates request and stores submission.
8. System updates milestone status.
9. Supervisor receives notification.
10. Supervisor reviews and gives feedback.
11. Student receives feedback notification.

### Supervisor Review Workflow

1. Supervisor logs in.
2. Supervisor opens review queue.
3. Supervisor selects a pending submission.
4. System confirms that the submission belongs to an assigned student.
5. Supervisor enters structured feedback.
6. Supervisor selects decision.
7. System stores feedback and updates submission status.
8. Student receives notification.

### Coordinator Assignment Workflow

1. Coordinator logs in.
2. Coordinator opens assignments page.
3. Coordinator selects student and supervisor.
4. System validates both users.
5. Student record is updated with supervisor ID.
6. Existing project record is updated with supervisor ID.
7. Student and supervisor receive assignment notifications.
8. Audit log is written.

### Project Guide Workflow

1. User opens Project Guide chat.
2. User asks academic project question.
3. Client sends recent messages to `/api/ai/project-guide`.
4. API route validates and normalizes input.
5. Rule matcher checks best matching guidance.
6. Guide returns answer.
7. Client renders response as markdown.

## 22. Limitations of Current Implementation

The current implementation does not include:

- a separate administrator role;
- a formal defense scheduling module;
- automatic duplicate topic detection;
- plagiarism detection;
- full institutional email deployment;
- chatbot interaction logging;
- live LLM integration;
- separate Department table and department-specific rules;
- integration with existing university portals.

These limitations are suitable candidates for future work.

## 23. Conclusion

NAUB Prism was implemented as a complete role-based research supervision platform. The system replaces scattered manual supervision activities with a centralized web application that supports project tracking, milestone management, document submission, supervisor feedback, coordinator analytics, realtime chat, notifications, audit logging, deadline reminders, and AI-assisted academic guidance.

The implementation is modular and closely aligned with the main goal of the project: improving undergraduate final-year project supervision at Nigerian Army University Biu through a secure, structured, and intelligent web-based system.
