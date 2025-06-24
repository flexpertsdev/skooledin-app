import { Handler } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface StudyGuideRequest {
  topic: string;
  type: 'outline' | 'flashcards' | 'summary' | 'practice_questions' | 'mind_map';
  gradeLevel?: number;
  depth: 'basic' | 'intermediate' | 'advanced';
  includeExamples?: boolean;
  subjectId: string;
  context?: string; // Additional context from chat messages
}

const getSystemPrompt = (type: string, gradeLevel: number = 10) => {
  const basePrompt = `You are an expert educator creating study materials for a grade ${gradeLevel} student. 
Your responses should be clear, well-structured, and appropriate for the student's level.
Use markdown formatting for better readability.`;

  const typePrompts = {
    outline: `Create a comprehensive study outline with main topics and subtopics. 
Include key concepts, definitions, and learning objectives.
Structure it hierarchically with proper numbering.`,
    
    flashcards: `Create flashcards in a question-answer format.
Each flashcard should test one specific concept.
Include at least 10-15 flashcards covering the main concepts.
Format: **Q:** [Question] **A:** [Answer]`,
    
    summary: `Write a comprehensive summary that covers all main points.
Include key definitions, important relationships, and core concepts.
Use bullet points and sections for clarity.`,
    
    practice_questions: `Create practice questions with answers and explanations.
Include various question types: multiple choice, short answer, and problem-solving.
Provide detailed solutions showing the thinking process.`,
    
    mind_map: `Create a text-based mind map structure showing relationships between concepts.
Use indentation and symbols to show hierarchy and connections.
Include main topic at center with branches for subtopics.`
  };

  return `${basePrompt}\n\n${typePrompts[type as keyof typeof typePrompts] || typePrompts.summary}`;
};

const formatStudyGuide = (content: string, type: string, topic: string) => {
  const headers = {
    outline: `# Study Outline: ${topic}`,
    flashcards: `# Flashcards: ${topic}`,
    summary: `# Study Summary: ${topic}`,
    practice_questions: `# Practice Questions: ${topic}`,
    mind_map: `# Concept Map: ${topic}`
  };

  return `${headers[type as keyof typeof headers] || `# ${topic}`}

${content}

---
*Generated on ${new Date().toLocaleDateString()}*`;
};

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const request: StudyGuideRequest = JSON.parse(event.body || '{}');
    
    if (!request.topic || !request.type || !request.depth) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const systemPrompt = getSystemPrompt(request.type, request.gradeLevel);
    
    let userPrompt = `Create a ${request.depth} level ${request.type} for the topic: "${request.topic}"`;
    
    if (request.includeExamples) {
      userPrompt += '\nInclude relevant examples to illustrate concepts.';
    }
    
    if (request.context) {
      userPrompt += `\n\nAdditional context from our discussion:\n${request.context}`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    const formattedContent = formatStudyGuide(content.text, request.type, request.topic);
    
    // Calculate metadata
    const wordCount = formattedContent.split(/\s+/).length;
    const estimatedReadTime = Math.ceil(wordCount / 200); // 200 words per minute
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        content: formattedContent,
        metadata: {
          type: request.type,
          depth: request.depth,
          gradeLevel: request.gradeLevel,
          wordCount,
          estimatedReadTime,
          includesExamples: request.includeExamples || false,
          generatedAt: new Date().toISOString()
        }
      }),
    };
  } catch (error) {
    console.error('Study guide generation error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate study guide',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};