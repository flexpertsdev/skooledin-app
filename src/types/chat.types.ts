import type { BaseEntity } from './common.types';
import type { Subject, Assignment } from './education.types';
import type { AIThinking } from './ai.types';

// Chat Session
export interface ChatSession extends BaseEntity {
  userId: string;
  title: string;
  type: 'ai_tutor' | 'homework_help' | 'study_session' | 'general';
  subjectId?: string;
  metadata: ChatSessionMetadata;
  isActive: boolean;
  lastActivityAt: Date;
  messageCount: number;
}

// Chat Message
export interface ChatMessage extends BaseEntity {
  sessionId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  status: MessageStatus;
  attachments: MessageAttachment[];
  metadata: MessageMetadata;
  parentMessageId?: string; // for threading
  isEdited: boolean;
  editedAt?: Date;
}

// Attachment
export interface MessageAttachment {
  id: string;
  type: AttachmentType;
  resourceId: string;
  title: string;
  preview?: string;
  thumbnail?: string;
  metadata: AttachmentMetadata;
}

// Supporting interfaces
export interface ChatSessionMetadata {
  subject?: Subject;
  assignment?: Assignment;
  context: StudyContext;
  tags: string[];
  learningObjectives?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface MessageMetadata {
  thinking?: AIThinking;
  confidence?: number;
  sources?: string[];
  relatedConcepts?: string[];
  suggestedFollowUps?: string[];
  processingTime?: number; // ms
  modelUsed?: string;
  tokenCount?: number;
  notebookRefs?: string[]; // notebookEntryIds
  isSavedToNotebook?: boolean;
}

export interface AttachmentMetadata {
  fileSize?: number;
  pageCount?: number; // for PDFs
  duration?: number; // for audio/video
  dimensions?: { width: number; height: number }; // for images
  extractedText?: string;
  analysis?: AttachmentAnalysis;
}

export interface AttachmentAnalysis {
  summary?: string;
  keyPoints?: string[];
  detectedTopics?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  educationalValue?: number; // 0-1
}

export interface StudyContext {
  activeAssignments: Assignment[];
  recentTopics: string[];
  strugglingConcepts: ConceptMastery[];
  masteredConcepts: ConceptMastery[];
  currentGradeLevel: number;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  subjects: Subject[];
  sessionHistory?: ChatSessionSummary[];
}

export interface ConceptMastery {
  concept: string;
  subjectId: string;
  masteryLevel: number; // 0-100
  lastAssessed: Date;
  practiceCount: number;
  averageScore: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ChatSessionSummary {
  sessionId: string;
  title: string;
  date: Date;
  duration: number; // minutes
  topicsCovered: string[];
  conceptsLearned: string[];
  assignmentsHelped?: string[];
}

// Enums
export type MessageStatus = 
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'processing';

export type AttachmentType = 
  | 'notebook'
  | 'assignment'
  | 'document'
  | 'image'
  | 'pdf'
  | 'worksheet'
  | 'textbook_page'
  | 'handwritten_note';