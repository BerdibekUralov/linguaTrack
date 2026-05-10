import type { User, Assignment, Submission, Grade, Notification } from "@prisma/client";

export type { User, Assignment, Submission, Grade, Notification };

export type AssignmentWithRelations = Assignment & {
  teacher: Pick<User, "id" | "name" | "avatar">;
  student?: Pick<User, "id" | "name" | "avatar"> | null;
  submissions?: SubmissionWithGrade[];
  _count?: { submissions: number };
};

export type SubmissionWithRelations = Submission & {
  assignment: Pick<Assignment, "id" | "title" | "maxScore" | "dueDate">;
  student: Pick<User, "id" | "name" | "avatar">;
  grade?: Grade | null;
};

export type SubmissionWithGrade = Submission & {
  grade?: Grade | null;
};

export type StudentStats = {
  totalAssignments: number;
  completed: number;
  pending: number;
  late: number;
  averageScore: number;
  recentSubmissions: SubmissionWithRelations[];
};

export type TeacherStats = {
  totalStudents: number;
  totalAssignments: number;
  pendingGrading: number;
  submissionRate: number;
};
