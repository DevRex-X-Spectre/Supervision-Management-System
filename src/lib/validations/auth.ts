import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid institutional email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is required").max(50),
    lastName: z.string().min(2, "Last name is required").max(50),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "SUPERVISOR"], {
      required_error: "Select whether you are a student or supervisor",
    }),
    department: z.string().min(2, "Department is required").max(120),
    matricNumber: z.string().optional(),
    staffId: z.string().optional(),
    phone: z.string().optional(),
    title: z.string().optional(),
    specialization: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (data.role === "STUDENT" && !data.matricNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Matriculation number is required for students",
        path: ["matricNumber"],
      });
    }
    if (data.role === "SUPERVISOR" && !data.staffId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Staff ID is required for supervisors",
        path: ["staffId"],
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
