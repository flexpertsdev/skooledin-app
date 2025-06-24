# Netlify + Anthropic Setup Guide

This guide explains how to set up Anthropic Claude API with Netlify Functions.

## Prerequisites

1. Netlify CLI installed: `npm install -g netlify-cli`
2. Anthropic API key from https://console.anthropic.com

## Setup Steps

### 1. Install Dependencies
```bash
npm install @anthropic-ai/sdk @netlify/functions
```

### 2. Set Environment Variable

#### Option A: Using Netlify CLI (Recommended)
```bash
# Login to Netlify
netlify login

# Link your site
netlify link

# Set the environment variable
netlify env:set ANTHROPIC_API_KEY "your-anthropic-api-key"
```

#### Option B: Using Netlify Dashboard
1. Go to your site in Netlify dashboard
2. Navigate to Site Configuration → Environment Variables
3. Add `ANTHROPIC_API_KEY` with your API key

### 3. Test Locally
```bash
# Start Netlify dev server
netlify dev

# The app will run on http://localhost:8888
# Functions will be available at http://localhost:8888/.netlify/functions/
```

### 4. Deploy
```bash
# Deploy to Netlify
netlify deploy --prod
```

## How It Works

1. **Frontend sends request** → POST to `/.netlify/functions/chat`
2. **Netlify Function receives request** → Validates and processes
3. **Function calls Anthropic API** → Using Claude Haiku for fast responses
4. **Response sent back** → Displayed in chat UI

## File Structure

```
netlify/
  functions/
    chat.ts         # Netlify function that calls Anthropic

src/services/ai/
  netlify-anthropic.service.ts  # Service that calls Netlify function
  anthropic.service.ts          # Alternative: Firebase implementation
```

## Switching Between Implementations

In `src/pages/chat/ChatPage.tsx`:

```typescript
// For Netlify Functions (current):
import { netlifyAnthropicService as anthropicService } from '@/services/ai/netlify-anthropic.service';

// For Firebase Functions:
// import { anthropicService } from '@/services/ai/anthropic.service';
```

## Environment Variables

- `ANTHROPIC_API_KEY` - Your Anthropic API key (required)
- Set via Netlify CLI or dashboard
- Never commit API keys to git

## Cost Optimization

The implementation uses Claude 3 Haiku model which is:
- Faster (lower latency)
- Cheaper per token
- Still very capable for educational content

To use a different model, update in `netlify/functions/chat.ts`:
- `claude-3-haiku-20240307` (current - fast & cheap)
- `claude-3-sonnet-20240229` (balanced)
- `claude-3-opus-20240229` (most capable)

## Troubleshooting

1. **"Failed to get AI response"**
   - Check if `ANTHROPIC_API_KEY` is set
   - Verify API key is valid
   - Check Netlify function logs: `netlify functions:log`

2. **CORS errors**
   - The function includes CORS headers
   - If still having issues, check browser console

3. **Local development issues**
   - Make sure to use `netlify dev` not just `npm run dev`
   - This ensures functions are available locally

## Firebase MCP Alternative

If you want to use Firebase MCP instead:

1. Use Firebase CLI to set config:
   ```bash
   firebase functions:config:set anthropic.api_key="your-key"
   firebase deploy --only functions
   ```

2. Switch import in ChatPage.tsx to use Firebase service

Both implementations work - choose based on your deployment preference!