# Collins

**Interactive Research Supervision System** for **Nigerian Army University Biu (NAUB)**.

Collins digitises academic research supervision for students, supervisors, and project coordinators with role-based access, progress submissions, structured feedback, real-time chat, milestones, deadlines, notifications, and institutional analytics.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 15 (App Router), TypeScript (strict) |
| UI | Tailwind CSS 4, custom academic components (shadcn-style) |
| DB | PostgreSQL (Neon recommended) + Prisma |
| Auth | Auth.js (NextAuth v5) credentials + JWT sessions |
| Realtime | Pusher (chat + live notifications) |
| Files | UploadThing (PDF / DOCX, max 10 MB) |
| Email | Resend |
| Jobs | Inngest (deadline reminders, weekly digests) |
| Deploy | Vercel + Neon |

## Features

- Self-registration for students and supervisors; coordinators can also create accounts
- One student maps to one supervisor
- Research project entity with predefined milestone templates **and** custom milestones
- Deadlines set by coordinators and supervisors
- Submissions with status lifecycle: Pending, Approved, Rejected, Needs revision
- Structured supervisor feedback (markdown-friendly comments)
- Real-time chat: student-supervisor, and coordinator with either party
- Coordinators see analytics and audit metadata only (no private chat body, no file contents)
- In-app + email notifications
- Global search and audit log for coordinators
- Seed demo data in `prisma/seed-data.json` (delete when you no longer need demos)

## Project structure

```
src/
  app/                  # Routes (auth + role dashboards + API)
  components/           # UI + shared widgets
  features/             # Domain actions (auth, submissions, chat, ...)
  lib/                  # prisma, auth, pusher, email, validations
  inngest/              # Background jobs
  emails/               # (hooks for React Email templates)
prisma/
  schema.prisma
  seed.ts
  seed-data.json        # Demo users/projects (safe to delete later)
```

## Local setup (you run installs)

### 1. Install dependencies

```bash
cd /home/spectre/Documents/Works/Projects/Collins
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Fill in:

- `DATABASE_URL` (Neon Postgres connection string works for local + prod)
- `AUTH_SECRET` / `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- Pusher keys
- UploadThing token
- Resend API key
- Inngest keys (optional for local; jobs no-op until configured)

### 3. Database

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Inngest local (optional)

```bash
npx inngest-cli@latest dev
```

The app serves functions at `/api/inngest`.

## Demo accounts (from seed)

Default password: value of `SEED_DEFAULT_PASSWORD` or `Password123!`

| Role | Email |
| --- | --- |
| Coordinator | coordinator@naub.edu.ng |
| Supervisor | supervisor1@naub.edu.ng |
| Supervisor | supervisor2@naub.edu.ng |
| Student | student1@naub.edu.ng |
| Student | student2@naub.edu.ng |
| Student | student3@naub.edu.ng |
| Student | student4@naub.edu.ng |

To drop demo data later: delete `prisma/seed-data.json` (and clean the DB as needed).

## Deployment (Vercel + Neon)

1. Create a Neon project and copy `DATABASE_URL`.
2. Import the repo into Vercel.
3. Add all env vars from `.env.example` in the Vercel project settings.
4. Set `NEXT_PUBLIC_APP_URL` and `AUTH_URL` / `NEXTAUTH_URL` to the production URL.
5. Deploy. Run migrations/push and seed from your machine or a CI step:

```bash
npx prisma db push
npm run db:seed
```

6. Connect Inngest to your production `/api/inngest` endpoint.
7. Configure Pusher, UploadThing, and Resend for production domains.

## Security notes

- Role checks run in middleware **and** server actions / data queries
- Coordinators cannot load chat transcripts or download research files through the app APIs
- UploadThing middleware blocks coordinator research document uploads
- Password reset tokens expire after 1 hour
- Zod validates inputs on server actions

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js server |
| `npm run build` | Prisma generate + production build |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to Postgres |
| `npm run db:seed` | Seed demo data from JSON |
| `npm run db:studio` | Prisma Studio |

## Branding

Institution: **Nigerian Army University Biu**  
Product name: **Collins**  
Theme: deep academic green + gold accents, mobile-first responsive UI.
