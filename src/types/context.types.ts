// Dynamic Context Types for AI Education

export interface ActiveContext {
  currentAssignment?: {
    id: string;
    title: string;
    description: string;
    dueDate?: Date;
  };
  recentMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  uploadedFiles: Array<{
    id: string;
    name: string;
    type: string;
    content?: string; // Extracted text/description
  }>;
  currentProblem?: string;
}

export interface NotebookContext {
  relevantEntries: Array<{
    id: string;
    title: string;
    excerpt: string;
    relevanceScore: number;
  }>;
  referencedConcepts: string[];
  linkedMaterials: Array<{
    id: string;
    type: 'flashcard' | 'quiz' | 'summary';
    title: string;
  }>;
}

export interface LearningProfile {
  gradeLevel: number;
  curriculum: string;
  subjects: SubjectProfile[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  progressTracking: {
    totalSessions: number;
    totalConcepts: number;
    masteryRate: number;
    lastActive: Date;
  };
}

export interface SubjectProfile {
  subjectId: string;
  subjectName: string;
  masteredConcepts: ConceptKnowledge[];
  strugglingConcepts: ConceptKnowledge[];
  recentTopics: string[];
  performanceHistory: {
    date: Date;
    score: number;
    topic: string;
  }[];
}

export interface ConceptKnowledge {
  name: string;
  confidence: number; // 0-1
  lastReviewed: Date;
  timesReviewed: number;
  relatedNotebookIds: string[];
}

export interface DynamicContext {
  active: ActiveContext;
  notebook: NotebookContext;
  profile: LearningProfile;
}

// Context building options
export interface ContextOptions {
  includeRecentMessages?: boolean;
  messageLimit?: number;
  includeNotebooks?: boolean;
  notebookLimit?: number;
  includeProfile?: boolean;
}