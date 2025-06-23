import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  NotebookEntry, 
  NotebookFolder, 
  NotebookTemplate,
  Subject,
  PracticeProblem
} from '@types';

interface NotebookState {
  // Notebook entries
  entries: NotebookEntry[];
  folders: NotebookFolder[];
  
  // Search and filter
  searchQuery: string;
  filteredEntries: NotebookEntry[];
  selectedSubject: Subject | null;
  selectedFolder: string | null;
  
  // Templates
  templates: NotebookTemplate[];
  
  // Actions - Entries
  addEntry: (entry: Omit<NotebookEntry, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>) => NotebookEntry;
  updateEntry: (id: string, updates: Partial<NotebookEntry>) => void;
  deleteEntry: (id: string) => void;
  moveEntry: (entryId: string, folderId: string | null) => void;
  toggleFavorite: (id: string) => void;
  archiveEntry: (id: string) => void;
  
  // Actions - Folders
  createFolder: (name: string, parentId?: string, subjectId?: string) => NotebookFolder;
  updateFolder: (id: string, updates: Partial<NotebookFolder>) => void;
  deleteFolder: (id: string) => void;
  
  // Actions - Search & Filter
  searchEntries: (query: string) => void;
  filterBySubject: (subject: Subject | null) => void;
  filterByFolder: (folderId: string | null) => void;
  
  // Actions - AI Generation
  generateFromChat: (messageId: string, content: string, subject: Subject) => Promise<NotebookEntry>;
  generateStudyGuide: (subject: Subject, topics: string[]) => Promise<NotebookEntry>;
  generatePracticeSet: (subject: Subject, topic: string, count: number) => Promise<NotebookEntry>;
  
  // Actions - Import/Export
  exportEntry: (id: string) => Promise<string>;
  importFromText: (text: string, subject: Subject) => Promise<NotebookEntry>;
  
  // Actions - Usage
  recordView: (id: string) => void;
  getRecentEntries: (limit?: number) => NotebookEntry[];
  getFavorites: () => NotebookEntry[];
}

export const useNotebookStore = create<NotebookState>()(
  persist(
    (set, get) => ({
      entries: [],
      folders: [],
      searchQuery: '',
      filteredEntries: [],
      selectedSubject: null,
      selectedFolder: null,
      templates: [
        {
          id: 'vocab-template',
          name: 'Vocabulary List',
          description: 'Template for new vocabulary words',
          type: 'vocabulary',
          structure: {
            sections: [
              { title: 'Word', prompt: 'Enter the word', required: true },
              { title: 'Definition', prompt: 'What does it mean?', required: true },
              { title: 'Example', prompt: 'Use it in a sentence', required: false },
              { title: 'Synonyms', prompt: 'Similar words', required: false }
            ]
          }
        },
        {
          id: 'formula-template',
          name: 'Math Formula',
          description: 'Template for math formulas',
          type: 'formula',
          structure: {
            sections: [
              { title: 'Formula', prompt: 'Write the formula', required: true },
              { title: 'Variables', prompt: 'What does each variable mean?', required: true },
              { title: 'When to Use', prompt: 'When do you use this formula?', required: true },
              { title: 'Example', prompt: 'Show an example', required: false }
            ]
          }
        }
      ],

      addEntry: (entryData) => {
        const entry: NotebookEntry = {
          ...entryData,
          id: `note-${Date.now()}`,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        set(state => ({
          entries: [...state.entries, entry]
        }));

        return entry;
      },

      updateEntry: (id, updates) => {
        set(state => ({
          entries: state.entries.map(entry =>
            entry.id === id
              ? { ...entry, ...updates, updatedAt: new Date() }
              : entry
          )
        }));
      },

      deleteEntry: (id) => {
        set(state => ({
          entries: state.entries.filter(entry => entry.id !== id)
        }));
      },

      moveEntry: (entryId, folderId) => {
        set(state => ({
          entries: state.entries.map(entry =>
            entry.id === entryId
              ? { ...entry, folderId, updatedAt: new Date() }
              : entry
          )
        }));
      },

      toggleFavorite: (id) => {
        set(state => ({
          entries: state.entries.map(entry =>
            entry.id === id
              ? { ...entry, isFavorite: !entry.isFavorite, updatedAt: new Date() }
              : entry
          )
        }));
      },

      archiveEntry: (id) => {
        set(state => ({
          entries: state.entries.map(entry =>
            entry.id === id
              ? { ...entry, isArchived: true, updatedAt: new Date() }
              : entry
          )
        }));
      },

      createFolder: (name, parentId, subjectId) => {
        const folder: NotebookFolder = {
          id: `folder-${Date.now()}`,
          userId: 'current-user', // Would come from auth
          name,
          parentId,
          subjectId,
          order: get().folders.filter(f => f.parentId === parentId).length,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        set(state => ({
          folders: [...state.folders, folder]
        }));

        return folder;
      },

      updateFolder: (id, updates) => {
        set(state => ({
          folders: state.folders.map(folder =>
            folder.id === id
              ? { ...folder, ...updates, updatedAt: new Date() }
              : folder
          )
        }));
      },

      deleteFolder: (id) => {
        // Move all entries in this folder to parent or root
        const folder = get().folders.find(f => f.id === id);
        if (folder) {
          set(state => ({
            folders: state.folders.filter(f => f.id !== id),
            entries: state.entries.map(entry =>
              entry.folderId === id
                ? { ...entry, folderId: folder.parentId || null }
                : entry
            )
          }));
        }
      },

      searchEntries: (query) => {
        set({ searchQuery: query });
        
        if (!query.trim()) {
          set(state => ({ filteredEntries: state.entries }));
          return;
        }

        const lowerQuery = query.toLowerCase();
        set(state => ({
          filteredEntries: state.entries.filter(entry =>
            entry.title.toLowerCase().includes(lowerQuery) ||
            entry.content.toLowerCase().includes(lowerQuery) ||
            entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
          )
        }));
      },

      filterBySubject: (subject) => {
        set({ selectedSubject: subject });
        
        if (!subject) {
          set(state => ({ filteredEntries: state.entries }));
          return;
        }

        set(state => ({
          filteredEntries: state.entries.filter(entry =>
            entry.subject.id === subject.id
          )
        }));
      },

      filterByFolder: (folderId) => {
        set({ selectedFolder: folderId });
        
        if (!folderId) {
          set(state => ({ filteredEntries: state.entries }));
          return;
        }

        set(state => ({
          filteredEntries: state.entries.filter(entry =>
            entry.folderId === folderId
          )
        }));
      },

      generateFromChat: async (messageId, content, subject) => {
        // Simulate AI generation (would be replaced with actual AI service call)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const entry = get().addEntry({
          title: 'AI Generated Note',
          content,
          type: 'concept',
          subject,
          tags: ['ai-generated', subject.code.toLowerCase()],
          isAIGenerated: true,
          sourceMessageId: messageId,
          isFavorite: false,
          isArchived: false,
          order: 0
        });

        return entry;
      },

      generateStudyGuide: async (subject, topics) => {
        const content = `# ${subject.name} Study Guide\n\n${topics.map(t => `## ${t}\n\n[Content here]\n`).join('\n')}`;
        
        const entry = get().addEntry({
          title: `${subject.name} Study Guide`,
          content,
          type: 'summary',
          subject,
          tags: ['study-guide', ...topics],
          isAIGenerated: true,
          isFavorite: false,
          isArchived: false,
          order: 0
        });

        return entry;
      },

      generatePracticeSet: async (subject, topic, count) => {
        // Simulate generating practice problems
        const problems: PracticeProblem[] = Array.from({ length: count }, (_, i) => ({
          id: `prob-${Date.now()}-${i}`,
          question: `Practice problem ${i + 1} for ${topic}`,
          type: 'short-answer',
          difficulty: 'medium',
          hints: [`Hint for problem ${i + 1}`],
          solution: `Solution for problem ${i + 1}`,
          explanation: `This problem tests your understanding of ${topic}.`,
          correctAnswer: `Answer ${i + 1}`
        }));

        const content = problems.map((p, i) => 
          `### Problem ${i + 1}\n${p.question}\n\n**Answer:** ${p.correctAnswer}\n\n**Explanation:** ${p.explanation}\n`
        ).join('\n---\n\n');

        const entry = get().addEntry({
          title: `${topic} Practice Problems`,
          content,
          type: 'practice',
          subject,
          tags: [topic, 'practice', subject.code.toLowerCase()],
          isAIGenerated: true,
          isFavorite: false,
          isArchived: false,
          order: 0
        });

        return entry;
      },

      exportEntry: async (id) => {
        const entry = get().entries.find(e => e.id === id);
        if (!entry) throw new Error('Entry not found');

        return `# ${entry.title}\n\nSubject: ${entry.subject.name}\nCreated: ${entry.createdAt.toLocaleDateString()}\nTags: ${entry.tags.join(', ')}\n\n---\n\n${entry.content}`;
      },

      importFromText: async (text, subject) => {
        // Simple parsing - in real app would be more sophisticated
        const lines = text.split('\n');
        const title = lines[0].replace(/^#\s*/, '') || 'Imported Note';
        const content = lines.slice(1).join('\n').trim();

        const entry = get().addEntry({
          title,
          content,
          type: 'concept',
          subject,
          tags: ['imported'],
          isAIGenerated: false,
          isFavorite: false,
          isArchived: false,
          order: 0
        });

        return entry;
      },

      recordView: (id) => {
        set(state => ({
          entries: state.entries.map(entry =>
            entry.id === id
              ? { 
                  ...entry, 
                  viewCount: entry.viewCount + 1,
                  lastViewed: new Date()
                }
              : entry
          )
        }));
      },

      getRecentEntries: (limit = 10) => {
        return get().entries
          .filter(e => !e.isArchived)
          .sort((a, b) => {
            const aDate = a.lastViewed || a.updatedAt;
            const bDate = b.lastViewed || b.updatedAt;
            return bDate.getTime() - aDate.getTime();
          })
          .slice(0, limit);
      },

      getFavorites: () => {
        return get().entries.filter(e => e.isFavorite && !e.isArchived);
      }
    }),
    {
      name: 'skooledin-notebook',
      partialize: (state) => ({
        entries: state.entries,
        folders: state.folders
      })
    }
  )
);