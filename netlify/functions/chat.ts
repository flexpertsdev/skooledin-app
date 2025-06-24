import { Handler } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';

export const handler: Handler = async (event) => {
  // Check if API key is available
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set in environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Configuration error',
        details: 'Anthropic API key is not configured. Please set ANTHROPIC_API_KEY environment variable.'
      }),
    };
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { message, attachments, sessionId } = JSON.parse(event.body || '{}');

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' }),
      };
    }

    // Build context from attachments
    let contextData = '';
    if (attachments && attachments.length > 0) {
      contextData = '\n\nContext from attachments:\n';
      attachments.forEach((attachment: any) => {
        if (attachment.type === 'notebook') {
          contextData += `\nNotebook: ${attachment.title}\n`;
        }
      });
    }

    // Create system prompt
    const systemPrompt = `You are an AI tutor helping students learn. You should:
- Be encouraging and supportive
- Break down complex concepts into simple steps
- Use examples and analogies when helpful
- Ask clarifying questions when needed
- Guide students to find answers rather than just giving them directly${contextData}`;

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Using Haiku for faster, cheaper responses
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    // Create response metadata
    const metadata = {
      thinking: {
        steps: [
          {
            id: '1',
            type: 'analysis',
            description: 'Understanding the question',
            confidence: 0.9,
            subSteps: ['Parsing the query', 'Identifying key concepts'],
          },
        ],
        duration: Date.now(),
        complexity: message.length > 100 ? 'complex' : 'moderate',
        approach: 'Educational response',
      },
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        content,
        metadata,
        sessionId,
      }),
    };
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get AI response',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};