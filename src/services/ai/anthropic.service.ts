import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase';
import type { 
  NotebookEntry, 
  MessageAttachment,
  AIThinking 
} from '@/types';

export interface GenerateNotebookOptions {
  prompt: string;
  subjectId: string;
  type?: 'concept' | 'formula' | 'vocabulary' | 'summary' | 'outline';
  context?: string;
  gradeLevel?: number;
  tags?: string[];
}

export interface ConvertPdfOptions {
  filePath: string;
  saveAsNotebook?: boolean;
  subjectId?: string;
}

export interface ConvertImageOptions {
  filePath: string;
  saveAsNotebook?: boolean;
  subjectId?: string;
}

export interface ChatWithContextOptions {
  message: string;
  attachments?: MessageAttachment[];
  sessionId: string;
}

export interface StudyMaterialsOptions {
  notebookIds: string[];
  type: 'flashcards' | 'quiz' | 'summary' | 'mindmap';
}

class AnthropicService {
  // Cloud function references
  private generateNotebookEntry = httpsCallable<GenerateNotebookOptions, NotebookEntry>(
    functions, 
    'generateNotebookEntry'
  );
  
  private convertPdfToMarkdown = httpsCallable<ConvertPdfOptions, { markdown: string; metadata: any }>(
    functions,
    'convertPdfToMarkdown'
  );
  
  private convertImageToMarkdown = httpsCallable<ConvertImageOptions, { markdown: string; ocrText: string }>(
    functions,
    'convertImageToMarkdown'
  );
  
  private aiChatWithContext = httpsCallable<ChatWithContextOptions, { content: string; metadata: any }>(
    functions,
    'aiChatWithContext'
  );
  
  private createStudyMaterials = httpsCallable<StudyMaterialsOptions, { type: string; content: string; sourceNotebooks: string[] }>(
    functions,
    'createStudyMaterials'
  );

  // Generate a notebook entry using Anthropic
  async generateNotebook(options: GenerateNotebookOptions): Promise<NotebookEntry> {
    try {
      const result = await this.generateNotebookEntry(options);
      return result.data;
    } catch (error) {
      console.error('Error generating notebook entry:', error);
      throw error;
    }
  }

  // Convert PDF to Markdown
  async convertPdf(options: ConvertPdfOptions): Promise<{ markdown: string; metadata: any }> {
    try {
      const result = await this.convertPdfToMarkdown(options);
      return result.data;
    } catch (error) {
      console.error('Error converting PDF:', error);
      throw error;
    }
  }

  // Convert Image to Markdown
  async convertImage(options: ConvertImageOptions): Promise<{ markdown: string; ocrText: string }> {
    try {
      const result = await this.convertImageToMarkdown(options);
      return result.data;
    } catch (error) {
      console.error('Error converting image:', error);
      throw error;
    }
  }

  // Chat with context attachments
  async chatWithContext(options: ChatWithContextOptions): Promise<{ content: string; metadata: any }> {
    try {
      const result = await this.aiChatWithContext(options);
      return result.data;
    } catch (error) {
      console.error('Error in chat with context:', error);
      throw error;
    }
  }

  // Generate study materials from notebooks
  async generateStudyMaterials(options: StudyMaterialsOptions): Promise<any> {
    try {
      const result = await this.createStudyMaterials(options);
      return result.data;
    } catch (error) {
      console.error('Error creating study materials:', error);
      throw error;
    }
  }

  // Generate thinking process for AI responses (client-side)
  async generateThinking(prompt: string): Promise<AIThinking> {
    // This is a simplified version - in production, this could be another cloud function
    const complexity = prompt.length > 100 ? 'complex' : prompt.length > 50 ? 'moderate' : 'simple';
    
    return {
      steps: [
        {
          id: '1',
          type: 'analysis',
          description: 'Understanding the question',
          confidence: 0.9,
          subSteps: ['Parsing the query', 'Identifying key concepts']
        },
        {
          id: '2',
          type: 'reasoning',
          description: 'Identifying key concepts',
          confidence: 0.85,
          subSteps: ['Matching with knowledge base', 'Finding relevant examples']
        },
        {
          id: '3',
          type: 'planning',
          description: 'Formulating response',
          confidence: complexity === 'simple' ? 0.95 : complexity === 'moderate' ? 0.85 : 0.75,
          subSteps: ['Structuring the explanation', 'Adding relevant examples']
        }
      ],
      duration: 1500,
      complexity,
      approach: this.determineApproach(prompt)
    };
  }

  private determineApproach(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('what is')) {
      return 'Conceptual explanation with examples';
    } else if (lowerPrompt.includes('how to') || lowerPrompt.includes('solve')) {
      return 'Step-by-step solution';
    } else if (lowerPrompt.includes('practice') || lowerPrompt.includes('example')) {
      return 'Practice problems with solutions';
    } else if (lowerPrompt.includes('summary') || lowerPrompt.includes('review')) {
      return 'Comprehensive summary';
    }
    
    return 'General educational response';
  }
}

export const anthropicService = new AnthropicService();