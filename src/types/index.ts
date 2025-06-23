// User Types
export const UserRole = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  PARENT: 'parent'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student extends BaseUser {
  role: typeof UserRole.STUDENT;
  grade: number;
  school: School;
  subjects: Subject[];
  parentIds: string[];
}

export interface Teacher extends BaseUser {
  role: typeof UserRole.TEACHER;
  school: School;
  subjects: Subject[];
  classes: Class[];
}

export interface Parent extends BaseUser {
  role: typeof UserRole.PARENT;
  children: Student[];
  subscription: Subscription;
}

// Context Types
export interface Context {
  id: string;
  type: 'all' | 'subject' | 'class' | 'child';
  name: string;
  icon?: string;
  color?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  icon: string;
}

export interface Class {
  id: string;
  name: string;
  subject: Subject;
  teacher: Teacher;
  students: Student[];
  schedule: Schedule;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  type: 'public' | 'private' | 'charter';
}

export interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface Subscription {
  id: string;
  plan: 'free' | 'premium' | 'family';
  status: 'active' | 'cancelled' | 'expired';
  expiresAt: Date;
}

// Feed Types
export const FeedItemType = {
  ASSIGNMENT: 'assignment',
  ANNOUNCEMENT: 'announcement',
  GRADE: 'grade'
} as const;

export type FeedItemType = typeof FeedItemType[keyof typeof FeedItemType];

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  createdAt: Date;
  createdBy: Teacher;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  context: Context;
}

export interface Assignment extends FeedItem {
  type: typeof FeedItemType.ASSIGNMENT;
  description: string;
  dueDate: Date;
  points: number;
  attachments: Attachment[];
  submissions: Submission[];
  subject: Subject;
}

export interface Announcement extends FeedItem {
  type: typeof FeedItemType.ANNOUNCEMENT;
  content: string;
  important: boolean;
  expiresAt?: Date;
  targetAudience: UserRole[];
}

export interface Grade extends FeedItem {
  type: typeof FeedItemType.GRADE;
  assignment: Assignment;
  student: Student;
  score: number;
  feedback?: string;
  gradedBy: Teacher;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Submission {
  id: string;
  student: Student;
  assignment: Assignment;
  submittedAt: Date;
  content?: string;
  attachments: Attachment[];
  status: 'draft' | 'submitted' | 'graded';
  grade?: Grade;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  savedToNotebook?: boolean;
  relatedAssignment?: Assignment;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: Context;
  createdAt: Date;
  lastMessageAt: Date;
}

// Navigation Types
export interface NavItem {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  path: string;
  roles?: UserRole[];
}

// Re-export AI types
export * from './ai.types';