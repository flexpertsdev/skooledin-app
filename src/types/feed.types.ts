import type { BaseEntity } from './common.types';

// Feed Item
export interface FeedItem extends BaseEntity {
  userId: string;
  type: FeedItemType;
  title: string;
  description?: string;
  entityId: string; // ID of the related entity
  entityType: 'assignment' | 'grade' | 'note' | 'achievement' | 'announcement';
  metadata: FeedItemMetadata;
  isRead: boolean;
  isPinned: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Feed Item Metadata
export interface FeedItemMetadata {
  icon?: string;
  color?: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedUsers?: string[]; // userIds
  tags?: string[];
  dueDate?: Date;
  completedDate?: Date;
  score?: number;
  maxScore?: number;
}

// Notification
export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  isSeen: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

// Achievement
export interface Achievement extends BaseEntity {
  userId: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
  category: AchievementCategory;
  requirements?: AchievementRequirement[];
  isSecret: boolean;
}

// Supporting interfaces
export interface AchievementRequirement {
  type: 'score' | 'streak' | 'completion' | 'mastery';
  target: number;
  current: number;
  description: string;
}

// Enums
export type FeedItemType = 
  | 'assignment_created'
  | 'assignment_due_soon'
  | 'grade_posted'
  | 'achievement_unlocked'
  | 'study_streak'
  | 'class_announcement'
  | 'note_shared'
  | 'quiz_available'
  | 'feedback_received';

export type NotificationType = 
  | 'assignment'
  | 'grade'
  | 'message'
  | 'reminder'
  | 'achievement'
  | 'system';

export type AchievementType = 
  | 'first_steps'
  | 'streak_keeper'
  | 'knowledge_master'
  | 'helping_hand'
  | 'perfect_score'
  | 'consistent_learner'
  | 'note_taker'
  | 'problem_solver';

export type AchievementCategory = 
  | 'learning'
  | 'social'
  | 'consistency'
  | 'mastery'
  | 'special';