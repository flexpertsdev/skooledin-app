import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  NotebookEntry, 
  NotebookFolder, 
  NotebookTemplate
} from '@types';

interface NotebookState {
  // Notebook entries
  entries: NotebookEntry[];
  folders: NotebookFolder[];
  
  // Search and filter
  searchQuery: string;
  filteredEntries: NotebookEntry[];
  selectedSubjectId: string | null;
  selectedFolderId: string | null;
  
  // Templates
  templates: NotebookTemplate[];
  
  // Actions - Entries
  addEntry: (entry: Omit<NotebookEntry, 'id' | 'createdAt' | 'updatedAt'>) => NotebookEntry;
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
  filterBySubject: (subjectId: string | null) => void;
  filterByFolder: (folderId: string | null) => void;
  
  // Actions - AI Generation
  generateFromChat: (messageId: string, content: string, subjectId: string) => Promise<NotebookEntry>;
  generateStudyGuide: (subjectId: string, topics: string[]) => Promise<NotebookEntry>;
  generatePracticeSet: (subjectId: string, topic: string, count: number) => Promise<NotebookEntry>;
  
  // Actions - Import/Export
  exportEntry: (id: string) => Promise<string>;
  importFromText: (text: string, subjectId: string) => Promise<NotebookEntry>;
  
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
      selectedSubjectId: null,
      selectedFolderId: null,
      templates: [
        {
          id: 'vocab-template',
          name: 'Vocabulary List',
          description: 'Template for new vocabulary words',
          type: 'vocabulary',
          structure: {
            sections: [
              { 
                id: '1',
                title: 'Word', 
                prompt: 'Enter the word', 
                type: 'text',
                required: true,
                order: 1
              },
              { 
                id: '2',
                title: 'Definition', 
                prompt: 'What does it mean?', 
                type: 'text',
                required: true,
                order: 2
              },
              { 
                id: '3',
                title: 'Example', 
                prompt: 'Use it in a sentence', 
                type: 'text',
                required: false,
                order: 3
              },
              { 
                id: '4',
                title: 'Synonyms', 
                prompt: 'Similar words', 
                type: 'text',
                required: false,
                order: 4
              }
            ]
          },
          tags: ['vocabulary', 'language'],
          isPublic: false,
          usageCount: 0,
          authorId: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'formula-template',
          name: 'Math Formula',
          description: 'Template for math formulas',
          type: 'formula',
          structure: {
            sections: [
              { 
                id: '1',
                title: 'Formula', 
                prompt: 'Write the formula', 
                type: 'formula',
                required: true,
                order: 1
              },
              { 
                id: '2',
                title: 'Variables', 
                prompt: 'What does each variable mean?', 
                type: 'text',
                required: true,
                order: 2
              },
              { 
                id: '3',
                title: 'When to Use', 
                prompt: 'When do you use this formula?', 
                type: 'text',
                required: true,
                order: 3
              },
              { 
                id: '4',
                title: 'Example', 
                prompt: 'Show an example', 
                type: 'text',
                required: false,
                order: 4
              }
            ]
          },
          tags: ['math', 'formula'],
          isPublic: false,
          usageCount: 0,
          authorId: 'system',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],

      addEntry: (entryData) => {
        const entry: NotebookEntry = {
          ...entryData,
          id: `note-${Date.now()}`,
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
              ? { 
                  ...entry, 
                  metadata: { 
                    ...entry.metadata, 
                    folderId: folderId || undefined
                  }, 
                  updatedAt: new Date() 
                }
              : entry
          )
        }));
      },

      toggleFavorite: (id) => {
        set(state => ({
          entries: state.entries.map(entry =>
            entry.id === id
              ? { 
                  ...entry, 
                  metadata: { 
                    ...entry.metadata, 
                    isFavorite: !entry.metadata.isFavorite 
                  }, 
                  updatedAt: new Date() 
                }
              : entry
          )
        }));
      },

      archiveEntry: (id) => {
        set(state => ({
          entries: state.entries.map(entry =>
            entry.id === id
              ? { 
                  ...entry, 
                  metadata: { 
                    ...entry.metadata, 
                    isArchived: true 
                  }, 
                  updatedAt: new Date() 
                }
              : entry
          )
        }));
      },

      createFolder: (name, parentId, subjectId) => {
        const folder: NotebookFolder = {
          id: `folder-${Date.now()}`,
          userId: 'current-user',
          name,
          parentId,
          subjectId,
          sortOrder: get().folders.filter(f => f.parentId === parentId).length,
          noteCount: 0,
          settings: {
            autoOrganize: false,
            sortBy: 'date',
            sortOrder: 'desc'
          },
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
        const folder = get().folders.find(f => f.id === id);
        if (folder) {
          set(state => ({
            folders: state.folders.filter(f => f.id !== id),
            entries: state.entries.map(entry =>
              entry.metadata.folderId === id
                ? { 
                    ...entry, 
                    metadata: { 
                      ...entry.metadata, 
                      folderId: folder.parentId 
                    } 
                  }
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

      filterBySubject: (subjectId) => {
        set({ selectedSubjectId: subjectId });
        
        if (!subjectId) {
          set(state => ({ filteredEntries: state.entries }));
          return;
        }

        set(state => ({
          filteredEntries: state.entries.filter(entry =>
            entry.subjectId === subjectId
          )
        }));
      },

      filterByFolder: (folderId) => {
        set({ selectedFolderId: folderId });
        
        if (!folderId) {
          set(state => ({ filteredEntries: state.entries }));
          return;
        }

        set(state => ({
          filteredEntries: state.entries.filter(entry =>
            entry.metadata.folderId === folderId
          )
        }));
      },

      generateFromChat: async (messageId, content, subjectId) => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const entry = get().addEntry({
          userId: 'current-user',
          title: 'AI Generated Note',
          content,
          type: 'concept',
          format: 'markdown',
          subjectId,
          metadata: {
            isAIGenerated: true,
            sourceType: 'chat',
            sourceId: messageId,
            gradeLevel: 10,
            wordCount: content.split(' ').length,
            studyCount: 0,
            isFavorite: false,
            isArchived: false
          },
          tags: ['ai-generated'],
          attachments: [],
          annotations: [],
          status: 'complete',
          visibility: 'private',
          version: 1
        });

        return entry;
      },

      generateStudyGuide: async (subjectId, topics) => {
        const content = `# Study Guide\n\n${topics.map(t => `## ${t}\n\n[Content here]\n`).join('\n')}`;
        
        const entry = get().addEntry({
          userId: 'current-user',
          title: 'Study Guide',
          content,
          type: 'summary',
          format: 'markdown',
          subjectId,
          metadata: {
            isAIGenerated: true,
            sourceType: 'manual',
            gradeLevel: 10,
            wordCount: content.split(' ').length,
            studyCount: 0,
            isFavorite: false,
            isArchived: false
          },
          tags: ['study-guide', ...topics],
          attachments: [],
          annotations: [],
          status: 'complete',
          visibility: 'private',
          version: 1
        });

        return entry;
      },

      generatePracticeSet: async (subjectId, topic, count) => {
        const problems = Array.from({ length: count }, (_, i) => ({
          id: `prob-${Date.now()}-${i}`,
          question: `Practice problem ${i + 1} for ${topic}`,
          type: 'short-answer',
          difficulty: 'same' as const,
          hints: [`Hint for problem ${i + 1}`],
          solution: `Solution for problem ${i + 1}`
        }));

        const content = problems.map((p, i) => 
          `### Problem ${i + 1}\n${p.question}\n\n**Solution:** ${p.solution}\n`
        ).join('\n---\n\n');

        const entry = get().addEntry({
          userId: 'current-user',
          title: `${topic} Practice Problems`,
          content,
          type: 'practice',
          format: 'markdown',
          subjectId,
          metadata: {
            isAIGenerated: true,
            sourceType: 'manual',
            gradeLevel: 10,
            wordCount: content.split(' ').length,
            studyCount: 0,
            isFavorite: false,
            isArchived: false
          },
          tags: [topic, 'practice'],
          attachments: [],
          annotations: [],
          status: 'complete',
          visibility: 'private',
          version: 1
        });

        return entry;
      },

      exportEntry: async (id) => {
        const entry = get().entries.find(e => e.id === id);
        if (!entry) throw new Error('Entry not found');

        return `# ${entry.title}\n\nSubject ID: ${entry.subjectId}\nCreated: ${entry.createdAt.toLocaleDateString()}\nTags: ${entry.tags.join(', ')}\n\n---\n\n${entry.content}`;
      },

      importFromText: async (text, subjectId) => {
        const lines = text.split('\n');
        const title = lines[0].replace(/^#\s*/, '') || 'Imported Note';
        const content = lines.slice(1).join('\n').trim();

        const entry = get().addEntry({
          userId: 'current-user',
          title,
          content,
          type: 'concept',
          format: 'markdown',
          subjectId,
          metadata: {
            isAIGenerated: false,
            sourceType: 'import',
            gradeLevel: 10,
            wordCount: content.split(' ').length,
            studyCount: 0,
            isFavorite: false,
            isArchived: false
          },
          tags: ['imported'],
          attachments: [],
          annotations: [],
          status: 'complete',
          visibility: 'private',
          version: 1
        });

        return entry;
      },

      recordView: (id) => {
        set(state => ({
          entries: state.entries.map(entry =>
            entry.id === id
              ? { 
                  ...entry, 
                  metadata: {
                    ...entry.metadata,
                    lastStudied: new Date(),
                    studyCount: entry.metadata.studyCount + 1
                  }
                }
              : entry
          )
        }));
      },

      getRecentEntries: (limit = 10) => {
        return get().entries
          .filter(e => !e.metadata.isArchived)
          .sort((a, b) => {
            const aDate = a.metadata.lastStudied || a.updatedAt;
            const bDate = b.metadata.lastStudied || b.updatedAt;
            return bDate.getTime() - aDate.getTime();
          })
          .slice(0, limit);
      },

      getFavorites: () => {
        return get().entries.filter(e => e.metadata.isFavorite && !e.metadata.isArchived);
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