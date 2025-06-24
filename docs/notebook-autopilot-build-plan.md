# Notebook System - Self-Executing Build Plan

## Overview
This is a comprehensive, self-executing build plan for implementing the complete notebook system with PDF processing, AI study guides, and WYSIWYG editing. Each phase includes specific implementation steps, validation criteria, and automatic progress tracking.

## Build Phases & Checkpoints

### Phase 1: Foundation - Notebook Store Migration (3 hours)
**Goal**: Migrate notebook functionality to Dexie for scalable storage

#### 1.1 Create Notebook Database Service
```typescript
// File: src/services/db/notebook-db.service.ts
// Already exists - verify functionality
```
**Validation**: 
- [ ] File exists and exports notebookDBService
- [ ] All CRUD operations implemented
- [ ] Search functionality works

#### 1.2 Create Dexie-based Notebook Store
```typescript
// File: src/stores/notebook.store.dexie.ts
// Create new store with:
- State management via Zustand
- Dexie persistence layer
- Migration from localStorage
- Real-time search
```
**Implementation Steps**:
1. Copy pattern from chat.store.dexie.ts
2. Add notebook-specific methods
3. Implement migration logic
4. Add search and filtering

**Validation**:
- [ ] Store created and exports useNotebookStore
- [ ] Migration from localStorage works
- [ ] CRUD operations functional
- [ ] Search returns results

#### 1.3 Update DatabaseMigration Component
```typescript
// File: src/components/common/DatabaseMigration.tsx
// Add notebook migration logic
```
**Validation**:
- [ ] Notebook data migrates successfully
- [ ] Progress shown during migration
- [ ] No data loss

#### 1.4 Update NotebookPage to Use New Store
```typescript
// File: src/pages/notebook/NotebookPage.tsx
// Replace old store with new Dexie store
```
**Validation**:
- [ ] Page loads without errors
- [ ] Existing notebooks appear
- [ ] Create/edit/delete works

### Phase 2: WYSIWYG Markdown Editor (4 hours)
**Goal**: Implement rich markdown editor with LaTeX and diagram support

#### 2.1 Install Dependencies
```bash
npm install @uiw/react-md-editor@4.0.4
npm install katex@0.16.11
npm install react-markdown@9.0.1
npm install remark-math@6.0.0 rehype-katex@7.0.1
npm install mermaid@11.4.1
npm install react-hook-form@7.55.0
```
**Validation**:
- [ ] All packages installed
- [ ] No version conflicts
- [ ] Build succeeds

#### 2.2 Create Editor Component
```typescript
// File: src/components/notebook/NotebookEditor.tsx
interface NotebookEditorProps {
  entry?: NotebookEntry;
  onSave: (content: string, metadata: NotebookMetadata) => Promise<void>;
  mode: 'create' | 'edit';
  initialContent?: string;
  template?: NotebookTemplate;
}
```
**Features to Implement**:
1. MDEditor with preview toggle
2. Custom toolbar with formatting options
3. LaTeX math rendering (inline & block)
4. Code syntax highlighting
5. Auto-save every 30 seconds
6. Mermaid diagram support

**Validation**:
- [ ] Editor renders correctly
- [ ] Preview mode works
- [ ] Math formulas render: $x^2$ and $$\int_0^1 x dx$$
- [ ] Code blocks have syntax highlighting
- [ ] Auto-save indicator works

#### 2.3 Create Template System
```typescript
// File: src/data/notebook-templates.ts
export const notebookTemplates = {
  studyGuide: { /* ... */ },
  lectureNotes: { /* ... */ },
  practiceProblems: { /* ... */ },
  conceptMap: { /* ... */ }
}
```
**Validation**:
- [ ] At least 4 templates defined
- [ ] Templates have sections and prompts
- [ ] Templates load in editor

#### 2.4 Integrate Editor into NotebookPage
```typescript
// Update: src/pages/notebook/NotebookPage.tsx
// Add create/edit modals with editor
```
**Validation**:
- [ ] Create button opens editor
- [ ] Edit button opens editor with content
- [ ] Save creates/updates entry
- [ ] Cancel discards changes

### Phase 3: Chat Message Integration (3 hours)
**Goal**: Enable saving chat messages to notebooks

#### 3.1 Add Selection Mode to Chat
```typescript
// Update: src/pages/chat/ChatPage.tsx
// Add:
- Selection mode toggle
- Message checkboxes
- Selection toolbar
```
**Validation**:
- [ ] Selection mode toggles
- [ ] Messages can be selected/deselected
- [ ] Selection count shows correctly

#### 3.2 Create Message Selection Toolbar
```typescript
// File: src/components/chat/MessageSelectionToolbar.tsx
// Actions: Save to Notebook, Clear Selection, Cancel
```
**Validation**:
- [ ] Toolbar appears when messages selected
- [ ] Actions are clickable
- [ ] Clear selection works

#### 3.3 Create Save to Notebook Modal
```typescript
// File: src/components/notebook/SaveMessagesModal.tsx
// Features:
- Title input
- Subject selector
- Tags input
- Template selector
- Preview
```
**Validation**:
- [ ] Modal opens from toolbar
- [ ] Form validation works
- [ ] Preview shows formatted messages
- [ ] Save creates notebook entry

#### 3.4 Message Formatting Service
```typescript
// File: src/services/notebook/message-formatter.ts
// Convert chat messages to markdown
```
**Validation**:
- [ ] Messages format correctly
- [ ] Metadata preserved
- [ ] Attachments referenced
- [ ] Proper markdown structure

### Phase 4: AI Study Guide Generation (4 hours)
**Goal**: Generate study materials via AI

#### 4.1 Create Study Guide Types
```typescript
// File: src/types/study-guide.types.ts
export interface StudyGuideRequest {
  topic: string;
  type: 'outline' | 'flashcards' | 'summary' | 'practice_questions' | 'mind_map';
  gradeLevel?: number;
  depth: 'basic' | 'intermediate' | 'advanced';
  includeExamples?: boolean;
  subjectId: string;
}
```
**Validation**:
- [ ] Types exported correctly
- [ ] All guide types defined

#### 4.2 Create Netlify Function
```typescript
// File: netlify/functions/generate-study-guide.ts
// Use Anthropic API to generate content
```
**Implementation**:
1. Parse request body
2. Build appropriate prompt
3. Call Anthropic API
4. Format response as markdown
5. Return with metadata

**Validation**:
- [ ] Function deploys
- [ ] Accepts POST requests
- [ ] Returns markdown content
- [ ] Handles errors gracefully

#### 4.3 Create Study Guide Generator UI
```typescript
// File: src/components/notebook/StudyGuideGenerator.tsx
// Form with all options
```
**Validation**:
- [ ] Form renders all fields
- [ ] Validation works
- [ ] Loading state shows
- [ ] Success creates notebook entry

#### 4.4 Add to NotebookPage
```typescript
// Update: src/pages/notebook/NotebookPage.tsx
// Add "Generate Study Guide" button
```
**Validation**:
- [ ] Button visible
- [ ] Opens generator modal
- [ ] Generated content saves

### Phase 5: PDF Processing (6 hours)
**Goal**: Upload PDFs and convert to markdown

#### 5.1 Install PDF Dependencies
```bash
npm install react-dropzone@14.3.5
npm install pdfjs-dist@4.8.69
npm install canvas@2.11.2
```
**Validation**:
- [ ] Packages installed
- [ ] PDF.js worker configured

#### 5.2 Create PDF Upload Component
```typescript
// File: src/components/notebook/PDFUpload.tsx
// Features:
- Drag and drop
- File validation
- Progress tracking
- Page count display
```
**Validation**:
- [ ] Drag and drop works
- [ ] Only PDFs accepted
- [ ] Progress bar updates
- [ ] Shows page count

#### 5.3 Create PDF Processing Function
```typescript
// File: netlify/functions/process-pdf.ts
// Steps:
1. Receive PDF file
2. Extract page count
3. Convert pages to images
4. Process with GPT-4 Vision
5. Return markdown
```
**Validation**:
- [ ] Function handles multipart upload
- [ ] Extracts pages correctly
- [ ] Calls GPT-4 Vision API
- [ ] Returns valid markdown

#### 5.4 Add OpenAI Configuration
```typescript
// Update: .env.local
OPENAI_API_KEY=your_key_here

// File: src/lib/openai.ts
// OpenAI client setup
```
**Validation**:
- [ ] API key set
- [ ] Client initializes
- [ ] Test API call works

#### 5.5 Create PDF Processing Service
```typescript
// File: src/services/pdf/pdf-processor.ts
// Client-side PDF handling
```
**Features**:
1. Page extraction
2. Image conversion
3. Batch processing
4. Progress tracking

**Validation**:
- [ ] Extracts all pages
- [ ] Converts to base64 images
- [ ] Tracks progress
- [ ] Handles large PDFs

#### 5.6 Integrate into NotebookPage
```typescript
// Update: src/pages/notebook/NotebookPage.tsx
// Add "Upload PDF" option
```
**Validation**:
- [ ] Upload button visible
- [ ] Opens upload modal
- [ ] Processing shows progress
- [ ] Result saves to notebook

### Phase 6: Proactive AI Suggestions (3 hours)
**Goal**: Add suggested actions after AI responses

#### 6.1 Create Suggestion Types
```typescript
// File: src/types/suggestions.types.ts
export interface SuggestedAction {
  id: string;
  text: string;
  action: 'follow-up' | 'create-notebook' | 'practice' | 'explain' | 'study-guide';
  payload?: any;
}
```
**Validation**:
- [ ] Types defined
- [ ] Actions cover use cases

#### 6.2 Create Suggestions Service
```typescript
// File: src/services/ai/suggestions.service.ts
// Analyze message and context to generate suggestions
```
**Validation**:
- [ ] Service exports functions
- [ ] Generates relevant suggestions
- [ ] Considers context

#### 6.3 Update AI Message Component
```typescript
// Update: src/components/chat/AIMessage.tsx
// Add suggestion buttons after content
```
**Validation**:
- [ ] Suggestions appear
- [ ] Buttons styled correctly
- [ ] Click handlers work

#### 6.4 Implement Suggestion Actions
```typescript
// Update: src/pages/chat/ChatPage.tsx
// Handle suggestion clicks
```
**Actions**:
1. Follow-up: Insert text in input
2. Create notebook: Open save modal
3. Practice: Generate practice problems
4. Explain: Request simpler explanation
5. Study guide: Open generator with topic

**Validation**:
- [ ] All actions implemented
- [ ] Actions execute correctly
- [ ] UI updates appropriately

### Phase 7: File Storage & Management (3 hours)
**Goal**: Robust file storage system

#### 7.1 Update Database Schema
```typescript
// Update: src/lib/db.ts
// Add fileUploads table
```
**Validation**:
- [ ] Migration succeeds
- [ ] Table created
- [ ] Indexes work

#### 7.2 Create File Service
```typescript
// File: src/services/db/file-db.service.ts
// CRUD for file storage
```
**Validation**:
- [ ] Service methods work
- [ ] Files store as Blobs
- [ ] Metadata saved
- [ ] Retrieval works

#### 7.3 Add File Management UI
```typescript
// File: src/components/notebook/FileManager.tsx
// List and manage uploaded files
```
**Validation**:
- [ ] Lists all files
- [ ] Shows file info
- [ ] Delete works
- [ ] Preview available

### Phase 8: Testing & Polish (4 hours)
**Goal**: Ensure quality and performance

#### 8.1 Unit Tests
```bash
# Create test files for:
- notebook.store.dexie.test.ts
- pdf-processor.test.ts
- message-formatter.test.ts
- suggestions.service.test.ts
```
**Validation**:
- [ ] Tests pass
- [ ] Coverage > 80%

#### 8.2 Integration Tests
```typescript
// Test complete flows:
- Create notebook from chat
- Generate study guide
- Upload and process PDF
```
**Validation**:
- [ ] E2E flows work
- [ ] No console errors
- [ ] Performance acceptable

#### 8.3 Performance Optimization
**Tasks**:
1. Lazy load PDF.js
2. Implement virtual scrolling for long notebooks
3. Add request debouncing
4. Optimize Dexie queries

**Validation**:
- [ ] Page load < 2s
- [ ] PDF processing < 30s/page
- [ ] Smooth scrolling
- [ ] No memory leaks

#### 8.4 Error Handling
**Tasks**:
1. Add error boundaries
2. User-friendly error messages
3. Retry logic for API calls
4. Fallback states

**Validation**:
- [ ] Errors caught gracefully
- [ ] Users see helpful messages
- [ ] Retry options available
- [ ] App doesn't crash

## Progress Tracking

### Automated Checkpoints
After each phase, run:
```bash
npm run build  # TypeScript check
npm run test   # Unit tests
npm run dev    # Manual testing
```

### Success Criteria
- [ ] All TypeScript errors resolved
- [ ] All tests passing
- [ ] Features work as described
- [ ] Performance targets met
- [ ] No regression in existing features

### Phase Completion Checklist
- [ ] Phase 1: Notebook Store Migration ⏳
- [ ] Phase 2: WYSIWYG Editor
- [ ] Phase 3: Chat Integration
- [ ] Phase 4: AI Study Guides
- [ ] Phase 5: PDF Processing
- [ ] Phase 6: AI Suggestions
- [ ] Phase 7: File Storage
- [ ] Phase 8: Testing & Polish

## Execution Instructions

1. **Start with Phase 1** - Foundation is critical
2. **Complete each validation** before moving on
3. **Commit after each phase** with descriptive message
4. **Run tests frequently** to catch regressions
5. **Update this document** with ✅ as tasks complete

## Error Recovery

If a phase fails:
1. Check the validation criteria
2. Review error messages
3. Rollback if necessary (git)
4. Fix and retry
5. Document any deviations

## Time Estimates

- Phase 1: 3 hours
- Phase 2: 4 hours  
- Phase 3: 3 hours
- Phase 4: 4 hours
- Phase 5: 6 hours
- Phase 6: 3 hours
- Phase 7: 3 hours
- Phase 8: 4 hours

**Total: 30 hours**

---

Ready to execute! Starting with Phase 1: Notebook Store Migration.