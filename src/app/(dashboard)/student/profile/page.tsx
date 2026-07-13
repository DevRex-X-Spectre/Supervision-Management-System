import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/shared/profile-form";

export const metadata = { title: "Profile" };

export default async function StudentProfilePage() {
  const sessionUser = await requireUser(["STUDENT"]);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  return (
    <div className="animate-fade-up">
      <PageHeader title="Profile" description="Keep your personal and academic details up to date." />
      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-500">
            Email: <span className="font-medium text-slate-800">{user.email}</span>
            {user.matricNumber ? ` · Matric: ${user.matricNumber}` : ""}
          </p>
          <ProfileForm user={{ ...sessionUser, phone: user.phone, specialization: user.specialization }} />
        </CardContent>
      </Card>
    </div>
  );
}
