# Notebook Creation Features - Build Plan

## Overview
Implement comprehensive notebook creation system with multiple entry points:
1. From chat messages (single or multiple)
2. AI-generated study materials via prompts
3. PDF document parsing
4. Image/photo OCR with original retention

## Phase 1: Core Notebook Infrastructure (2-3 hours)

### 1.1 Update Notebook Store to Use Dexie
- [ ] Create `notebook.store.dexie.ts` similar to chat store
- [ ] Implement migration from localStorage
- [ ] Add CRUD operations with Dexie backend
- [ ] Maintain Zustand for reactive UI

### 1.2 Markdown Editor Integration
- [ ] Add markdown editor component (react-md-editor or similar)
- [ ] Support syntax highlighting for code blocks
- [ ] Add preview mode toggle
- [ ] Implement auto-save with debouncing

### 1.3 Notebook Entry Templates
```typescript
interface NotebookTemplate {
  id: string;
  name: string;
  structure: {
    sections: Array<{
      title: string;
      prompt?: string;
      defaultContent?: string;
    }>;
  };
}
```

## Phase 2: Chat Message Integration (2-3 hours)

### 2.1 Single Message to Notebook
- [ ] Add "Save to Notebook" button on messages
- [ ] Create modal for title/tags input
- [ ] Format message with metadata (timestamp, context)
- [ ] Link back to original chat session

### 2.2 Multiple Message Selection
- [ ] Add selection mode to chat interface
- [ ] Implement bulk actions toolbar
- [ ] Create combined notebook entry with proper formatting
- [ ] Preserve conversation flow in markdown

### 2.3 Message Formatting
```typescript
function formatChatToMarkdown(messages: ChatMessage[]): string {
  return messages.map(msg => `
### ${msg.role === 'user' ? '👤 You' : '🤖 Assistant'} - ${formatDate(msg.createdAt)}

${msg.content}

${msg.attachments?.length ? `**Attachments:** ${msg.attachments.map(a => a.title).join(', ')}` : ''}
---
  `).join('\n');
}
```

## Phase 3: AI-Powered Study Guide Generation (3-4 hours)

### 3.1 Study Guide Generator Service
```typescript
interface StudyGuideRequest {
  topic: string;
  type: 'outline' | 'flashcards' | 'summary' | 'practice_questions';
  gradeLevel?: number;
  depth: 'basic' | 'intermediate' | 'advanced';
  includeExamples?: boolean;
  subjectId: string;
}
```

### 3.2 Netlify Function for Study Guide Generation
- [ ] Create `/netlify/functions/generate-study-guide.ts`
- [ ] Use Anthropic API with structured prompts
- [ ] Return markdown-formatted content
- [ ] Include metadata for notebook entry

### 3.3 UI Flow
- [ ] Add "Generate Study Material" button in notebook page
- [ ] Create form with topic, type, and options
- [ ] Show generation progress
- [ ] Allow editing after generation

## Phase 4: PDF Upload & Parsing (3-4 hours)

### 4.1 PDF Upload Infrastructure
- [ ] Add file upload component with drag-and-drop
- [ ] Store original PDF in Dexie as Blob
- [ ] Implement file size limits (10MB?)
- [ ] Show upload progress

### 4.2 PDF Parsing Options
```typescript
// Option 1: Client-side with pdf.js
import * as pdfjsLib from 'pdfjs-dist';

// Option 2: Server-side with Netlify Function
// Using pdf-parse or similar library

// Option 3: External API (Google Document AI, AWS Textract)
```

### 4.3 PDF to Markdown Conversion
- [ ] Extract text from PDF
- [ ] Preserve basic formatting (headers, lists)
- [ ] Handle tables if possible
- [ ] Create notebook entry with original PDF attached

## Phase 5: Image Upload & OCR (3-4 hours)

### 5.1 Image Upload & Storage
- [ ] Support common formats (JPEG, PNG, HEIC)
- [ ] Compress images before storage
- [ ] Store original in Dexie
- [ ] Generate thumbnails

### 5.2 OCR Integration Options
```typescript
// Option 1: Google Cloud Vision API
const vision = new ImageAnnotatorClient();
const [result] = await vision.textDetection(imageBuffer);

// Option 2: Tesseract.js (client-side)
const { data: { text } } = await Tesseract.recognize(imageUrl);

// Option 3: AWS Textract
// Option 4: Azure Computer Vision
```

### 5.3 OCR Processing Flow
- [ ] Send image to OCR service
- [ ] Parse structured data (handwriting, printed text)
- [ ] Format as markdown
- [ ] Allow user to edit/correct OCR results

## Phase 6: Integration & Polish (2-3 hours)

### 6.1 Unified Creation Flow
- [ ] Create notebook creation modal/page
- [ ] Show all creation options
- [ ] Consistent UI across methods
- [ ] Progress tracking for async operations

### 6.2 Error Handling
- [ ] File size validation
- [ ] Format validation
- [ ] OCR failure fallbacks
- [ ] Network error handling

### 6.3 Performance Optimization
- [ ] Lazy load heavy libraries (pdf.js, tesseract)
- [ ] Implement request queuing
- [ ] Add caching for repeated operations
- [ ] Optimize Dexie queries

## Technical Decisions Needed

### Questions for Implementation:

1. **Markdown Editor**: 
   - Simple textarea with preview? 
   - Full WYSIWYG editor?
   - Support for LaTeX math formulas?

2. **PDF Parsing**:
   - Client-side (privacy, no API costs) vs Server-side (better parsing)?
   - How important is preserving complex formatting?
   - Should we extract images from PDFs?

3. **OCR Service**:
   - Free tier limits vs accuracy trade-off?
   - Client-side (Tesseract.js) vs Cloud API?
   - Support for handwriting or just printed text?

4. **Storage Limits**:
   - Max file size for uploads?
   - Total storage quota per user?
   - Compression strategies?

5. **AI Study Guide Generation**:
   - Pre-defined templates or fully dynamic?
   - How to handle subject-specific content (math formulas, chemical equations)?
   - Integration with curriculum standards?

## Implementation Order

1. **Start with**: Notebook store migration to Dexie
2. **Then**: Basic markdown editor and chat message integration
3. **Next**: AI study guide generation (high value, easier to implement)
4. **Finally**: File uploads (PDF/Image) - more complex, needs external services

## Estimated Total Time: 15-20 hours

Would you like me to:
1. Start with Phase 1 (Dexie migration and markdown editor)?
2. Get more specific about OCR/PDF parsing service preferences?
3. Design the UI/UX flows in more detail?
4. Research specific libraries and their trade-offs?