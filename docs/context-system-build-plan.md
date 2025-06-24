# Context System Build Plan - Self-Executing

## Overview
This is a self-executing build plan to implement a comprehensive context system with debugging capabilities. Each phase builds on the previous one with clear verification steps.

## Current Status
- ✅ Phase 1: Basic conversation memory (last 5 messages)
- ✅ Debug mode toggle
- ❌ Firebase storage (everything is in localStorage)
- ❌ Notebook context retrieval
- ❌ Learning profile tracking

## Build Phases

### Phase 1.5: Implement Dexie Storage Layer (Priority: CRITICAL)
**Goal**: Upgrade from localStorage (5MB) to IndexedDB (GBs) for scalable local storage

#### 1.5.1 Database Schema Setup
```typescript
// src/lib/db.ts
- Chat messages with full-text search
- Notebook entries with embeddings
- Learning profiles with analytics
- File attachments support
```

**Tasks**:
1. Install and configure Dexie
2. Design optimal schema
3. Create database migrations
4. Add TypeScript types

**Verification**:
- Can store 1000+ messages without issues
- Search returns results in <100ms
- Files up to 50MB can be stored

### Phase 2: Move to Firebase Storage (Priority: Medium - Premium Feature)
**Goal**: Add cloud sync for premium users only

#### 2.1 Chat Messages to Firestore
```typescript
// src/services/chat/firebase-chat.service.ts
interface ChatService {
  saveMessage(message: ChatMessage): Promise<void>;
  getMessages(sessionId: string, limit: number): Promise<ChatMessage[]>;
  updateMessage(messageId: string, updates: Partial<ChatMessage>): Promise<void>;
}
```

**Tasks**:
1. Create firebase-chat.service.ts
2. Update chat.store.ts to use Firebase
3. Add real-time listeners for messages
4. Migrate existing localStorage data

**Verification**:
- Messages persist across browser sessions
- Real-time sync between tabs
- Debug info shows Firebase timestamps

#### 2.2 Notebooks to Firestore
```typescript
// src/services/notebook/firebase-notebook.service.ts
interface NotebookService {
  createEntry(entry: NotebookEntry): Promise<string>;
  getEntries(userId: string, filters?: NotebookFilters): Promise<NotebookEntry[]>;
  searchEntries(query: string, limit: number): Promise<NotebookEntry[]>;
}
```

**Tasks**:
1. Create firebase-notebook.service.ts
2. Add full-text search indexes
3. Implement vector embeddings for similarity search
4. Update notebook.store.ts

**Verification**:
- Notebooks sync across devices
- Search returns relevant results
- Performance remains good with pagination

### Phase 3: Smart Context Retrieval
**Goal**: AI automatically pulls relevant context from notebooks

#### 3.1 Context Extraction Service
```typescript
// src/services/context/context-extraction.service.ts
interface ContextExtractionService {
  extractConcepts(text: string): Promise<string[]>;
  findRelatedNotebooks(concepts: string[], userId: string): Promise<NotebookEntry[]>;
  rankByRelevance(entries: NotebookEntry[], query: string): Promise<NotebookEntry[]>;
}
```

**Tasks**:
1. Implement concept extraction (using AI or keywords)
2. Create similarity scoring algorithm
3. Add caching for performance
4. Build context preview UI

**Verification**:
- Asking about "derivatives" auto-suggests calculus notes
- Context suggestions are relevant
- Performance < 500ms

#### 3.2 Attachment System Enhancement
```typescript
// Enhanced attachment picker
interface EnhancedAttachmentPicker {
  suggestions: NotebookEntry[];
  recentlyUsed: NotebookEntry[];
  search: (query: string) => Promise<NotebookEntry[]>;
  autoSuggest: boolean;
}
```

**Tasks**:
1. Add "Suggested Context" section to AttachmentPicker
2. Track recently used notebooks
3. Implement quick search
4. Add preview on hover

**Verification**:
- Relevant notebooks appear automatically
- Search works instantly
- Can attach multiple notebooks

### Phase 4: Learning Profile System
**Goal**: Track student progress and adapt teaching

#### 4.1 Profile Tracking Service
```typescript
// src/services/profile/learning-profile.service.ts
interface LearningProfileService {
  trackConcept(userId: string, concept: string, confidence: number): Promise<void>;
  getProfile(userId: string, subjectId?: string): Promise<LearningProfile>;
  updateMastery(userId: string, updates: MasteryUpdate[]): Promise<void>;
}
```

**Tasks**:
1. Create Firestore schema for profiles
2. Track concept interactions
3. Calculate mastery scores
4. Build progress visualization

**Verification**:
- Profile shows mastered/struggling concepts
- Confidence scores update after interactions
- Progress charts show improvement

#### 4.2 Adaptive Prompting
```typescript
// Enhance prompts based on profile
interface AdaptivePrompt {
  basePrompt: string;
  profileEnhancements: {
    gradeLevel: string;
    masteredConcepts: string[];
    strugglingConcepts: string[];
    learningStyle: string;
  };
  buildFinalPrompt(): string;
}
```

**Tasks**:
1. Update Netlify function to use profiles
2. Add profile data to context
3. Implement difficulty adaptation
4. Create feedback loops

**Verification**:
- Explanations match student level
- Previously struggled concepts get extra attention
- Teaching style adapts to learning style

### Phase 5: Advanced Features
**Goal**: Production-ready features

#### 5.1 Conversation Branching
- Save important explanations
- Create study paths
- Branch conversations by topic

#### 5.2 Export & Share
- Export conversations as study guides
- Share notebooks with classmates
- Generate practice problems

#### 5.3 Analytics Dashboard
- Learning progress over time
- Concept mastery heatmap
- Study session insights

## Implementation Order

### Week 1: Firebase Migration
```bash
# Day 1-2: Chat to Firebase
- [ ] Create firebase-chat.service.ts
- [ ] Add Firestore rules
- [ ] Update chat.store.ts
- [ ] Test real-time sync

# Day 3-4: Notebooks to Firebase  
- [ ] Create firebase-notebook.service.ts
- [ ] Add search indexes
- [ ] Migrate existing data
- [ ] Test performance

# Day 5: Integration testing
- [ ] Cross-device testing
- [ ] Performance benchmarks
- [ ] Debug mode verification
```

### Week 2: Context System
```bash
# Day 1-2: Extraction service
- [ ] Concept extraction algorithm
- [ ] Similarity scoring
- [ ] Caching layer

# Day 3-4: UI enhancements
- [ ] Enhanced attachment picker
- [ ] Context preview
- [ ] Auto-suggestions

# Day 5: Testing
- [ ] Relevance testing
- [ ] Performance optimization
```

### Week 3: Learning Profiles
```bash
# Day 1-2: Profile service
- [ ] Schema design
- [ ] Tracking implementation
- [ ] Mastery calculations

# Day 3-4: Adaptive system
- [ ] Profile-based prompts
- [ ] Difficulty adaptation
- [ ] Progress visualization

# Day 5: Polish
- [ ] UI improvements
- [ ] Performance tuning
```

## Debugging Checkpoints

### After Each Phase:
1. **Functionality Test**: Does the feature work as expected?
2. **Performance Test**: Response time < 1s?
3. **Debug Mode Test**: Can we see what's happening?
4. **Error Handling**: Graceful failures?
5. **User Experience**: Intuitive and helpful?

### Debug Enhancements to Add:
```typescript
interface DebugPanel {
  showContextSources: boolean;      // Where context came from
  showPromptConstruction: boolean;  // How prompt was built
  showConfidenceScores: boolean;    // AI confidence in responses
  showPerformanceMetrics: boolean;  // Timing for each operation
  exportDebugLog: () => void;       // Export for analysis
}
```

## Success Metrics

1. **Context Relevance**: 80%+ of suggested contexts are helpful
2. **Performance**: All operations < 1s
3. **Learning Tracking**: Measurable improvement in mastery scores
4. **User Satisfaction**: Students find it helpful (survey)

## Next Steps
1. Start with Phase 2.1 (Chat to Firebase)
2. Test each component thoroughly
3. Get user feedback after each phase
4. Iterate based on real usage

This plan is designed to be self-executing - each phase has clear tasks, verification steps, and builds towards a comprehensive context system.