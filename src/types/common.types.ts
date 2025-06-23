// Common Types used across the application

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimestampedEntity extends BaseEntity {
  deletedAt?: Date;
}

// Navigation
export interface NavItem {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  path: string;
  roles?: UserRole[];
}

// File handling
export interface FileAttachment {
  id: string;
  type: 'pdf' | 'image' | 'document' | 'video' | 'audio';
  url: string;
  name: string;
  size: number; // bytes
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string; // userId
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Context system
export interface StudyContext {
  id: string;
  type: 'all' | 'subject' | 'class' | 'assignment';
  name: string;
  icon?: string;
  color?: string;
  metadata?: {
    subjectId?: string;
    classId?: string;
    assignmentId?: string;
  };
}

// Alias for backward compatibility
export type Context = StudyContext;

// User roles
export const UserRole = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  PARENT: 'parent',
  ADMIN: 'admin'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];