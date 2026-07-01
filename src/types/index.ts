export type StudyProgram = "SD" | "TI" | "SI";
export type ProjectStatus = "Open" | "In Progress" | "Completed";
export type ReputationLevel = "Beginner" | "Active" | "Lead" | "Expert";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  studyProgram: StudyProgram;
  semester: number;
  avatar: string;
  bio: string;
  reputationPoints: number;
  level: ReputationLevel;
  createdAt: Date;
  _count: {
    ownedProjects: number;
    teamMembers: number;
    ideas: number;
  };
}

export interface ProjectWithDetails {
  id: string;
  title: string;
  description: string;
  problemStatement: string;
  status: ProjectStatus;
  techStack: string;
  demoLink: string;
  resultSummary: string;
  impactSummary: string;
  creatorId: string;
  createdAt: Date;
  creator: Pick<UserProfile, "id" | "name" | "avatar" | "studyProgram">;
  teamMembers: Array<{
    id: string;
    role: string;
    joinedAt: Date;
    user: Pick<UserProfile, "id" | "name" | "avatar" | "studyProgram">;
  }>;
  projectRoles: Array<{
    id: string;
    studyProgram: StudyProgram;
    required: number;
    filled: number;
  }>;
  contributions: Array<{
    id: string;
    points: number;
    type: string;
    description: string;
    createdAt: Date;
    user: Pick<UserProfile, "id" | "name" | "avatar">;
  }>;
  _count: {
    comments: number;
  };
}

export interface IdeaWithDetails {
  id: string;
  title: string;
  description: string;
  studyProgram: StudyProgram;
  userId: string;
  voteCount: number;
  createdAt: Date;
  user: Pick<UserProfile, "id" | "name" | "avatar" | "studyProgram">;
  _count: {
    comments: number;
  };
  userVoted?: boolean;
}

export interface DashboardData {
  user: UserProfile;
  ownedProjects: ProjectWithDetails[];
  teamProjects: ProjectWithDetails[];
  recentContributions: Array<{
    id: string;
    points: number;
    type: string;
    description: string;
    createdAt: Date;
    project: { id: string; title: string };
  }>;
}
