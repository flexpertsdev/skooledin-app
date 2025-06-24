import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface ProcessPDFRequest {
  images: string[]; // Base64 encoded PDF page images
  mode: 'extract' | 'summarize' | 'study-guide';
  options?: {
    language?: string;
    preserveFormatting?: boolean;
    includePageNumbers?: boolean;
  };
}

const getSystemPrompt = (mode: string) => {
  const prompts = {
    extract: `You are an expert at extracting text from PDF images. 
Extract all text content accurately, preserving structure and formatting.
Use markdown formatting to represent headings, lists, tables, and emphasis.
If you encounter mathematical formulas, convert them to LaTeX notation.
For diagrams or images, provide a brief description in [brackets].`,
    
    summarize: `You are an expert at summarizing academic content.
Create a concise summary that captures the main ideas and key points.
Organize the summary with clear sections and bullet points.
Highlight important concepts, definitions, and conclusions.`,
    
    'study-guide': `You are an expert educator creating study materials.
Convert the PDF content into a comprehensive study guide.
Include:
- Key concepts and definitions
- Main topics with explanations
- Important formulas or equations
- Summary points for each section
- Potential exam questions`
  };

  return prompts[mode] || prompts.extract;
};

const processPageImages = async (
  images: string[],
  mode: string,
  options: ProcessPDFRequest['options'] = {}
) => {
  const systemPrompt = getSystemPrompt(mode);
  const results: string[] = [];

  // Process pages in batches to avoid timeout
  const batchSize = 3;
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    const batchPromises = batch.map(async (image, index) => {
      const pageNumber = i + index + 1;
      
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: options.includePageNumbers 
                    ? `Process page ${pageNumber} of the PDF:`
                    : 'Process this PDF page:'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${image}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 4096,
          temperature: 0.3
        });

        const content = response.choices[0]?.message?.content || '';
        return options.includePageNumbers 
          ? `## Page ${pageNumber}\n\n${content}`
          : content;
      } catch (error) {
        console.error(`Error processing page ${pageNumber}:`, error);
        return `[Error processing page ${pageNumber}]`;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
};

const combineResults = (results: string[], mode: string) => {
  if (mode === 'extract') {
    return results.join('\n\n---\n\n');
  }
  
  // For summarize and study-guide modes, combine all content first
  const combinedContent = results.join('\n\n');
  
  if (mode === 'summarize') {
    return `# Document Summary\n\n${combinedContent}`;
  }
  
  if (mode === 'study-guide') {
    return `# Study Guide\n\n${combinedContent}`;
  }
  
  return combinedContent;
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
    const request: ProcessPDFRequest = JSON.parse(event.body || '{}');
    
    if (!request.images || request.images.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No images provided' }),
      };
    }

    if (request.images.length > 20) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Maximum 20 pages allowed' }),
      };
    }

    const mode = request.mode || 'extract';
    
    // Process all page images
    const results = await processPageImages(request.images, mode, request.options);
    
    // Combine results based on mode
    const content = combineResults(results, mode);
    
    // Calculate metadata
    const wordCount = content.split(/\s+/).length;
    const pageCount = request.images.length;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        content,
        metadata: {
          mode,
          pageCount,
          wordCount,
          processedAt: new Date().toISOString()
        }
      }),
    };
  } catch (error) {
    console.error('PDF processing error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to process PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};