# Integrated Notebook Creation Build Plan for SkooledIn

## Overview
Integrating your comprehensive PDF processing and AI study guide features into the existing SkooledIn app architecture.

## Key Integration Points

### 1. **Existing Infrastructure to Leverage**
- ✅ Dexie database already set up
- ✅ Netlify Functions for AI integration (chat.ts)
- ✅ Anthropic API integration
- ✅ Chat interface with context awareness
- ✅ TypeScript + Vite + React setup

### 2. **New Features to Add (from your plan)**
- 📝 WYSIWYG Markdown editor with LaTeX support
- 📄 PDF upload and GPT-4 Vision processing
- 🤖 AI study guide generation
- 💡 Proactive suggestions and reply buttons
- 📸 Image OCR (later phase)

## Phase 1: Update Notebook Store with Dexie (2 hours)

### 1.1 Create Dexie-based Notebook Store
```typescript
// src/stores/notebook.store.dexie.ts
import { create } from 'zustand';
import { notebookDBService } from '@/services/db/notebook-db.service';

interface NotebookState {
  entries: NotebookEntry[];
  activeEntry: NotebookEntry | null;
  isLoading: boolean;
  
  // CRUD operations
  createEntry: (entry: Partial<NotebookEntry>) => Promise<NotebookEntry>;
  updateEntry: (id: string, updates: Partial<NotebookEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  
  // From chat messages
  createFromMessages: (messages: ChatMessage[], metadata: NotebookMetadata) => Promise<NotebookEntry>;
  
  // AI generation
  generateStudyGuide: (request: StudyGuideRequest) => Promise<NotebookEntry>;
}
```

### 1.2 Migration Component Update
- Update DatabaseMigration.tsx to handle notebook migration
- Preserve existing notebook entries from localStorage

## Phase 2: WYSIWYG Markdown Editor (3 hours)

### 2.1 Install Editor Dependencies
```bash
npm install @uiw/react-md-editor react-hook-form
npm install katex mermaid  # For LaTeX and diagrams
npm install @excalidraw/excalidraw  # For drawings/diagrams
```

### 2.2 Create Editor Component
```typescript
// src/components/notebook/NotebookEditor.tsx
interface NotebookEditorProps {
  entry?: NotebookEntry;
  onSave: (content: string, metadata: NotebookMetadata) => Promise<void>;
  mode: 'create' | 'edit';
  initialContent?: string;
  template?: NotebookTemplate;
}

// Features:
// - Formatting toolbar (bold, italic, lists, etc.)
// - LaTeX math rendering with KaTeX
// - Code syntax highlighting
// - Mermaid diagram support
// - Auto-save with debouncing
// - Split view (edit/preview)
```

### 2.3 Template System
```typescript
// src/data/notebook-templates.ts
export const notebookTemplates = {
  studyGuide: {
    name: "Study Guide",
    sections: [
      { title: "Key Concepts", prompt: "List main ideas" },
      { title: "Important Terms", prompt: "Define key vocabulary" },
      { title: "Examples", prompt: "Provide practical examples" },
      { title: "Practice Questions", prompt: "Test your understanding" }
    ]
  },
  // ... more templates
};
```

## Phase 3: Chat Message Integration (2 hours)

### 3.1 Update Chat Page UI
```typescript
// Add to ChatPage.tsx
const [selectionMode, setSelectionMode] = useState(false);
const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

// Add selection checkboxes to messages
// Add toolbar with "Save to Notebook" action
```

### 3.2 Message Selection Component
```typescript
// src/components/chat/MessageSelectionToolbar.tsx
interface MessageSelectionToolbarProps {
  selectedCount: number;
  onSaveToNotebook: () => void;
  onCancel: () => void;
}
```

### 3.3 Create Notebook Entry Modal
```typescript
// src/components/notebook/CreateNotebookModal.tsx
// - Title input
// - Tags selection
// - Subject association
// - Template selection
// - Preview of formatted content
```

## Phase 4: AI Study Guide Generation (3 hours)

### 4.1 Netlify Function for Study Guides
```typescript
// netlify/functions/generate-study-guide.ts
import { Anthropic } from '@anthropic-ai/sdk';

export default async (req: Request) => {
  const { topic, type, gradeLevel, depth, subjectId } = await req.json();
  
  const prompt = buildStudyGuidePrompt({ topic, type, gradeLevel, depth });
  
  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20241022",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: prompt
    }]
  });
  
  return Response.json({
    content: response.content[0].text,
    metadata: { topic, type, gradeLevel }
  });
};
```

### 4.2 Study Guide Generator UI
```typescript
// src/components/notebook/StudyGuideGenerator.tsx
// Form with:
// - Topic input (with suggestions from current subject)
// - Type selector (outline, flashcards, practice questions, etc.)
// - Grade level (auto-detected from profile)
// - Depth selector
// - Generate button with loading state
```

## Phase 5: PDF Processing with GPT-4 Vision (4 hours)

### 5.1 PDF Upload Component
```typescript
// src/components/notebook/PDFUpload.tsx
import { useDropzone } from 'react-dropzone';
import { pdfjs } from 'react-pdf';

// Features:
// - Drag and drop
// - File validation (size, type)
// - Progress tracking
// - Page preview
```

### 5.2 PDF Processing Function
```typescript
// netlify/functions/process-pdf.ts
import { OpenAI } from 'openai';

export default async (req: Request) => {
  const formData = await req.formData();
  const pdfFile = formData.get('pdf') as File;
  
  // Store original in Dexie as Blob
  const pdfBuffer = await pdfFile.arrayBuffer();
  
  // Extract pages as images
  const pages = await extractPagesAsImages(pdfBuffer);
  
  // Process each page with GPT-4 Vision
  const markdownPages = await Promise.all(
    pages.map(page => processPageWithGPT4Vision(page))
  );
  
  return Response.json({
    markdown: markdownPages.join('\n\n---\n\n'),
    pageCount: pages.length,
    originalFileId: savedFileId
  });
};
```

### 5.3 GPT-4 Vision Integration
```typescript
// src/lib/gpt4-vision.ts
const processPageWithGPT4Vision = async (imageBase64: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: `Extract all text from this PDF page and convert to Markdown.
                 Preserve: headers, lists, tables, formulas (as LaTeX).
                 Follow natural reading order.
                 For math: use $...$ for inline, $$...$$ for block.`
        },
        {
          type: "image_url",
          image_url: { url: `data:image/png;base64,${imageBase64}` }
        }
      ]
    }],
    max_tokens: 4000
  });
  
  return response.choices[0].message.content;
};
```

## Phase 6: Proactive AI Suggestions (2 hours)

### 6.1 Update Chat Response UI
```typescript
// src/components/chat/AIMessage.tsx
// Add suggested reply buttons after each AI message
interface SuggestedReply {
  text: string;
  action: 'follow-up' | 'create-notebook' | 'practice' | 'explain';
}

// Example suggestions:
// - "Create study guide on this topic"
// - "Give me practice problems"
// - "Save this explanation"
// - "Explain this differently"
```

### 6.2 Context-Aware Suggestions
```typescript
// src/services/ai/suggestions.service.ts
export const generateSuggestions = (
  message: ChatMessage,
  context: StudyContext
): SuggestedReply[] => {
  // Analyze message content
  // Consider current subject and recent topics
  // Generate relevant suggestions
};
```

## Phase 7: Enhanced File Storage (2 hours)

### 7.1 Update Dexie Schema for Files
```typescript
// Add to db.ts
fileUploads: '++id, userId, type, originalName, [userId+type], uploadedAt',

interface DBFileUpload {
  id: string;
  userId: string;
  type: 'pdf' | 'image';
  originalName: string;
  fileBlob: Blob;
  processedContent?: string;
  metadata: FileMetadata;
  uploadedAt: number;
}
```

### 7.2 File Management Service
```typescript
// src/services/db/file-db.service.ts
export class FileDBService {
  async saveFile(file: File, userId: string): Promise<string>;
  async getFile(fileId: string): Promise<Blob>;
  async getProcessedContent(fileId: string): Promise<string>;
}
```

## Implementation Priority & Timeline

### Week 1 (High Priority - Foundation)
1. **Day 1-2**: Notebook store migration to Dexie ✅
2. **Day 3-4**: WYSIWYG markdown editor with LaTeX
3. **Day 5**: Chat message to notebook conversion

### Week 2 (High Value - AI Features)
4. **Day 1-2**: AI study guide generation
5. **Day 3-4**: PDF upload and GPT-4 Vision processing
6. **Day 5**: Proactive suggestions system

### Week 3 (Enhancement & Polish)
7. **Day 1-2**: File storage optimization
8. **Day 3-4**: Performance improvements and error handling
9. **Day 5**: Testing and bug fixes

## Key Decisions Made

1. **Use GPT-4 Vision** for PDF processing (accuracy over cost)
2. **Start with printed text**, add handwriting later
3. **No immediate offline support** - can add PWA features later
4. **Focus on individual use** - no collaboration features yet
5. **Prioritize PDF and study guides** for immediate value

## Next Steps

Should I start implementing:
1. The notebook store migration to Dexie (foundation for everything else)?
2. The WYSIWYG editor component (visible progress)?
3. The PDF processing pipeline (high value feature)?

What would you like me to tackle first?