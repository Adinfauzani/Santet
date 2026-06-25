"use server";

import { prisma } from "./db";
import { getAuthSession, auth, type AuthSession } from "./auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isReservedUsername, isValidUsername } from "./reserved";

function requireEmailVerified(session: AuthSession | null): AuthSession {
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!session.user.emailVerified) {
    throw new Error("You must verify your email before taking this action.");
  }
  return session;
}

const LEVEL_THRESHOLDS = [
  { level: "Beginner", min: 0 },
  { level: "Active", min: 50 },
  { level: "Lead", min: 200 },
  { level: "Expert", min: 500 },
];

function calculateLevel(points: number): string {
  let current = "Beginner";
  for (const t of LEVEL_THRESHOLDS) {
    if (points >= t.min) current = t.level;
  }
  return current;
}

async function addContribution(
  userId: string,
  projectId: string,
  points: number,
  type: string,
  description: string,
) {
  await prisma.contribution.create({
    data: { userId, projectId, points, type, description },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const newPoints = user.reputationPoints + points;
  const newLevel = calculateLevel(newPoints);

  await prisma.user.update({
    where: { id: userId },
    data: { reputationPoints: newPoints, level: newLevel },
  });
}

export async function createProject(formData: FormData) {
  const session = requireEmailVerified(await getAuthSession(await headers()));

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const problemStatement = (formData.get("problemStatement") as string) || "";
  const techStack = (formData.get("techStack") as string) || "";
  const sd = parseInt(formData.get("sd") as string) || 0;
  const ti = parseInt(formData.get("ti") as string) || 0;
  const si = parseInt(formData.get("si") as string) || 0;

  const project = await prisma.project.create({
    data: {
      title,
      description,
      problemStatement,
      techStack,
      creatorId: session.user.id,
      projectRoles: {
        create: [
          ...(sd > 0 ? [{ studyProgram: "SD", required: sd, filled: 0 }] : []),
          ...(ti > 0 ? [{ studyProgram: "TI", required: ti, filled: 0 }] : []),
          ...(si > 0 ? [{ studyProgram: "SI", required: si, filled: 0 }] : []),
        ],
      },
    },
    include: { projectRoles: true },
  });

  await addContribution(
    session.user.id,
    project.id,
    10,
    "create",
    "Created a new project",
  );

  revalidatePath("/showcase");
  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function joinProject(projectId: string, role: string) {
  const session = requireEmailVerified(await getAuthSession(await headers()));

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) throw new Error("User not found");

  const existing = await prisma.teamMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (existing) throw new Error("Already a member");

  const projectRole = await prisma.projectRole.findFirst({
    where: { projectId, studyProgram: user.studyProgram },
  });

  const member = await prisma.teamMember.create({
    data: { projectId, userId: session.user.id, role },
  });

  if (projectRole && projectRole.filled < projectRole.required) {
    await prisma.projectRole.update({
      where: { id: projectRole.id },
      data: { filled: projectRole.filled + 1 },
    });
  }

  await addContribution(
    session.user.id,
    projectId,
    5,
    "join",
    "Joined a project",
  );

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/showcase");
  return member;
}

export async function completeProject(projectId: string) {
  const session = requireEmailVerified(await getAuthSession(await headers()));

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.creatorId !== session.user.id)
    throw new Error("Only the creator can mark as completed");

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "Completed" },
  });

  const members = await prisma.teamMember.findMany({
    where: { projectId },
  });

  for (const member of members) {
    await addContribution(
      member.userId,
      projectId,
      20,
      "complete",
      "Project completed",
    );
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/showcase");
}

/* ── Ideas actions (removed — Ideas removed from navigation) ── */

export async function addComment(formData: FormData) {
  const session = requireEmailVerified(await getAuthSession(await headers()));

  const content = formData.get("content") as string;
  const projectId = formData.get("projectId") as string;

  if (!content || !projectId) throw new Error("Missing fields");

  await prisma.comment.create({
    data: { content, userId: session.user.id, projectId },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function updateProfile(formData: FormData) {
  const session = requireEmailVerified(await getAuthSession(await headers()));

  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;
  const avatar = (formData.get("avatar") as string) || "";
  const website = formData.get("website") as string;
  const location = formData.get("location") as string;

  if (!isValidUsername(username)) {
    throw new Error("Username must be 2-30 characters, letters/numbers/hyphens/underscores only.");
  }

  if (isReservedUsername(username)) {
    throw new Error("This username is reserved and cannot be used.");
  }

  await auth.api.updateUser({
    body: { name, username, bio, avatar, website, location },
    headers: await headers(),
  });

  const oldUsername = session.user.username;
  if (oldUsername) revalidatePath(`/${oldUsername}`);
  revalidatePath(`/${username}`);
  revalidatePath("/dashboard");
}
