import type { BaseEntity, Status, Priority } from './common.types';
import type { FileAttachment } from './common.types';

// School
export interface School extends BaseEntity {
  name: string;
  type: 'public' | 'private' | 'charter' | 'homeschool';
  address: Address;
  contactInfo: ContactInfo;
  academicYear: AcademicYear;
  settings: SchoolSettings;
}

// Subject
export interface Subject extends BaseEntity {
  name: string;
  code: string; // e.g., 'MATH', 'SCI', 'ENG'
  description?: string;
  color: string; // for UI
  icon: string; // emoji or icon name
  gradeLevel?: number;
  department?: string;
}

// Class
export interface Class extends BaseEntity {
  name: string;
  subjectId: string;
  teacherId: string;
  studentIds: string[];
  schedule: Schedule;
  room?: string;
  academicTermId: string;
  maxStudents?: number;
  status: Status;
}

// Assignment
export interface Assignment extends BaseEntity {
  title: string;
  description: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  type: AssignmentType;
  instructions: string;
  dueDate: Date;
  availableFrom?: Date;
  points: number;
  rubric?: Rubric;
  attachments: FileAttachment[];
  settings: AssignmentSettings;
  status: Status;
  priority: Priority;
}

// Submission
export interface Submission extends BaseEntity {
  assignmentId: string;
  studentId: string;
  content?: string;
  attachments: FileAttachment[];
  status: SubmissionStatus;
  submittedAt?: Date;
  grade?: Grade;
  feedback?: Feedback;
  attempts: number;
  isDraft: boolean;
}

// Grade
export interface Grade extends BaseEntity {
  submissionId: string;
  studentId: string;
  assignmentId: string;
  graderId: string; // teacherId
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade?: string;
  feedback?: string;
  rubricScores?: RubricScore[];
  isFinalized: boolean;
  gradedAt: Date;
}

// Supporting interfaces
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

export interface AcademicYear {
  id: string;
  name: string; // e.g., "2024-2025"
  startDate: Date;
  endDate: Date;
  terms: AcademicTerm[];
  holidays: Holiday[];
  isActive: boolean;
}

export interface AcademicTerm {
  id: string;
  name: string; // e.g., "Fall Semester", "Q1"
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface Holiday {
  name: string;
  date: Date;
  duration: number; // days
}

export interface SchoolSettings {
  gradingScale: GradingScale;
  attendancePolicy: AttendancePolicy;
  lateSubmissionPolicy: LateSubmissionPolicy;
  allowParentAccess: boolean;
  requireTwoFactorAuth: boolean;
}

export interface GradingScale {
  type: 'percentage' | 'points' | 'letter' | 'custom';
  scale: GradeThreshold[];
}

export interface GradeThreshold {
  minScore: number;
  letterGrade: string;
  gpa: number;
}

export interface AttendancePolicy {
  trackAttendance: boolean;
  allowedAbsences: number;
  tardyThreshold: number; // minutes
}

export interface LateSubmissionPolicy {
  allowLateSubmissions: boolean;
  penaltyPerDay: number; // percentage
  maxLateDays: number;
  minimumScore?: number;
}

export interface Schedule {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  recurrence?: RecurrenceRule;
}

export interface RecurrenceRule {
  interval: number;
  count?: number;
  until?: Date;
  exceptions?: Date[];
}

export interface AssignmentSettings {
  allowLateSubmission: boolean;
  maxAttempts: number;
  showAnswersAfterDue: boolean;
  requireProctoring: boolean;
  shuffleQuestions: boolean;
  timeLimit?: number; // minutes
  availableUntil?: Date;
}

export interface Rubric {
  id: string;
  name: string;
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  name: string;
  description: string;
  points: number;
}

export interface RubricScore {
  criterionId: string;
  score: number;
  feedback?: string;
}

export interface Feedback {
  id: string;
  content: string;
  type: 'text' | 'audio' | 'video';
  attachments?: FileAttachment[];
  timestamp: Date;
  authorId: string;
}

// Enums
export type AssignmentType = 
  | 'homework'
  | 'quiz'
  | 'test'
  | 'project'
  | 'essay'
  | 'presentation'
  | 'lab'
  | 'discussion'
  | 'reading';

export type SubmissionStatus = 
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'graded'
  | 'returned'
  | 'missing'
  | 'late';