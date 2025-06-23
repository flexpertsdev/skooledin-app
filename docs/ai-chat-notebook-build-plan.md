# 🤖 AI Chat & Notebook System Build Plan

## Overview
Build a comprehensive context-aware AI tutoring system with seamless notebook integration, allowing students to attach context, create study materials, and annotate documents.

## Core Features to Implement

### 1. Context-Aware AI Chat
- AI understands current assignments, grades, and student progress
- Subject-specific tutoring with grade-appropriate responses
- Step-by-step problem solving without giving direct answers
- Visual equation rendering and code syntax highlighting

### 2. Seamless Context Attachment
- Attach notebook entries to chat conversations
- Reference assignments directly in chat
- Upload and discuss PDFs, images, and documents
- Link multiple resources to a single chat session

### 3. Smart Notebook System
- Auto-save important explanations from AI chat
- Convert handwritten notes to structured digital notes
- Add annotations to teacher PDFs
- Organize by subject, topic, and type automatically

### 4. Study Tool Generation
- Create flashcards from chat conversations
- Generate practice problems based on weak areas
- Build study guides from notebook content
- Convert notes into different formats (summary, outline, quiz)

## Implementation Phases

## Phase 1: Core AI Service & Type System (Week 1)

### Tasks:
- [ ] Create comprehensive TypeScript types for AI system
- [ ] Set up AI service architecture with proper interfaces
- [ ] Implement mock AI responses for development
- [ ] Create streaming response handler
- [ ] Build error handling and retry logic

### Files to Create:
```typescript
// types/ai.types.ts
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

export interface StudyContext {
  activeAssignments: Assignment[];
  recentTopics: string[];
  strugglingConcepts: string[];
  masteredConcepts: string[];
  currentGradeLevel: number;
  preferredLearningStyle?: 'visual' | 'auditory' | 'kinesthetic';
  subjects: Subject[];
}

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
```

### Implementation:
```typescript
// services/ai.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIEducationService {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
  }

  async getEducationalResponse(
    messages: ChatMessage[],
    context: StudyContext,
    attachments?: MessageAttachment[]
  ): Promise<StructuredAIResponse> {
    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: this.buildEducationalSystemPrompt(context)
    });

    // Include attachment context
    const attachmentContext = await this.processAttachments(attachments);
    
    const chat = model.startChat({
      history: this.convertToGeminiHistory(messages),
    });

    const result = await chat.sendMessage(
      this.buildPromptWithAttachments(messages[messages.length - 1].content, attachmentContext)
    );
    
    return this.parseStructuredResponse(result);
  }

  private async processAttachments(attachments?: MessageAttachment[]): Promise<string> {
    if (!attachments?.length) return '';
    
    const contexts = await Promise.all(attachments.map(async (att) => {
      switch (att.type) {
        case 'notebook':
          return `[Notebook Entry: ${att.title}]\n${att.preview}`;
        case 'assignment':
          return `[Assignment: ${att.title}]\n${att.preview}`;
        case 'document':
          return `[Document: ${att.title}]`;
        default:
          return '';
      }
    }));
    
    return contexts.filter(Boolean).join('\n\n');
  }
}
```

## Phase 2: Context-Aware Chat System (Week 2)

### Tasks:
- [ ] Implement chat UI with attachment support
- [ ] Create context attachment interface
- [ ] Build real-time typing indicators
- [ ] Add message status tracking
- [ ] Implement chat session management

### Components to Build:
```typescript
// components/chat/ChatInterface.tsx
export function ChatInterface() {
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  
  return (
    <div className="flex flex-col h-full">
      {/* Attached Context Bar */}
      {attachments.length > 0 && (
        <div className="bg-purple-50 border-b border-purple-200 p-3">
          <div className="flex items-center gap-2 flex-wrap">
            {attachments.map(att => (
              <AttachmentChip key={att.id} attachment={att} onRemove={...} />
            ))}
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>
      
      {/* Input with Attachments */}
      <ChatInput 
        onAttach={() => setShowAttachmentPicker(true)}
        attachments={attachments}
      />
      
      {/* Attachment Picker Sheet */}
      <AttachmentPicker 
        isOpen={showAttachmentPicker}
        onClose={() => setShowAttachmentPicker(false)}
        onSelect={(attachment) => setAttachments([...attachments, attachment])}
      />
    </div>
  );
}
```

### Attachment Picker:
```typescript
// components/chat/AttachmentPicker.tsx
export function AttachmentPicker({ isOpen, onClose, onSelect }) {
  const { entries } = useNotebookStore();
  const { assignments } = useFeedStore();
  
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Attach Context</h3>
        
        <Tabs defaultValue="notebook">
          <TabsList>
            <TabsTrigger value="notebook">Notebook</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notebook">
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {entries.map(entry => (
                <button
                  key={entry.id}
                  onClick={() => onSelect({
                    id: `att-${Date.now()}`,
                    type: 'notebook',
                    resourceId: entry.id,
                    title: entry.title,
                    preview: entry.content.substring(0, 100)
                  })}
                  className="text-left p-3 border rounded-lg hover:bg-gray-50"
                >
                  <h4 className="font-medium">{entry.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
                </button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="assignments">
            {/* Similar for assignments */}
          </TabsContent>
          
          <TabsContent value="upload">
            <FileUploadZone 
              accept="image/*,.pdf,.doc,.docx"
              onUpload={(file) => handleFileUpload(file)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </BottomSheet>
  );
}
```

## Phase 3: Notebook Integration (Week 3)

### Tasks:
- [ ] Implement save-to-notebook from chat
- [ ] Create notebook entry editor
- [ ] Build folder organization system
- [ ] Add tagging and search
- [ ] Implement notebook templates

### Key Features:
```typescript
// components/notebook/NotebookEditor.tsx
export function NotebookEditor({ entry, onSave }) {
  const [content, setContent] = useState(entry?.content || '');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <EditorToolbar 
        onFormat={(format) => applyFormat(format)}
        onInsertFormula={() => setShowFormulaEditor(true)}
        onAddAnnotation={() => setAnnotationMode(true)}
      />
      
      {/* Editor */}
      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 p-4">
          <RichTextEditor 
            content={content}
            onChange={setContent}
            placeholder="Start typing your notes..."
          />
        </div>
        
        {/* Annotations Sidebar */}
        {annotations.length > 0 && (
          <div className="w-80 border-l p-4">
            <h3 className="font-semibold mb-3">Annotations</h3>
            {annotations.map(ann => (
              <AnnotationCard key={ann.id} annotation={ann} />
            ))}
          </div>
        )}
      </div>
      
      {/* Save Options */}
      <div className="border-t p-4 flex justify-between">
        <div className="flex gap-2">
          <TagInput tags={entry?.tags || []} onChange={...} />
        </div>
        <Button onClick={() => onSave({ content, annotations })}>
          Save Note
        </Button>
      </div>
    </div>
  );
}
```

### Smart Organization:
```typescript
// services/notebook-organizer.service.ts
export class NotebookOrganizerService {
  async autoOrganizeEntry(entry: NotebookEntry): Promise<{
    suggestedFolder: string;
    suggestedTags: string[];
    relatedEntries: NotebookEntry[];
  }> {
    // Use AI to analyze content and suggest organization
    const analysis = await this.analyzeContent(entry.content);
    
    return {
      suggestedFolder: this.matchFolder(analysis.topics),
      suggestedTags: analysis.keywords,
      relatedEntries: await this.findRelatedEntries(analysis.concepts)
    };
  }
  
  async convertHandwritingToNotes(imageUrl: string): Promise<NotebookEntry> {
    // Use OCR + AI to convert handwritten notes
    const text = await this.performOCR(imageUrl);
    const structured = await this.structureNotes(text);
    
    return {
      title: structured.title,
      content: structured.formattedContent,
      type: 'concept',
      tags: structured.detectedTopics
    };
  }
}
```

## Phase 4: Attachment System (Week 4)

### Tasks:
- [ ] Create file upload service
- [ ] Implement PDF viewer with annotations
- [ ] Build image annotation tools
- [ ] Add document preview system
- [ ] Create attachment management UI

### PDF Annotation:
```typescript
// components/notebook/PDFAnnotator.tsx
export function PDFAnnotator({ pdfUrl, annotations, onAddAnnotation }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedText, setSelectedText] = useState('');
  const [annotationMode, setAnnotationMode] = useState<'highlight' | 'note' | null>(null);
  
  return (
    <div className="flex h-full">
      {/* PDF Viewer */}
      <div className="flex-1 relative">
        <PDFViewer 
          url={pdfUrl}
          page={currentPage}
          onTextSelect={setSelectedText}
          annotations={annotations.filter(a => a.pageNumber === currentPage)}
        />
        
        {/* Annotation Toolbar */}
        {selectedText && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
            <button 
              onClick={() => addHighlight(selectedText)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Highlighter className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setAnnotationMode('note')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <StickyNote className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Annotations Panel */}
      <div className="w-80 border-l bg-white p-4">
        <h3 className="font-semibold mb-4">Notes & Highlights</h3>
        <div className="space-y-3">
          {annotations
            .filter(a => a.pageNumber === currentPage)
            .map(annotation => (
              <AnnotationCard 
                key={annotation.id}
                annotation={annotation}
                onEdit={...}
                onDelete={...}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
```

## Phase 5: PDF & Document Processing (Week 5)

### Tasks:
- [ ] Integrate PDF.js for viewing
- [ ] Implement OCR for handwritten notes
- [ ] Create document analysis service
- [ ] Build worksheet completion tools
- [ ] Add collaborative annotations

### Document Processing:
```typescript
// services/document-processor.service.ts
export class DocumentProcessorService {
  async processWorksheet(pdfFile: File): Promise<ProcessedWorksheet> {
    // Extract text and structure
    const extractedData = await this.extractPDFContent(pdfFile);
    
    // Identify questions and answer spaces
    const questions = await this.identifyQuestions(extractedData);
    
    // Create interactive worksheet
    return {
      originalPdf: await this.uploadFile(pdfFile),
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        pageNumber: q.page,
        position: q.boundingBox,
        answerSpace: q.answerArea,
        type: this.detectQuestionType(q.text)
      })),
      metadata: {
        subject: await this.detectSubject(extractedData),
        topics: await this.extractTopics(extractedData),
        difficulty: await this.assessDifficulty(extractedData)
      }
    };
  }
  
  async addAnswerToWorksheet(
    worksheetId: string, 
    questionId: string, 
    answer: string
  ): Promise<void> {
    // Save answer and optionally get AI feedback
    const worksheet = await this.getWorksheet(worksheetId);
    const question = worksheet.questions.find(q => q.id === questionId);
    
    if (question) {
      // Save answer
      await this.saveAnswer(worksheetId, questionId, answer);
      
      // Optional: Get AI feedback
      if (question.type !== 'open-ended') {
        const feedback = await this.getAIFeedback(question, answer);
        return feedback;
      }
    }
  }
}
```

## Phase 6: Study Tools & AI Generation (Week 6)

### Tasks:
- [ ] Create flashcard generator
- [ ] Build study guide creator
- [ ] Implement practice problem generator
- [ ] Add spaced repetition system
- [ ] Create export functionality

### Study Tool Components:
```typescript
// components/study-tools/StudyGuideGenerator.tsx
export function StudyGuideGenerator() {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [guideType, setGuideType] = useState<'summary' | 'outline' | 'flashcards'>('summary');
  
  const generateStudyGuide = async () => {
    const notes = selectedNotes.map(id => notebookEntries.find(e => e.id === id));
    
    const guide = await aiService.generateStudyGuide({
      type: guideType,
      sourceNotes: notes,
      targetLength: 'comprehensive',
      includeExamples: true,
      includePracticeQuestions: true
    });
    
    // Save as new notebook entry
    await notebookStore.addEntry({
      title: `${subject.name} Study Guide`,
      content: guide.content,
      type: 'summary',
      tags: ['study-guide', ...guide.topics],
      isAIGenerated: true
    });
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Create Study Guide</h2>
      
      {/* Note Selection */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Select Notes to Include</h3>
        <NoteSelector 
          notes={notebookEntries}
          selected={selectedNotes}
          onSelectionChange={setSelectedNotes}
        />
      </div>
      
      {/* Guide Type */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Guide Format</h3>
        <RadioGroup value={guideType} onValueChange={setGuideType}>
          <RadioGroupItem value="summary" label="Comprehensive Summary" />
          <RadioGroupItem value="outline" label="Study Outline" />
          <RadioGroupItem value="flashcards" label="Flashcard Set" />
        </RadioGroup>
      </div>
      
      <Button onClick={generateStudyGuide} disabled={selectedNotes.length === 0}>
        Generate Study Guide
      </Button>
    </div>
  );
}
```

### Flashcard System:
```typescript
// components/study-tools/FlashcardViewer.tsx
export function FlashcardViewer({ cards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [mastery, setMastery] = useState<Record<string, number>>({});
  
  const handleResponse = (correct: boolean) => {
    const cardId = cards[currentIndex].id;
    setMastery(prev => ({
      ...prev,
      [cardId]: correct 
        ? Math.min((prev[cardId] || 0) + 1, 5)
        : Math.max((prev[cardId] || 0) - 1, 0)
    }));
    
    // Move to next card
    setShowAnswer(false);
    setCurrentIndex((currentIndex + 1) % cards.length);
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Card {currentIndex + 1} of {cards.length}
        </span>
        <MasteryIndicator level={mastery[cards[currentIndex].id] || 0} />
      </div>
      
      <motion.div
        key={currentIndex}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: showAnswer ? 180 : 0 }}
        className="relative h-96 preserve-3d"
      >
        {/* Question Side */}
        <div className="absolute inset-0 backface-hidden">
          <Card className="h-full flex items-center justify-center p-8">
            <p className="text-xl text-center">{cards[currentIndex].question}</p>
          </Card>
        </div>
        
        {/* Answer Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <Card className="h-full flex flex-col items-center justify-center p-8">
            <p className="text-xl text-center mb-6">{cards[currentIndex].answer}</p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => handleResponse(false)}>
                Need Practice
              </Button>
              <Button variant="primary" onClick={() => handleResponse(true)}>
                Got It!
              </Button>
            </div>
          </Card>
        </div>
      </motion.div>
      
      <div className="mt-6 flex justify-center">
        <Button 
          size="lg" 
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer ? 'Next Card' : 'Show Answer'}
        </Button>
      </div>
    </div>
  );
}
```

## Integration Points

### 1. Chat → Notebook Flow
```typescript
// In ChatMessage component
const handleSaveToNotebook = async (message: ChatMessage) => {
  const { suggestedNotes } = message.thinking;
  
  // Show save dialog with options
  const saveOptions = await showSaveDialog({
    title: suggestedNotes[0].title,
    content: message.content,
    type: suggestedNotes[0].type,
    tags: detectTopicsFromContent(message.content)
  });
  
  if (saveOptions) {
    const entry = await notebookStore.generateFromChat(
      message.id,
      saveOptions.content,
      currentSubject
    );
    
    // Update message to show it's saved
    chatStore.markMessageAsSaved(message.id, entry.id);
  }
};
```

### 2. Notebook → Chat Context
```typescript
// In chat input area
const attachNotebookEntry = (entry: NotebookEntry) => {
  addAttachment({
    type: 'notebook',
    resourceId: entry.id,
    title: entry.title,
    preview: entry.content.substring(0, 200)
  });
  
  // Update AI context
  updateStudyContext({
    recentTopics: [...context.recentTopics, ...entry.tags],
    attachedNotes: [...context.attachedNotes, entry.id]
  });
};
```

### 3. Assignment → Chat Help
```typescript
// In assignment detail page
const getAIHelp = (assignment: Assignment) => {
  // Navigate to chat with assignment attached
  router.push('/chat', {
    attachments: [{
      type: 'assignment',
      resourceId: assignment.id,
      title: assignment.title,
      preview: assignment.description
    }],
    initialMessage: `I need help with "${assignment.title}"`
  });
};
```

## Performance Optimizations

### 1. Lazy Loading
- Load PDF viewer only when needed
- Chunk large notebook entries
- Virtualize long lists of notes

### 2. Caching Strategy
- Cache AI responses for similar questions
- Store processed PDFs locally
- Implement offline notebook access

### 3. Search Optimization
- Index notebook content with Fuse.js
- Pre-compute tag relationships
- Cache search results

## Testing Strategy

### Unit Tests
- AI response parsing
- Notebook CRUD operations
- Attachment processing
- Search functionality

### Integration Tests
- Chat → Notebook flow
- File upload → Processing → Display
- Context attachment → AI response

### E2E Tests
- Complete study session workflow
- PDF annotation and saving
- Study guide generation

## Success Metrics
- Average time to save from chat < 2 seconds
- Search results < 100ms
- PDF annotation smooth at 60fps
- AI response time < 3 seconds with attachments
- Successful OCR rate > 90%

## Next Steps
1. Start with Phase 1: Create type system and AI service structure
2. Build basic chat UI with mocked AI responses
3. Implement notebook save functionality
4. Add attachment system progressively
5. Integrate real AI (Gemini) when core features work
6. Add advanced features (OCR, PDF processing) last