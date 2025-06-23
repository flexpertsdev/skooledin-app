import type { BaseEntity } from './common.types';
import type { AssignmentType, Subject } from './education.types';

// AI Service Configuration
export interface AIServiceConfig {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  features: AIFeature[];
}

// AI Response
export interface AIResponse extends BaseEntity {
  sessionId: string;
  messageId: string;
  content: string;
  type: AIResponseType;
  thinking?: AIThinking;
  confidence: number;
  metadata: AIResponseMetadata;
  suggestions?: AISuggestion[];
  generatedContent?: GeneratedContent[];
}

// AI Thinking Process
export interface AIThinking {
  steps: ThinkingStep[];
  duration: number; // ms
  complexity: 'simple' | 'moderate' | 'complex';
  approach: string;
}

export interface ThinkingStep {
  id: string;
  type: 'analysis' | 'reasoning' | 'calculation' | 'research' | 'planning';
  description: string;
  confidence: number;
  subSteps?: string[];
}

// AI Suggestions
export interface AISuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  action?: SuggestionAction;
  priority: 'low' | 'medium' | 'high';
}

export interface SuggestionAction {
  type: 'create_note' | 'practice_problems' | 'review_concept' | 'ask_followup';
  params?: Record<string, any>;
}

// Generated Content
export interface GeneratedContent {
  id: string;
  type: GeneratedContentType;
  title: string;
  content: any; // Type-specific content
  format: 'markdown' | 'json' | 'html' | 'latex';
  canSaveToNotebook: boolean;
  metadata?: ContentMetadata;
}

export interface ContentMetadata {
  subject?: Subject;
  topics?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number; // minutes
  prerequisites?: string[];
}

// Study Tools Generation
export interface StudyToolRequest {
  type: StudyToolType;
  sourceIds: string[]; // noteIds, messageIds, etc.
  options: StudyToolOptions;
  targetGradeLevel?: number;
  focusAreas?: string[];
}

export interface StudyToolOptions {
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
  includeExplanations?: boolean;
  format?: 'standard' | 'interactive' | 'gamified';
  timeLimit?: number; // minutes
}

export interface GeneratedStudyTool extends BaseEntity {
  type: StudyToolType;
  title: string;
  description: string;
  content: StudyToolContent;
  metadata: StudyToolMetadata;
  sourceIds: string[];
}

export interface StudyToolContent {
  items: any[]; // Type-specific items
  instructions?: string;
  answerKey?: any;
  resources?: string[];
}

export interface StudyToolMetadata {
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  estimatedTime: number; // minutes
  topics: string[];
  skills: string[];
  successCriteria?: string;
}

// AI Analysis
export interface ContentAnalysis {
  summary: string;
  keyPoints: string[];
  concepts: ConceptExtraction[];
  difficulty: DifficultyAnalysis;
  suggestions: LearningRecommendation[];
}

export interface ConceptExtraction {
  concept: string;
  definition?: string;
  importance: 'core' | 'supporting' | 'related';
  prerequisites?: string[];
  relatedConcepts?: string[];
}

export interface DifficultyAnalysis {
  overall: 'easy' | 'medium' | 'hard';
  factors: DifficultyFactor[];
  recommendedGradeLevel: number;
  readabilityScore?: number;
}

export interface DifficultyFactor {
  name: string;
  score: number; // 0-10
  description: string;
}

export interface LearningRecommendation {
  type: 'prerequisite' | 'practice' | 'extension' | 'clarification';
  title: string;
  description: string;
  resources?: string[];
  estimatedTime?: number; // minutes
}

// Homework Helper
export interface HomeworkHelperRequest {
  assignmentId?: string;
  type?: AssignmentType;
  subject?: Subject;
  question: string;
  attachments?: string[]; // attachment IDs
  showSteps: boolean;
  explainConcepts: boolean;
}

export interface HomeworkHelperResponse {
  solution: string;
  steps?: SolutionStep[];
  concepts?: ConceptExplanation[];
  similarProblems?: PracticeProblem[];
  confidence: number;
  warnings?: string[];
}

export interface SolutionStep {
  stepNumber: number;
  description: string;
  action: string;
  result?: string;
  explanation?: string;
  formula?: string;
}

export interface ConceptExplanation {
  concept: string;
  explanation: string;
  examples?: string[];
  visualAid?: string; // URL or base64
  relatedTo?: string[];
}

export interface PracticeProblem {
  question: string;
  difficulty: 'easier' | 'same' | 'harder';
  hints?: string[];
  solution?: string;
}

// Writing Assistant
export interface WritingAssistantRequest {
  type: WritingTaskType;
  content?: string; // existing content to improve
  requirements?: WritingRequirements;
  rubric?: string;
  targetWordCount?: number;
}

export interface WritingRequirements {
  topic?: string;
  thesis?: string;
  outline?: string[];
  style?: 'formal' | 'informal' | 'academic' | 'creative';
  citations?: boolean;
  sources?: string[];
}

export interface WritingAssistantResponse {
  content: string;
  feedback?: WritingFeedback;
  suggestions?: WritingSuggestion[];
  score?: RubricScore;
}

export interface WritingFeedback {
  strengths: string[];
  improvements: string[];
  grammar?: GrammarCheck[];
  style?: StyleSuggestion[];
  structure?: StructureFeedback;
}

export interface GrammarCheck {
  text: string;
  issue: string;
  suggestion: string;
  position: { start: number; end: number };
}

export interface StyleSuggestion {
  type: 'clarity' | 'conciseness' | 'tone' | 'vocabulary';
  text: string;
  suggestion: string;
  reason: string;
}

export interface StructureFeedback {
  currentStructure: string[];
  suggestedStructure?: string[];
  issues?: string[];
}

export interface WritingSuggestion {
  type: 'expand' | 'clarify' | 'support' | 'transition' | 'conclude';
  location: string;
  suggestion: string;
  example?: string;
}

export interface RubricScore {
  totalScore: number;
  maxScore: number;
  breakdown: RubricBreakdown[];
}

export interface RubricBreakdown {
  criterion: string;
  score: number;
  maxScore: number;
  feedback: string;
}

// Supporting interfaces
export interface AIResponseMetadata {
  processingTime: number; // ms
  modelVersion: string;
  temperature?: number;
  tokenUsage?: TokenUsage;
  sources?: string[];
  citations?: Citation[];
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
  cost?: number;
}

export interface Citation {
  id: string;
  type: 'notebook' | 'textbook' | 'web' | 'academic';
  title: string;
  author?: string;
  url?: string;
  pageNumber?: number;
  quote?: string;
}

// Enums
export type AIProvider = 
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'local'
  | 'custom';

export type AIFeature = 
  | 'chat'
  | 'homework_help'
  | 'writing_assistant'
  | 'study_tools'
  | 'concept_explanation'
  | 'problem_solving'
  | 'language_translation'
  | 'code_assistance';

export type AIResponseType = 
  | 'answer'
  | 'explanation'
  | 'solution'
  | 'feedback'
  | 'summary'
  | 'study_tool'
  | 'suggestion';

export type SuggestionType = 
  | 'next_topic'
  | 'practice'
  | 'review'
  | 'break'
  | 'resources'
  | 'clarification';

export type GeneratedContentType = 
  | 'summary'
  | 'outline'
  | 'flashcards'
  | 'quiz'
  | 'practice_problems'
  | 'study_guide'
  | 'mind_map'
  | 'essay_outline';

export type StudyToolType = 
  | 'flashcards'
  | 'quiz'
  | 'practice_test'
  | 'study_guide'
  | 'summary_sheet'
  | 'concept_map'
  | 'mnemonics'
  | 'timeline';

export type WritingTaskType = 
  | 'essay'
  | 'report'
  | 'creative'
  | 'outline'
  | 'improve'
  | 'proofread'
  | 'paraphrase';