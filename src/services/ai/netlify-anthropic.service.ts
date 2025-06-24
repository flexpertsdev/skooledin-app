import type { AIThinking } from '@/types';
import type { ChatWithContextOptions } from './anthropic.service';

class NetlifyAnthropicService {
  private baseUrl: string;

  constructor() {
    // In development, Netlify CLI runs functions on port 8888
    this.baseUrl = import.meta.env.DEV 
      ? 'http://localhost:8888/.netlify/functions'
      : '/.netlify/functions';
  }

  // Chat with context using Netlify function
  async chatWithContext(options: ChatWithContextOptions): Promise<{ content: string; metadata: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: options.message,
          attachments: options.attachments,
          sessionId: options.sessionId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get AI response');
      }

      const data = await response.json();
      return {
        content: data.content,
        metadata: data.metadata,
      };
    } catch (error) {
      console.error('Error calling Netlify function:', error);
      throw error;
    }
  }

  // Generate thinking process (client-side for now)
  async generateThinking(prompt: string): Promise<AIThinking> {
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

export const netlifyAnthropicService = new NetlifyAnthropicService();