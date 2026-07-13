import { Resend } from "resend";
import { absoluteUrl } from "@/lib/utils";
import { INSTITUTION } from "@/lib/constants";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const from = process.env.EMAIL_FROM ?? "Collins NAUB <onboarding@resend.dev>";

export async function sendNotificationEmail(input: {
  to: string;
  firstName: string;
  title: string;
  body: string;
  link?: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.info("[email:skipped] RESEND_API_KEY not set", input.title, input.to);
    return { skipped: true as const };
  }

  const href = input.link ? absoluteUrl(input.link) : absoluteUrl("/");

  try {
    await resend.emails.send({
      from,
      to: input.to,
      subject: `${INSTITUTION.systemName}: ${input.title}`,
      html: `
        <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">
          <div style="border-bottom:3px solid #14532d;padding-bottom:12px;margin-bottom:20px;">
            <strong style="color:#14532d;font-size:18px;">${INSTITUTION.systemName}</strong>
            <div style="color:#64748b;font-size:13px;">${INSTITUTION.name}</div>
          </div>
          <p>Dear ${input.firstName},</p>
          <h2 style="font-size:18px;margin:16px 0 8px;">${input.title}</h2>
          <p style="color:#334155;">${input.body}</p>
          <p style="margin:24px 0;">
            <a href="${href}" style="background:#14532d;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">
              Open in Collins
            </a>
          </p>
          <p style="font-size:12px;color:#94a3b8;margin-top:32px;">
            This is an automated message from the ${INSTITUTION.systemName} platform at ${INSTITUTION.name}.
          </p>
        </div>
      `,
    });
    return { skipped: false as const };
  } catch (error) {
    console.error("Failed to send email", error);
    return { skipped: false as const, error: true as const };
  }
}

export async function sendPasswordResetEmail(input: {
  to: string;
  firstName: string;
  token: string;
}) {
  const resend = getResend();
  const resetUrl = absoluteUrl(`/reset-password?token=${input.token}`);

  if (!resend) {
    console.info("[email:skipped] password reset link:", resetUrl);
    return { skipped: true as const, resetUrl };
  }

  await resend.emails.send({
    from,
    to: input.to,
    subject: `${INSTITUTION.systemName}: Reset your password`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;margin:0 auto;padding:24px;">
        <p>Dear ${input.firstName},</p>
        <p>We received a request to reset your Collins password for ${INSTITUTION.name}.</p>
        <p>
          <a href="${resetUrl}" style="background:#14532d;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">
            Reset password
          </a>
        </p>
        <p style="font-size:13px;color:#64748b;">This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>
      </div>
    `,
  });

  return { skipped: false as const, resetUrl };
}
