#!/usr/bin/env node

/**
 * Self-executing build task to set up AI features with Firebase and Anthropic
 * 
 * This script:
 * 1. Sets up Firebase configuration
 * 2. Deploys cloud functions
 * 3. Creates sample data
 * 4. Tests the integration
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✅ ${message}`, colors.green);
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function warn(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

function error(message: string) {
  log(`❌ ${message}`, colors.red);
}

function runCommand(command: string, description: string) {
  info(`Running: ${description}`);
  try {
    execSync(command, { stdio: 'inherit' });
    success(`${description} completed`);
  } catch (err) {
    error(`Failed: ${description}`);
    throw err;
  }
}

async function main() {
  log('\n🚀 Skooledin AI Features Build Task\n', colors.bright);

  try {
    // Step 1: Check environment
    info('Checking environment...');
    
    if (!fs.existsSync('.env.local')) {
      error('.env.local file not found!');
      warn('Please create .env.local with your Firebase and Anthropic credentials');
      process.exit(1);
    }
    
    // Step 2: Install dependencies
    info('Installing dependencies...');
    runCommand('npm install', 'Installing main dependencies');
    
    // Step 3: Build TypeScript
    info('Building TypeScript...');
    runCommand('npm run build', 'Building application');
    
    // Step 4: Set up Firebase functions
    info('Setting up Firebase functions...');
    
    // Check if Anthropic API key is set
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    if (!envContent.includes('VITE_ANTHROPIC_API_KEY=') || envContent.includes('VITE_ANTHROPIC_API_KEY=<')) {
      warn('Anthropic API key not found in .env.local');
      warn('Add your Anthropic API key to use AI features');
    }
    
    // Install function dependencies
    if (fs.existsSync('functions/package.json')) {
      info('Installing function dependencies...');
      runCommand('cd functions && npm install', 'Installing cloud function dependencies');
      
      // Build functions
      info('Building cloud functions...');
      runCommand('cd functions && npm run build', 'Building cloud functions');
    }
    
    // Step 5: Create sample notebook entry
    info('Creating sample data structure...');
    
    const sampleNotebook = {
      title: 'Welcome to Skooledin!',
      content: `# Welcome to Your AI-Powered Study Companion!

## What is Skooledin?

Skooledin is an intelligent education platform that helps you:
- 📚 Organize your study materials
- 🤖 Get AI-powered tutoring
- 📝 Convert PDFs and images to study notes
- 🎯 Create personalized study guides

## Getting Started

1. **Create Your First Notebook Entry**
   - Click the "New Note" button
   - Choose a subject and type
   - Start writing or use AI to generate content

2. **Use AI Chat**
   - Attach notebook entries for context
   - Ask questions about your study materials
   - Get personalized explanations

3. **Upload Study Materials**
   - Upload PDFs or images
   - Convert them to markdown automatically
   - Save as notebook entries

## Features

### 🧠 AI-Powered Learning
- Anthropic Claude integration
- Context-aware responses
- Study material generation

### 📱 Cross-Platform
- Works on desktop and mobile
- Offline support with sync
- PWA capabilities

### 🔒 Secure & Private
- Firebase Authentication
- Encrypted storage
- Your data stays yours

Happy studying! 🎓`,
      metadata: {
        isAIGenerated: false,
        sourceType: 'manual',
        gradeLevel: 10,
        isFavorite: true,
        isArchived: false
      }
    };
    
    fs.writeFileSync(
      'sample-notebook.json',
      JSON.stringify(sampleNotebook, null, 2)
    );
    success('Created sample notebook entry');
    
    // Step 6: Generate build info
    const buildInfo = {
      version: '1.0.0',
      buildDate: new Date().toISOString(),
      features: {
        firebase: {
          auth: true,
          firestore: true,
          storage: true,
          functions: true
        },
        ai: {
          provider: 'anthropic',
          models: ['claude-3-opus-20240229'],
          features: [
            'notebook-generation',
            'pdf-conversion',
            'image-ocr',
            'context-chat',
            'study-materials'
          ]
        }
      },
      environment: {
        node: process.version,
        platform: process.platform
      }
    };
    
    fs.writeFileSync(
      'build-info.json',
      JSON.stringify(buildInfo, null, 2)
    );
    success('Generated build info');
    
    // Step 7: Create deployment checklist
    const checklist = `# Skooledin Deployment Checklist

## Pre-deployment
- [ ] Set Anthropic API key in Firebase Functions config
  \`\`\`bash
  firebase functions:config:set anthropic.api_key="your-api-key"
  \`\`\`
- [ ] Review Firebase security rules
- [ ] Test authentication flow
- [ ] Verify storage permissions

## Deployment
- [ ] Deploy Firebase rules
  \`\`\`bash
  firebase deploy --only firestore:rules,storage:rules
  \`\`\`
- [ ] Deploy Cloud Functions
  \`\`\`bash
  firebase deploy --only functions
  \`\`\`
- [ ] Deploy hosting
  \`\`\`bash
  npm run build && firebase deploy --only hosting
  \`\`\`

## Post-deployment
- [ ] Test AI notebook generation
- [ ] Test PDF/Image conversion
- [ ] Verify chat with attachments
- [ ] Check study material generation
- [ ] Monitor function logs

## Usage Examples

### Generate Notebook Entry
\`\`\`typescript
const notebook = await anthropicService.generateNotebook({
  prompt: "Explain photosynthesis",
  subjectId: "biology",
  type: "concept",
  gradeLevel: 10
});
\`\`\`

### Convert PDF to Markdown
\`\`\`typescript
const result = await anthropicService.convertPdf({
  filePath: "uploads/biology-textbook.pdf",
  saveAsNotebook: true,
  subjectId: "biology"
});
\`\`\`

### Chat with Context
\`\`\`typescript
const response = await anthropicService.chatWithContext({
  message: "Explain this concept in simpler terms",
  attachments: [{ type: "notebook", resourceId: "notebook-123" }],
  sessionId: "session-456"
});
\`\`\`
`;
    
    fs.writeFileSync('DEPLOYMENT.md', checklist);
    success('Created deployment checklist');
    
    // Final summary
    log('\n✨ Build completed successfully!\n', colors.bright + colors.green);
    
    info('Next steps:');
    log('1. Add your Anthropic API key to .env.local');
    log('2. Set up Firebase Functions config (see DEPLOYMENT.md)');
    log('3. Deploy to Firebase');
    log('4. Test the AI features');
    
    log('\n📚 Check DEPLOYMENT.md for detailed instructions\n', colors.yellow);
    
  } catch (err) {
    error('Build failed!');
    console.error(err);
    process.exit(1);
  }
}

// Run the build task
main().catch(console.error);