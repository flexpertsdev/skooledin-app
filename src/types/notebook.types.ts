import type { BaseEntity, FileAttachment } from './common.types';

// Notebook Entry
export interface NotebookEntry extends BaseEntity {
  userId: string;
  title: string;
  content: string; // Markdown or rich text
  type: NoteType;
  format: ContentFormat;
  subjectId: string;
  metadata: NotebookMetadata;
  tags: string[];
  attachments: FileAttachment[];
  annotations: Annotation[];
  status: NoteStatus;
  visibility: NoteVisibility;
  collaborators?: string[]; // userIds
  parentId?: string; // for nested notes
  childIds?: string[]; // for nested notes
  version: number;
  versionHistory?: NoteVersion[];
}

// Notebook Organization
export interface NotebookFolder extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  parentId?: string;
  subjectId?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  noteCount: number;
  settings: FolderSettings;
}

export interface NotebookTemplate extends BaseEntity {
  name: string;
  description: string;
  type: NoteType;
  structure: TemplateStructure;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  rating?: number;
  authorId: string;
}

// Supporting interfaces
export interface NotebookMetadata {
  isAIGenerated: boolean;
  sourceType?: 'chat' | 'manual' | 'import' | 'scan' | 'voice';
  sourceId?: string; // chatMessageId, etc.
  gradeLevel?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedReadTime?: number; // minutes
  wordCount?: number;
  lastStudied?: Date;
  studyCount: number;
  isFavorite: boolean;
  isArchived: boolean;
  folderId?: string;
  relatedNoteIds?: string[];
  externalLinks?: ExternalLink[];
}

export interface Annotation {
  id: string;
  type: 'highlight' | 'note' | 'question' | 'definition' | 'formula';
  content: string;
  position?: TextPosition | PagePosition;
  color?: string;
  authorId: string;
  createdAt: Date;
  replies?: AnnotationReply[];
}

export interface TextPosition {
  start: number;
  end: number;
  text: string;
}

export interface PagePosition {
  pageNumber: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface AnnotationReply {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

export interface NoteVersion {
  version: number;
  content: string;
  editedBy: string;
  editedAt: Date;
  changeDescription?: string;
}

export interface FolderSettings {
  defaultNoteType?: NoteType;
  defaultTemplate?: string;
  autoOrganize: boolean;
  sortBy: 'name' | 'date' | 'type' | 'manual';
  sortOrder: 'asc' | 'desc';
}

export interface TemplateStructure {
  sections: TemplateSection[];
  variables?: TemplateVariable[];
  formatting?: FormattingRules;
}

export interface TemplateSection {
  id: string;
  title: string;
  prompt?: string;
  type: 'text' | 'list' | 'table' | 'formula' | 'diagram';
  required: boolean;
  order: number;
  defaultContent?: string;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  defaultValue?: any;
}

export interface FormattingRules {
  font?: string;
  fontSize?: number;
  lineHeight?: number;
  useHeaders: boolean;
  useBulletPoints: boolean;
  useNumbering: boolean;
}

export interface ExternalLink {
  title: string;
  url: string;
  type: 'reference' | 'video' | 'article' | 'tool';
  description?: string;
}

// Study Tools
export interface StudySet extends BaseEntity {
  name: string;
  description?: string;
  noteIds: string[];
  subjectId: string;
  type: 'flashcards' | 'quiz' | 'summary' | 'mindmap';
  content: StudyContent;
  settings: StudySetSettings;
  stats: StudyStats;
}

export interface StudyContent {
  items: StudyItem[];
  metadata?: any; // Type-specific metadata
}

export interface StudyItem {
  id: string;
  type: 'flashcard' | 'question' | 'concept' | 'node';
  content: any; // Type-specific content
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface StudySetSettings {
  shuffleItems: boolean;
  enableTimer: boolean;
  showHints: boolean;
  repeatIncorrect: boolean;
  studyMode: 'normal' | 'speed' | 'test';
}

export interface StudyStats {
  totalSessions: number;
  totalTime: number; // minutes
  averageScore: number;
  lastStudied?: Date;
  mastery: number; // 0-100
  itemStats: Record<string, ItemStats>;
}

export interface ItemStats {
  views: number;
  correct: number;
  incorrect: number;
  avgResponseTime: number; // seconds
  lastSeen?: Date;
}

// Enums
export type NoteType = 
  | 'concept'
  | 'formula'
  | 'vocabulary'
  | 'summary'
  | 'outline'
  | 'mindmap'
  | 'practice'
  | 'example'
  | 'quiz'
  | 'flashcard'
  | 'checklist'
  | 'reference';

export type ContentFormat = 
  | 'markdown'
  | 'richtext'
  | 'plain'
  | 'latex'
  | 'code';

export type NoteStatus = 
  | 'draft'
  | 'complete'
  | 'in_review'
  | 'verified';

export type NoteVisibility = 
  | 'private'
  | 'shared'
  | 'public';