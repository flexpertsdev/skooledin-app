interface SuggestionContext {
  recentMessages?: Array<{ role: string; content: string }>;
  currentTopic?: string;
  studyHistory?: Array<{ topic: string; date: Date }>;
  userLevel?: string;
}

interface AISuggestion {
  id: string;
  type: 'topic' | 'question' | 'clarification' | 'resource' | 'practice';
  title: string;
  description: string;
  action?: {
    type: 'create-note' | 'generate-guide' | 'ask-question' | 'view-resource';
    data?: any;
  };
  priority: 'high' | 'medium' | 'low';
  context: string;
}

export class AISuggestionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.DEV 
      ? 'http://localhost:8888/.netlify/functions'
      : '/.netlify/functions';
  }

  /**
   * Generate AI suggestions based on context
   */
  async getSuggestions(context: SuggestionContext): Promise<AISuggestion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }

      const data = await response.json();
      return data.suggestions;
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      // Return fallback suggestions
      return this.getFallbackSuggestions(context);
    }
  }

  /**
   * Get fallback suggestions when AI is unavailable
   */
  private getFallbackSuggestions(context: SuggestionContext): AISuggestion[] {
    const suggestions: AISuggestion[] = [];

    if (context.currentTopic) {
      suggestions.push({
        id: '1',
        type: 'topic',
        title: `Create study guide for ${context.currentTopic}`,
        description: 'Generate a comprehensive study guide for better understanding',
        action: {
          type: 'generate-guide',
          data: { topic: context.currentTopic }
        },
        priority: 'high',
        context: 'Based on your current topic'
      });
    }

    suggestions.push({
      id: '2',
      type: 'practice',
      title: 'Practice with flashcards',
      description: 'Review key concepts with interactive flashcards',
      action: {
        type: 'create-note',
        data: { type: 'flashcard' }
      },
      priority: 'medium',
      context: 'Regular practice improves retention'
    });

    return suggestions;
  }

  /**
   * Analyze chat conversation for proactive suggestions
   */
  async analyzeConversation(messages: Array<{ role: string; content: string }>): Promise<AISuggestion[]> {
    // Extract key topics and concepts from the conversation
    const topics = this.extractTopics(messages);

    const context: SuggestionContext = {
      recentMessages: messages.slice(-5), // Last 5 messages
      currentTopic: topics[0],
    };

    return this.getSuggestions(context);
  }

  /**
   * Extract topics from messages
   */
  private extractTopics(messages: Array<{ role: string; content: string }>): string[] {
    // Simple implementation - in production, use NLP
    const topics: string[] = [];
    const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'over']);

    messages.forEach(msg => {
      const words = msg.content.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 4 && !commonWords.has(word)) {
          topics.push(word);
        }
      });
    });

    return [...new Set(topics)].slice(0, 5);
  }

}

export const aiSuggestionService = new AISuggestionService();