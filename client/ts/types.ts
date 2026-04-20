// ═══════════════════════════════════════════════════════════
//  TYPES.TS — Type Definitions for ProjectHub
// ═══════════════════════════════════════════════════════════

export type UserRole = 'student' | 'faculty';
export type Provider = 'local' | 'google' | 'github';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider?: Provider;
  avatar?: string;
  projectIds?: string[];
  createdAt?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  createdBy: string | User;
  members: User[];
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  project: string | Project;
  assignedTo?: string | User;
  createdBy: string | User;
  dueDate?: string;
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  user: string | User;
  project: string | Project;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface FileMetadata {
  _id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype?: string;
  uploadedBy: string | User;
  project: string | Project;
  uploadedAt: string;
}

export interface UserAnalytics {
  userId: string;
  uploadsCount: number;
  tasksCompleted: number;
  tasksPending: number;
  tasksInProgress: number;
  activityCount: number;
  lastActive: string;
  score?: number;
}

export interface LeaderboardEntry extends UserAnalytics {
  rank: number;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: User;
}

export interface ChatMessage {
  message: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  timestamp: string;
}
