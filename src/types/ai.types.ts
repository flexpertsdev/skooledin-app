import { Subject, Assignment, Attachment } from './index';

// Core Chat Types
export interface ChatMessage {
  id: string;
  chatId: string;
  content: string;
  type: 'user' | 'ai' | 'system';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'error';
  attachments?: MessageAttachment[];
  notebookRefs?: string[];
  thinking?: AIThinking;
  savedToNotebook?: boolean;
}

export interface MessageAttachment {
  id: string;
  type: 'notebook' | 'assignment' | 'document' | 'image';
  resourceId: string;
  title: string;
  preview?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  subject?: Subject;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  messageCount: number;
  isActive: boolean;
}

// AI Context Types
export interface StudyContext {
  activeAssignments: Assignment[];
  recentTopics: string[];
  strugglingConcepts: string[];
  masteredConcepts: string[];
  currentGradeLevel: number;
  preferredLearningStyle?: 'visual' | 'auditory' | 'kinesthetic';
  subjects: Subject[];
  attachedNotes?: string[];
}

export interface AIThinking {
  concepts: {
    name: string;
    importance: 'core' | 'supporting' | 'prerequisite';
    studentKnows: boolean;
  }[];
  teachingStrategy: {
    method: 'explanation' | 'step-by-step' | 'socratic' | 'example-based';
    reason: string;
  };
  studentLevel: {
    understanding: number; // 0-100
    confidence: 'low' | 'medium' | 'high';
    misconceptions: string[];
  };
  suggestedNotes: {
    title: string;
    type: NotebookEntry['type'];
    importance: 'high' | 'medium' | 'low';
  }[];
}

// Notebook Types
export interface NotebookEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'concept' | 'formula' | 'vocabulary' | 'summary' | 'practice' | 'example' | 'quiz' | 'flashcard';
  subject: Subject;
  tags: string[];
  isAIGenerated: boolean;
  sourceMessageId?: string;
  sourceChatId?: string;
  attachedFiles?: FileAttachment[];
  annotations?: Annotation[];
  gradeLevel?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  folderId?: string;
  isFavorite: boolean;
  isArchived: boolean;
  viewCount: number;
  lastViewed?: Date;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

export interface FileAttachment {
  id: string;
  type: 'pdf' | 'image' | 'document';
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

export interface Annotation {
  id: string;
  pageNumber?: number;
  position?: { x: number; y: number };
  content: string;
  color: string;
  createdAt: Date;
}

export interface NotebookFolder {
  id: string;
  userId: string;
  name: string;
  parentId?: string;
  subjectId?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotebookTemplate {
  id: string;
  name: string;
  description: string;
  type: NotebookEntry['type'];
  structure: {
    sections: {
      title: string;
      prompt: string;
      required: boolean;
    }[];
  };
}

// AI Response Types
export interface StructuredAIResponse {
  content: string;
  thinking: AIThinking;
  suggestedFollowUp?: string[];
  visualElements?: {
    type: 'equation' | 'diagram' | 'code' | 'chart';
    data: any;
  }[];
  relatedAssignments?: Assignment[];
  practiceProblems?: PracticeProblem[];
}

export interface PracticeProblem {
  id: string;
  question: string;
  type: 'multiple-choice' | 'short-answer' | 'calculation' | 'essay';
  difficulty: 'easy' | 'medium' | 'hard';
  hints: string[];
  solution: string;
  explanation: string;
  correctAnswer?: string;
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
}

// AI Service Types
export interface AIEducationConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  subjectSpecificPrompts: Record<string, string>;
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: string;
  category: 'homework' | 'concept' | 'practice' | 'exam';
}

// PDF and Document Processing Types
export interface ProcessedWorksheet {
  id: string;
  originalPdf: string;
  questions: WorksheetQuestion[];
  metadata: {
    subject: Subject;
    topics: string[];
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export interface WorksheetQuestion {
  id: string;
  text: string;
  pageNumber: number;
  position: { x: number; y: number; width: number; height: number };
  answerSpace?: { x: number; y: number; width: number; height: number };
  type: 'multiple-choice' | 'short-answer' | 'calculation' | 'essay';
  userAnswer?: string;
  feedback?: string;
}

// Study Tool Types
export interface Flashcard {
  id: string;
  notebookEntryId?: string;
  question: string;
  answer: string;
  mastery: number; // 0-5
  lastReviewed?: Date;
  nextReview?: Date;
}

export interface StudyGuide {
  id: string;
  title: string;
  subject: Subject;
  sourceNoteIds: string[];
  content: string;
  type: 'summary' | 'outline' | 'concept-map';
  topics: string[];
  estimatedStudyTime: number; // minutes
  createdAt: Date;
}

// Context Types for AI Understanding
export interface StudentProfile {
  userId: string;
  gradeLevel: number;
  strengths: string[];
  weaknesses: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  pace: 'slow' | 'normal' | 'fast';
  interests: string[];
  goals: string[];
}

export interface ConceptMastery {
  conceptId: string;
  conceptName: string;
  subject: Subject;
  masteryLevel: number; // 0-100
  lastAssessed: Date;
  practiceCount: number;
  correctRate: number;
}