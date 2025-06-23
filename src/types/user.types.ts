import type { BaseEntity, UserRole } from './common.types';

// Base user interface
export interface BaseUser extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phoneNumber?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  preferences: UserPreferences;
}

// Student specific
export interface Student extends BaseUser {
  role: 'student';
  gradeLevel: number;
  schoolId: string;
  enrolledClasses: string[]; // classIds
  parentIds: string[];
  learningProfile: LearningProfile;
}

// Teacher specific
export interface Teacher extends BaseUser {
  role: 'teacher';
  schoolId: string;
  subjectIds: string[];
  classIds: string[];
  qualifications?: string[];
}

// Parent specific
export interface Parent extends BaseUser {
  role: 'parent';
  childrenIds: string[]; // studentIds
  subscription: Subscription;
}

// Admin specific
export interface Admin extends BaseUser {
  role: 'admin';
  permissions: AdminPermission[];
}

// User type union
export type User = Student | Teacher | Parent | Admin;

// Supporting interfaces
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  digest: 'daily' | 'weekly' | 'never';
  types: {
    assignments: boolean;
    grades: boolean;
    messages: boolean;
    reminders: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'school' | 'private';
  shareProgress: boolean;
  allowAnalytics: boolean;
}

export interface LearningProfile {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  pace: 'slow' | 'normal' | 'fast';
  strengths: string[];
  weaknesses: string[];
  interests: string[];
  goals: string[];
  accommodations?: string[];
}

export interface Subscription {
  id: string;
  plan: 'free' | 'premium' | 'family' | 'school';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startedAt: Date;
  expiresAt?: Date;
  features: string[];
  billingCycle?: 'monthly' | 'yearly';
  paymentMethod?: string;
}

export type AdminPermission = 
  | 'manage_users'
  | 'manage_content'
  | 'manage_billing'
  | 'view_analytics'
  | 'manage_schools'
  | 'manage_system';