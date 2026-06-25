import { getAuthSession, auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { isReservedUsername } from "@/lib/reserved";
import SettingsClient from "./_settings-client";

interface Props {
  params: Promise<{ username: string }>;
}

interface AccountInfo {
  providerId: string;
}

export default async function SettingsPage({ params }: Props) {
  const { username } = await params;
  if (isReservedUsername(username) && username !== "settings") notFound();

  const session = await getAuthSession(await headers());
  if (!session?.user) redirect("/login");
  if (session.user.username !== username) redirect(`/${session.user.username}/settings`);

  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  }) as AccountInfo[];

  const linkedProviders = accounts.map((a) => a.providerId);
  const hasPassword = linkedProviders.includes("credential");
  const allMethods = [...linkedProviders];

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      avatar: true,
      bio: true,
      location: true,
      website: true,
      studyProgram: true,
      semester: true,
    },
  });

  if (!user) notFound();

  return (
    <div>
      <h1 className="mb-8 text-xl font-bold text-text md:text-2xl">Settings</h1>
      <SettingsClient
        emailVerified={session.user.emailVerified}
        email={session.user.email}
        linkedProviders={linkedProviders}
        hasPassword={hasPassword}
        allMethods={allMethods}
        username={session.user.username}
        user={user}
        twoFactorEnabled={(session.user as any).twoFactorEnabled ?? false}
      />
    </div>
  );
}
