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
    const { message, attachments, sessionId, recentMessages = [] } = JSON.parse(event.body || '{}');

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

    // Extract context from message if present
    let userMessage = message;
    let subjectContext = '';
    
    const contextMatch = message.match(/^\[Context: (.+?) - (.+?)\]\n(.+)$/s);
    if (contextMatch) {
      const [, contextName, contextType, actualMessage] = contextMatch;
      subjectContext = `\n\nCurrent subject context: ${contextName} (${contextType})`;
      userMessage = actualMessage;
    }
    
    // Build conversation history
    let conversationContext = '';
    if (recentMessages && recentMessages.length > 0) {
      conversationContext = '\n\nRecent conversation:\n';
      recentMessages.slice(-5).forEach((msg: any) => {
        conversationContext += `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}\n`;
      });
    }
    
    // Create system prompt
    const systemPrompt = `You are an AI tutor helping students learn. You should:
- Be encouraging and supportive
- Break down complex concepts into simple steps
- Use examples and analogies when helpful
- Ask clarifying questions when needed
- Guide students to find answers rather than just giving them directly${subjectContext}${contextData}${conversationContext}
${subjectContext ? `\nImportant: The student is currently studying ${subjectContext.split(': ')[1]}. Tailor your responses to be relevant to this subject.` : ''}
${conversationContext ? '\nBuild upon the conversation above and maintain continuity.' : ''}`;

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Using Haiku for faster, cheaper responses
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
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
        complexity: userMessage.length > 100 ? 'complex' : userMessage.length > 50 ? 'moderate' : 'simple',
        approach: subjectContext ? `${contextName} tutoring` : 'General educational response',
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