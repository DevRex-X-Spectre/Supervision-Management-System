import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";

const f = createUploadthing();

const documentTypes = {
  pdf: { maxFileSize: "16MB" as const, maxFileCount: 5 },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    maxFileSize: "16MB" as const,
    maxFileCount: 5,
  },
};

export const ourFileRouter = {
  /** Student research progress submissions */
  researchDocument: f(documentTypes)
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("You must be signed in to upload files.");
      }
      if (session.user.role !== "STUDENT" && session.user.role !== "SUPERVISOR") {
        throw new UploadThingError("Only students and supervisors can upload research documents.");
      }
      return { userId: session.user.id, role: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl ?? file.url,
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }),

  /** Student and supervisor chat attachments (PDF / DOCX) */
  chatDocument: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 3 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 3,
    },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("You must be signed in to upload chat documents.");
      }
      if (session.user.role !== "STUDENT" && session.user.role !== "SUPERVISOR") {
        throw new UploadThingError("Only students and supervisors can attach documents in chat.");
      }
      return { userId: session.user.id, role: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl ?? file.url,
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
