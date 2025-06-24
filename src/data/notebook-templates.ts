import type { NotebookTemplate } from '@/types';

export const notebookTemplates: Record<string, NotebookTemplate> = {
  studyGuide: {
    id: 'study-guide',
    name: 'Study Guide',
    description: 'Comprehensive study guide for a topic',
    type: 'outline',
    structure: {
      sections: [
        {
          id: '1',
          title: 'Overview',
          prompt: 'Provide a brief overview of the topic',
          type: 'text',
          required: true,
          order: 1
        },
        {
          id: '2',
          title: 'Key Concepts',
          prompt: 'List and explain the main concepts',
          type: 'list',
          required: true,
          order: 2,
          defaultContent: '- Concept 1:\n- Concept 2:\n- Concept 3:'
        },
        {
          id: '3',
          title: 'Important Terms',
          prompt: 'Define key vocabulary and terminology',
          type: 'list',
          required: true,
          order: 3,
          defaultContent: '**Term 1**: Definition\n\n**Term 2**: Definition'
        },
        {
          id: '4',
          title: 'Examples',
          prompt: 'Provide practical examples',
          type: 'text',
          required: false,
          order: 4
        },
        {
          id: '5',
          title: 'Practice Questions',
          prompt: 'Test your understanding',
          type: 'list',
          required: false,
          order: 5,
          defaultContent: '1. Question 1?\n2. Question 2?\n3. Question 3?'
        }
      ]
    },
    tags: ['study', 'review'],
    isPublic: true,
    usageCount: 0,
    authorId: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  lectureNotes: {
    id: 'lecture-notes',
    name: 'Lecture Notes',
    description: 'Template for taking notes during lectures',
    type: 'outline',
    structure: {
      sections: [
        {
          id: '1',
          title: 'Lecture Information',
          prompt: 'Date, topic, and lecturer',
          type: 'text',
          required: true,
          order: 1,
          defaultContent: '**Date**: \n**Topic**: \n**Lecturer**: '
        },
        {
          id: '2',
          title: 'Main Points',
          prompt: 'Key points from the lecture',
          type: 'list',
          required: true,
          order: 2
        },
        {
          id: '3',
          title: 'Details & Examples',
          prompt: 'Supporting details and examples',
          type: 'text',
          required: false,
          order: 3
        },
        {
          id: '4',
          title: 'Questions',
          prompt: 'Questions to follow up on',
          type: 'list',
          required: false,
          order: 4
        },
        {
          id: '5',
          title: 'Action Items',
          prompt: 'Things to do after the lecture',
          type: 'list',
          required: false,
          order: 5,
          defaultContent: '- [ ] Review notes\n- [ ] Complete readings\n- [ ] '
        }
      ]
    },
    tags: ['lecture', 'notes'],
    isPublic: true,
    usageCount: 0,
    authorId: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  practiceProblems: {
    id: 'practice-problems',
    name: 'Practice Problems',
    description: 'Template for working through practice problems',
    type: 'practice',
    structure: {
      sections: [
        {
          id: '1',
          title: 'Problem Statement',
          prompt: 'State the problem clearly',
          type: 'text',
          required: true,
          order: 1
        },
        {
          id: '2',
          title: 'Given Information',
          prompt: 'What information is provided?',
          type: 'list',
          required: true,
          order: 2
        },
        {
          id: '3',
          title: 'Solution Approach',
          prompt: 'How will you solve this?',
          type: 'text',
          required: true,
          order: 3
        },
        {
          id: '4',
          title: 'Step-by-Step Solution',
          prompt: 'Work through the solution',
          type: 'text',
          required: true,
          order: 4,
          defaultContent: '**Step 1**: \n\n**Step 2**: \n\n**Step 3**: '
        },
        {
          id: '5',
          title: 'Answer & Verification',
          prompt: 'Final answer and check',
          type: 'text',
          required: true,
          order: 5
        }
      ]
    },
    tags: ['practice', 'problems'],
    isPublic: true,
    usageCount: 0,
    authorId: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  conceptMap: {
    id: 'concept-map',
    name: 'Concept Map',
    description: 'Visual organization of related concepts',
    type: 'mindmap',
    structure: {
      sections: [
        {
          id: '1',
          title: 'Central Concept',
          prompt: 'What is the main idea?',
          type: 'text',
          required: true,
          order: 1
        },
        {
          id: '2',
          title: 'Main Branches',
          prompt: 'Primary categories or themes',
          type: 'list',
          required: true,
          order: 2,
          defaultContent: '## Branch 1: \n- Sub-concept\n- Sub-concept\n\n## Branch 2: \n- Sub-concept\n- Sub-concept'
        },
        {
          id: '3',
          title: 'Connections',
          prompt: 'How do concepts relate to each other?',
          type: 'text',
          required: false,
          order: 3
        },
        {
          id: '4',
          title: 'Examples',
          prompt: 'Real-world applications',
          type: 'list',
          required: false,
          order: 4
        }
      ]
    },
    tags: ['visual', 'concept'],
    isPublic: true,
    usageCount: 0,
    authorId: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  formula: {
    id: 'formula',
    name: 'Formula Reference',
    description: 'Template for documenting formulas and equations',
    type: 'formula',
    structure: {
      sections: [
        {
          id: '1',
          title: 'Formula Name',
          prompt: 'What is this formula called?',
          type: 'text',
          required: true,
          order: 1
        },
        {
          id: '2',
          title: 'Formula',
          prompt: 'Write the formula using LaTeX',
          type: 'formula',
          required: true,
          order: 2,
          defaultContent: '$$\n\n$$'
        },
        {
          id: '3',
          title: 'Variables',
          prompt: 'Define each variable',
          type: 'list',
          required: true,
          order: 3,
          defaultContent: '- $x$ = \n- $y$ = \n- $z$ = '
        },
        {
          id: '4',
          title: 'When to Use',
          prompt: 'Describe when this formula applies',
          type: 'text',
          required: true,
          order: 4
        },
        {
          id: '5',
          title: 'Example',
          prompt: 'Work through an example',
          type: 'text',
          required: false,
          order: 5
        }
      ]
    },
    tags: ['math', 'formula'],
    isPublic: true,
    usageCount: 0,
    authorId: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

export function getTemplateById(id: string): NotebookTemplate | undefined {
  return Object.values(notebookTemplates).find(template => template.id === id);
}

export function getTemplatesByType(type: string): NotebookTemplate[] {
  return Object.values(notebookTemplates).filter(template => template.type === type);
}

export function getPublicTemplates(): NotebookTemplate[] {
  return Object.values(notebookTemplates).filter(template => template.isPublic);
}