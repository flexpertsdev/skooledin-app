// Re-export all types from common first (base types)
export * from './common.types';

// Then re-export specific types from other modules
export * from './user.types';

// Re-export education types but avoid RubricScore conflict
export type {
  School,
  Subject,
  Class,
  Assignment,
  Submission,
  Grade,
  Address,
  ContactInfo,
  AcademicYear,
  AcademicTerm,
  Holiday,
  SchoolSettings,
  GradingScale,
  GradeThreshold,
  AttendancePolicy,
  LateSubmissionPolicy,
  Schedule,
  RecurrenceRule,
  AssignmentSettings,
  Rubric,
  RubricCriterion,
  RubricLevel,
  RubricScore as EducationRubricScore, // Renamed to avoid conflict
  Feedback,
  AssignmentType,
  SubmissionStatus
} from './education.types';

// Re-export chat types but avoid StudyContext conflict
export type {
  ChatSession,
  ChatMessage,
  MessageAttachment,
  ChatSessionMetadata,
  MessageMetadata,
  AttachmentMetadata,
  AttachmentAnalysis,
  StudyContext as ChatStudyContext, // Renamed to avoid conflict
  ConceptMastery,
  ChatSessionSummary,
  MessageStatus,
  AttachmentType
} from './chat.types';

// Re-export notebook types
export * from './notebook.types';

// Re-export feed types
export * from './feed.types';

// Re-export AI types
export type {
  AIServiceConfig,
  AIResponse,
  AIThinking,
  ThinkingStep,
  AISuggestion,
  SuggestionAction,
  GeneratedContent,
  ContentMetadata,
  StudyToolRequest,
  StudyToolOptions,
  GeneratedStudyTool,
  StudyToolContent,
  StudyToolMetadata,
  ContentAnalysis,
  ConceptExtraction,
  DifficultyAnalysis,
  DifficultyFactor,
  LearningRecommendation,
  HomeworkHelperRequest,
  HomeworkHelperResponse,
  SolutionStep,
  ConceptExplanation,
  PracticeProblem,
  WritingAssistantRequest,
  WritingRequirements,
  WritingAssistantResponse,
  WritingFeedback,
  GrammarCheck,
  StyleSuggestion,
  StructureFeedback,
  WritingSuggestion,
  RubricScore as AIRubricScore, // Renamed to avoid conflict
  RubricBreakdown,
  AIResponseMetadata,
  TokenUsage,
  Citation,
  AIProvider,
  AIFeature,
  AIResponseType,
  SuggestionType,
  GeneratedContentType,
  StudyToolType,
  WritingTaskType
} from './ai.types';