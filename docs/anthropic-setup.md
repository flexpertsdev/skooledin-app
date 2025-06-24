# Anthropic Setup Guide

The SkooledIn app is configured to use Anthropic's Claude API through Firebase Cloud Functions.

## Setup Steps

### 1. Get Anthropic API Key
1. Sign up at https://console.anthropic.com
2. Generate an API key from the dashboard
3. Keep this key secure - you'll need it for the next step

### 2. Configure Firebase Functions
```bash
# Set your Anthropic API key in Firebase config
firebase functions:config:set anthropic.api_key="your-anthropic-api-key-here"

# Deploy the functions
firebase deploy --only functions
```

### 3. Verify Setup
The chat feature should now connect to Anthropic's Claude API when users send messages.

## How It Works

1. **User sends message** → Stored locally via Zustand
2. **App calls Firebase Cloud Function** → `aiChatWithContext`
3. **Cloud Function calls Anthropic API** → Uses Claude to generate response
4. **Response sent back to app** → Displayed in chat UI

## Alternative: Netlify Edge Functions

If you prefer to use Netlify instead of Firebase, you can create edge functions:

1. Create `/netlify/functions/chat.js`
2. Add your Anthropic API key to Netlify environment variables
3. Update `anthropicService` to call Netlify functions instead

## Current Implementation

- Chat messages are stored locally (Zustand + localStorage)
- AI responses come from Firebase Cloud Functions
- The mock AI service is no longer used
- Firebase Firestore can optionally store chat history (the function already saves messages)

## Troubleshooting

If AI responses aren't working:
1. Check browser console for errors
2. Verify Firebase functions are deployed: `firebase functions:list`
3. Check function logs: `firebase functions:log`
4. Ensure Anthropic API key is set correctly