import { Handler } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface SuggestionContext {
  recentMessages?: Array<{ role: string; content: string }>;
  currentTopic?: string;
  studyHistory?: Array<{ topic: string; date: Date }>;
  userLevel?: string;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const context: SuggestionContext = JSON.parse(event.body || '{}');

    // Build context for AI
    let contextText = '';
    
    if (context.recentMessages?.length) {
      contextText += 'Recent conversation:\n';
      context.recentMessages.forEach(msg => {
        contextText += `${msg.role}: ${msg.content.slice(0, 200)}...\n`;
      });
    }

    if (context.currentTopic) {
      contextText += `\nCurrent topic: ${context.currentTopic}\n`;
    }

    if (context.studyHistory?.length) {
      contextText += '\nRecent study topics:\n';
      context.studyHistory.forEach(item => {
        contextText += `- ${item.topic}\n`;
      });
    }

    const systemPrompt = `You are an AI learning assistant that provides proactive suggestions to help students learn more effectively. 

Generate 3-5 specific, actionable suggestions based on the provided context. Each suggestion should:
1. Be relevant to the student's current learning context
2. Offer a clear action they can take
3. Help deepen understanding or improve retention

Return suggestions in this JSON format:
{
  "suggestions": [
    {
      "id": "unique-id",
      "type": "topic" | "question" | "clarification" | "resource" | "practice",
      "title": "Short action title",
      "description": "Detailed description of the suggestion",
      "action": {
        "type": "create-note" | "generate-guide" | "ask-question" | "view-resource",
        "data": {}
      },
      "priority": "high" | "medium" | "low",
      "context": "Why this suggestion is relevant"
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Based on this learning context, provide proactive suggestions:\n\n${contextText}`
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse the AI response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const suggestions = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(suggestions),
    };
  } catch (error) {
    console.error('Suggestion generation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to generate suggestions',
        suggestions: [] // Return empty array as fallback
      }),
    };
  }
};