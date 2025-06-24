import type { StudyGuideRequest } from '@stores/notebook.store.dexie';

interface StudyGuideResponse {
  content: string;
  metadata: {
    type: string;
    depth: string;
    gradeLevel?: number;
    wordCount: number;
    estimatedReadTime: number;
    includesExamples: boolean;
    generatedAt: string;
  };
}

export class StudyGuideService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.DEV 
      ? 'http://localhost:8888/.netlify/functions'
      : '/.netlify/functions';
  }

  async generateStudyGuide(request: StudyGuideRequest & { context?: string }): Promise<StudyGuideResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-study-guide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate study guide');
      }

      return await response.json();
    } catch (error) {
      console.error('Study guide generation error:', error);
      throw error;
    }
  }

  async generateFromChatMessages(
    messages: Array<{ role: string; content: string }>,
    request: Omit<StudyGuideRequest, 'context'>
  ): Promise<StudyGuideResponse> {
    // Extract key topics and questions from chat messages
    const context = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n\n');

    return this.generateStudyGuide({
      ...request,
      context,
    });
  }

  // Generate multiple study materials at once
  async generateComprehensiveStudySet(
    topic: string,
    subjectId: string,
    gradeLevel: number = 10
  ): Promise<Record<string, StudyGuideResponse>> {
    const types: Array<StudyGuideRequest['type']> = [
      'outline',
      'summary',
      'flashcards',
      'practice_questions'
    ];

    const promises = types.map(type =>
      this.generateStudyGuide({
        topic,
        type,
        subjectId,
        gradeLevel,
        depth: 'intermediate',
        includeExamples: true,
      })
    );

    const results = await Promise.allSettled(promises);
    const studySet: Record<string, StudyGuideResponse> = {};

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        studySet[types[index]] = result.value;
      }
    });

    return studySet;
  }
}

export const studyGuideService = new StudyGuideService();