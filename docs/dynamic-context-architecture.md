# Dynamic Context Architecture for AI-Powered Education

## Overview
A three-tier context system that combines immediate context, saved knowledge, and persistent learning profiles for personalized AI tutoring.

## 1. Three-Tier Context System

### Tier 1: Active Context (Immediate)
What the student is working on RIGHT NOW:
- Current assignment details
- Specific problem they're solving
- Files/images they've uploaded
- Last 3-5 messages in conversation

### Tier 2: Notebook Context (Retrievable)
Student's saved knowledge base:
- Lecture notes
- Past assignments
- Concept explanations saved from AI
- Study materials
- Personal annotations

### Tier 3: Learning Profile (Persistent)
Long-term understanding of the student:
- Grade level & curriculum
- Learning pace & style
- Concepts mastered
- Areas of struggle
- Progress over time

## 2. Context Data Structure

```typescript
interface DynamicContext {
  // Tier 1: Active Context
  active: {
    currentAssignment?: NotebookEntry;
    recentMessages: ChatMessage[];
    uploadedFiles: FileAttachment[];
    currentProblem?: string;
  };
  
  // Tier 2: Notebook Context (dynamically retrieved)
  notebook: {
    relevantEntries: NotebookEntry[]; // AI-selected based on similarity
    referencedConcepts: string[];      // Extracted key concepts
    linkedMaterials: StudyMaterial[];
  };
  
  // Tier 3: Learning Profile
  profile: {
    gradeLevel: number;
    curriculum: string;
    subjects: SubjectProfile[];
    learningStyle: LearningStyle;
    progressTracking: ProgressMetrics;
  };
}

interface SubjectProfile {
  subjectId: string;
  masteredConcepts: Concept[];
  strugglingConcepts: Concept[];
  recentTopics: string[];
  performanceHistory: Performance[];
}

interface Concept {
  name: string;
  confidence: number; // 0-1
  lastReviewed: Date;
  timesReviewed: number;
  relatedNotebooks: string[]; // IDs
}
```

## 3. Context Retrieval Strategy

### A. Automatic Context Building
```typescript
async function buildDynamicContext(message: string, userId: string): Promise<DynamicContext> {
  // 1. Extract key concepts from user message
  const concepts = await extractConcepts(message);
  
  // 2. Retrieve relevant notebook entries (vector similarity)
  const relevantNotebooks = await searchNotebooks({
    userId,
    concepts,
    limit: 5,
    scoreThreshold: 0.7
  });
  
  // 3. Get learning profile
  const profile = await getLearningProfile(userId);
  
  // 4. Fetch recent conversation context
  const recentMessages = await getRecentMessages(sessionId, 5);
  
  return {
    active: { recentMessages, currentProblem: message },
    notebook: { relevantEntries: relevantNotebooks },
    profile
  };
}
```

### B. Context Ranking Algorithm
1. **Recency**: Recent notes weighted higher
2. **Relevance**: Semantic similarity to current question
3. **Frequency**: Often-referenced materials
4. **Performance**: Materials from struggling concepts prioritized

## 4. Context Usage in Prompts

### Structured Prompt Template
```typescript
const buildPrompt = (context: DynamicContext, userMessage: string) => {
  return `
# Student Profile
- Grade Level: ${context.profile.gradeLevel}
- Currently studying: ${context.active.currentAssignment?.title || 'General topic'}
- Learning style: ${context.profile.learningStyle}
- Recent struggles: ${context.profile.subjects[0]?.strugglingConcepts.map(c => c.name).join(', ')}

# Relevant Knowledge from Notebook
${context.notebook.relevantEntries.map(entry => `
- ${entry.title}: ${entry.content.substring(0, 200)}...
`).join('\n')}

# Recent Conversation Context
${context.active.recentMessages.map(msg => `
${msg.role}: ${msg.content}
`).join('\n')}

# Current Question
${userMessage}

# Instructions
1. Reference the student's notebook materials when relevant
2. Build upon concepts they've already learned
3. Address known struggling points proactively
4. Adapt explanation to their grade level and learning style
5. If this relates to their current assignment, stay focused on that context
`;
};
```

## 5. Implementation Plan

### Phase 1: Enhanced Message Context
- Include last 5 messages in API calls
- Add session-based memory
- Track topics within conversation

### Phase 2: Notebook Integration
- Add "Attach from Notebook" feature
- Implement vector search for relevant notes
- Auto-suggest relevant notebooks

### Phase 3: Learning Profile
- Track concept mastery over time
- Build performance metrics
- Personalize teaching approach

### Phase 4: Smart Retrieval
- Implement embedding-based search
- Add concept extraction
- Build relevance scoring

## 6. UI/UX Features

### Context Indicator
Show what context is being used:
```
┌─────────────────────────────────┐
│ 📚 Active Context:              │
│ • Subject: Calculus             │
│ • Assignment: Derivatives HW    │
│ • Related notes: 3 entries      │
│ • Your level: Intermediate      │
└─────────────────────────────────┘
```

### Quick Context Actions
- "📎 Attach from Notebook"
- "📝 Save to Notebook"
- "🔄 Update my learning profile"
- "📊 Show my progress"

## 7. Privacy & Performance

### Caching Strategy
- Cache frequently accessed notebook entries
- Store embeddings locally for fast search
- Progressive context loading

### Privacy Controls
- User controls what's in their profile
- Ability to reset learning history
- Granular sharing permissions

## 8. Prompt Engineering Best Practices

### Dynamic Few-Shot Examples
Include examples based on:
- Student's grade level
- Their preferred explanation style
- Previously successful interactions

### Adaptive Complexity
```typescript
const complexityLevel = calculateComplexity(
  context.profile.gradeLevel,
  context.profile.subjects[0]?.masteredConcepts.length,
  userMessage
);
```

### Contextual Guardrails
- Don't reference materials student hasn't learned
- Gradually increase complexity
- Always relate back to their curriculum

## Next Steps

1. **Implement basic conversation memory** (Phase 1)
2. **Add notebook attachment UI** (Phase 2)
3. **Create learning profile tracker** (Phase 3)
4. **Build vector search for notebooks** (Phase 4)

This architecture ensures:
- ✅ Precise, targeted teaching
- ✅ Builds on prior knowledge
- ✅ Adapts to learning progress
- ✅ Maintains conversation continuity
- ✅ Leverages saved materials effectively