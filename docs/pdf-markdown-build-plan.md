# AI Study Assistant & PDF Processing Build Plan - React + Netlify

## Overview
This comprehensive build plan combines PDF-to-Markdown extraction with an AI-powered study assistant. The system features a WYSIWYG markdown editor, intelligent study guide generation, file processing, and personalized learning recommendations - all built on React and Netlify.

## User Requirements Summary

### Editor Features
- **Simple WYSIWYG**: Formatting bar with bold, bullets, basic formatting
- **Advanced Content**: Math formulas (LaTeX), code blocks, mermaid diagrams, tables
- **Study Focus**: Explanations, practical guides with metaphors and relatable examples

### Processing Preferences  
- **Accuracy over Privacy**: Server-side APIs for best results
- **Text Types**: Printed text priority, handwriting support later
- **File Formats**: PDFs, study materials, documents

### AI Features
- **Adaptive Learning**: Update learning profile automatically
- **Proactive Suggestions**: Related topics and notebook entries during chats
- **Study Materials**: Outlines, summaries, practice questions, mind maps
- **Interface**: Suggested reply buttons for every chat message

### Integration Requirements
- **No Sharing**: Individual use, no classmate collaboration
- **Offline Support**: Desired but can wait
- **Privacy**: No data privacy concerns
- **Immediate Value**: PDF parsing, custom study guides, proactive suggestions

## Architecture

## Architecture

### Frontend (React)
- **AI Chat Interface**: Conversational study assistant with suggested replies
- **WYSIWYG Editor**: Rich markdown editor with LaTeX, code blocks, diagrams
- **PDF Upload & Processing**: Drag-and-drop with real-time progress tracking  
- **Notebook Management**: Create, organize, and search study notebooks
- **Learning Dashboard**: Track progress and view personalized recommendations

### Backend (Netlify Functions)
- **Chat AI Handler**: Process conversations and generate study content
- **PDF Processor**: Extract and convert PDFs to structured markdown
- **Learning Profile**: Track concepts, adapt to student needs
- **Content Suggestions**: Analyze context and recommend related topics
- **Study Guide Generator**: Create summaries, flashcards, practice questions

### Storage & Data
- **IndexedDB (Dexie)**: Local storage for notebooks, chat history, learning profile
- **Netlify Blobs**: Store uploaded files and processed content
- **Real-time Sync**: Background sync for cloud backup and cross-device access

### AI Integration
- **Conversation AI**: OpenAI GPT-4 for chat and content generation
- **PDF Processing**: GPT-4 Vision for document extraction and understanding
- **Content Analysis**: Automatic concept extraction and difficulty assessment

## Implementation Plan

### Phase 1: Project Setup & Infrastructure

#### 1.1 Initialize React Project
```bash
npx create-react-app pdf-markdown-rag --template typescript
cd pdf-markdown-rag
npm install
```

#### 1.2 Install Dependencies
```bash
# Core dependencies
npm install @netlify/functions @netlify/blobs
npm install pdf-lib pdfjs-dist
npm install react-dropzone react-markdown
npm install lucide-react tailwindcss

# Development dependencies
npm install -D @types/node
```

#### 1.3 Configure Netlify
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[[plugins]]
  package = "@netlify/plugin-functions"
```

#### 1.4 Setup Environment Variables
```bash
# .env.local
VITE_OPENAI_API_KEY=your_openai_key
VITE_GEMINI_API_KEY=your_gemini_key
NETLIFY_BLOBS_STORE=pdf-processing
```

### Phase 2: Core Components Development

#### 2.1 PDF Upload Component
```typescript
// src/components/PDFUpload.tsx
interface PDFUploadProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

export const PDFUpload: React.FC<PDFUploadProps>
```

#### 2.2 Processing Status Component
```typescript
// src/components/ProcessingStatus.tsx
interface ProcessingStatusProps {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  currentPage?: number;
  totalPages?: number;
}
```

#### 2.3 Markdown Preview Component
```typescript
// src/components/MarkdownPreview.tsx
interface MarkdownPreviewProps {
  content: string;
  onDownload: () => void;
}
```

### Phase 3: Netlify Functions Implementation

#### 3.1 PDF Upload Handler
```typescript
// netlify/functions/upload-pdf.mts
import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  const store = getStore("pdf-processing");
  
  // Handle PDF upload
  // Extract page count
  // Initialize processing job
  // Return job ID and page count
}

export const config: Config = {
  path: "/api/upload-pdf"
};
```

#### 3.2 Page Processing Function
```typescript
// netlify/functions/process-page.mts
import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  // Extract page as image
  // Send to AI model (OpenAI GPT-4V or Google Gemini)
  // Process markdown response
  // Store result in Netlify Blobs
  // Check if all pages completed
}

export const config: Config = {
  path: "/api/process-page"
};
```

#### 3.3 Status Tracking Function
```typescript
// netlify/functions/job-status.mts
export default async (req: Request, context: Context) => {
  // Check processing status
  // Return progress information
  // Handle job completion
}

export const config: Config = {
  path: "/api/job-status"
};
```

#### 3.4 Background Processing Function
```typescript
// netlify/functions/process-pdf-background.mts
export default async (req: Request, context: Context) => {
  // Coordinate page processing
  // Handle parallel execution
  // Aggregate final results
}
```

### Phase 4: AI Integration

#### 4.1 OpenAI Integration
```typescript
// src/lib/openai.ts
export const extractMarkdownFromImage = async (
  imageBase64: string
): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Netlify.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-4-vision-preview",
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all text from this PDF page image and convert it to Markdown. Follow the reading order humans would use, preserve formatting like headers, lists, and tables."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${imageBase64}`
            }
          }
        ]
      }],
      max_tokens: 4000
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
};
```

#### 4.2 PDF Processing Utilities
```typescript
// src/lib/pdf-utils.ts
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

export const extractPageAsImage = async (
  pdfBytes: Uint8Array,
  pageNumber: number
): Promise<string> => {
  // Load PDF
  const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
  const page = await pdf.getPage(pageNumber + 1);
  
  // Render to canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const viewport = page.getViewport({ scale: 2.0 });
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;
  
  // Convert to base64
  return canvas.toDataURL('image/png').split(',')[1];
};

export const getPdfPageCount = async (pdfBytes: Uint8Array): Promise<number> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  return pdfDoc.getPageCount();
};
```

### Phase 5: State Management & API Integration

#### 5.1 Processing State Hook
```typescript
// src/hooks/useProcessing.ts
export const useProcessing = () => {
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  
  const uploadPdf = async (file: File) => {
    // Upload PDF and start processing
  };
  
  const getJobStatus = async (jobId: string) => {
    // Check processing status
  };
  
  const downloadMarkdown = async (jobId: string) => {
    // Download processed markdown
  };
  
  return { jobs, uploadPdf, getJobStatus, downloadMarkdown };
};
```

#### 5.2 API Client
```typescript
// src/lib/api.ts
export class ApiClient {
  async uploadPdf(file: File): Promise<{ jobId: string; pageCount: number }> {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await fetch('/api/upload-pdf', {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }
  
  async getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await fetch(`/api/job-status?jobId=${jobId}`);
    return response.json();
  }
  
  async downloadMarkdown(jobId: string): Promise<string> {
    const response = await fetch(`/api/download-markdown?jobId=${jobId}`);
    return response.text();
  }
}
```

### Phase 6: UI/UX Implementation

#### 6.1 Main Application Layout
```typescript
// src/App.tsx
export const App: React.FC = () => {
  const { jobs, uploadPdf, getJobStatus } = useProcessing();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <PDFUpload onUpload={uploadPdf} />
        <ProcessingJobs jobs={jobs} onStatusCheck={getJobStatus} />
      </main>
    </div>
  );
};
```

#### 6.2 Responsive Design with Tailwind
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .upload-zone {
    @apply border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors;
  }
  
  .processing-card {
    @apply bg-white rounded-lg shadow-md p-6 mb-4;
  }
}
```

### Phase 7: Error Handling & Optimization

#### 7.1 Error Boundaries
```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  // Handle errors gracefully
  // Show user-friendly error messages
  // Provide recovery options
}
```

#### 7.2 Performance Optimizations
- Implement chunked uploads for large PDFs
- Add compression for image data
- Use Web Workers for PDF processing
- Implement caching strategies

#### 7.3 Retry Logic
```typescript
// src/lib/retry.ts
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> => {
  // Implement exponential backoff
  // Handle transient failures
  // Log retry attempts
};
```

### Phase 8: Testing & Deployment

#### 8.1 Unit Tests
```typescript
// src/__tests__/pdf-utils.test.ts
describe('PDF Processing Utils', () => {
  test('should extract page count correctly', async () => {
    // Test PDF parsing
  });
  
  test('should convert page to image', async () => {
    // Test image extraction
  });
});
```

#### 8.2 Integration Tests
```typescript
// src/__tests__/api.test.ts
describe('API Integration', () => {
  test('should upload PDF successfully', async () => {
    // Test upload flow
  });
  
  test('should process pages in parallel', async () => {
    // Test processing pipeline
  });
});
```

#### 8.3 Deployment Configuration
```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: nwtgck/actions-netlify@v2.0
```

## Technical Considerations

### Security
- Validate file types and sizes
- Sanitize user inputs
- Implement rate limiting
- Secure API keys in environment variables

### Scalability
- Use Netlify Blobs for file storage
- Implement job queuing for high loads
- Add horizontal scaling for functions
- Monitor resource usage

### Cost Optimization
- Optimize AI API calls
- Implement caching strategies
- Use efficient image compression
- Monitor function execution times

## Success Metrics
- Upload success rate > 95%
- Processing time < 30 seconds per page
- Markdown quality score > 90%
- User satisfaction > 4.5/5

## Timeline
- **Week 1-2**: Project setup and core infrastructure
- **Week 3-4**: PDF processing and AI integration
- **Week 5-6**: UI/UX development and testing
- **Week 7-8**: Optimization and deployment

This build plan provides a comprehensive roadmap for implementing the PDF-to-Markdown extraction system using React and Netlify, maintaining the parallel processing benefits of the original Google Cloud approach while adapting to the Netlify ecosystem.