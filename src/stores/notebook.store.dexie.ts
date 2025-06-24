import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { notebookDBService } from '@/services/db/notebook-db.service';
import { db } from '@/lib/db';
import { studyGuideService } from '@/services/ai/study-guide.service';
import type { 
  NotebookEntry, 
  NotebookMetadata,
  ChatMessage,
  NoteType
} from '@/types';

export interface StudyGuideRequest {
  topic: string;
  type: 'outline' | 'flashcards' | 'summary' | 'practice_questions' | 'mind_map';
  gradeLevel?: number;
  depth: 'basic' | 'intermediate' | 'advanced';
  includeExamples?: boolean;
  subjectId: string;
}

interface NotebookState {
  entries: NotebookEntry[];
  activeEntry: NotebookEntry | null;
  isLoading: boolean;
  searchQuery: string;
  filteredEntries: NotebookEntry[];
  userId: string | null;
  
  // Entry Management
  createEntry: (entry: Partial<NotebookEntry>) => Promise<NotebookEntry>;
  updateEntry: (id: string, updates: Partial<NotebookEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  loadEntries: (userId: string) => Promise<void>;
  setActiveEntry: (entry: NotebookEntry | null) => void;
  
  // Search & Filter
  searchEntries: (query: string) => Promise<void>;
  filterBySubject: (subjectId: string | null) => void;
  filterByType: (type: NoteType | null) => void;
  filterByTags: (tags: string[]) => void;
  
  // Special Creation Methods
  createFromMessages: (messages: ChatMessage[], metadata: Partial<NotebookMetadata>) => Promise<NotebookEntry>;
  generateStudyGuide: (request: StudyGuideRequest) => Promise<NotebookEntry>;
  
  // Utility
  setUserId: (userId: string) => void;
  getRecentEntries: (limit?: number) => NotebookEntry[];
  getRelatedEntries: (entryId: string) => Promise<NotebookEntry[]>;
  exportEntry: (entryId: string, format: 'markdown' | 'pdf') => Promise<Blob>;
  
  // Data migration
  migrateFromLocalStorage: () => Promise<void>;
}

export const useNotebookStore = create<NotebookState>()(
  subscribeWithSelector((set, get) => ({
    entries: [],
    activeEntry: null,
    isLoading: false,
    searchQuery: '',
    filteredEntries: [],
    userId: null,
    
    setUserId: (userId) => {
      set({ userId });
      // Load user's notebook entries when userId is set
      get().loadEntries(userId);
    },
    
    loadEntries: async (userId) => {
      try {
        set({ isLoading: true });
        const entries = await notebookDBService.getEntries(userId, { limit: 100 });
        set({ 
          entries, 
          filteredEntries: entries,
          isLoading: false 
        });
      } catch (error) {
        console.error('Failed to load notebook entries:', error);
        set({ isLoading: false });
      }
    },
    
    createEntry: async (partialEntry) => {
      const userId = get().userId;
      if (!userId) throw new Error('User not authenticated');
      
      const entry: Omit<NotebookEntry, 'id'> = {
        userId,
        title: partialEntry.title || 'Untitled Note',
        content: partialEntry.content || '',
        type: partialEntry.type || 'concept',
        format: partialEntry.format || 'markdown',
        subjectId: partialEntry.subjectId || 'general',
        metadata: {
          isAIGenerated: false,
          sourceType: 'manual',
          gradeLevel: 10,
          studyCount: 0,
          isFavorite: false,
          isArchived: false,
          wordCount: (partialEntry.content || '').split(' ').length,
          ...partialEntry.metadata
        },
        tags: partialEntry.tags || [],
        attachments: partialEntry.attachments || [],
        annotations: partialEntry.annotations || [],
        status: partialEntry.status || 'draft',
        visibility: partialEntry.visibility || 'private',
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const entryId = await notebookDBService.createEntry(entry, userId);
      const newEntry = await notebookDBService.getEntry(entryId);
      
      if (newEntry) {
        set(state => ({
          entries: [...state.entries, newEntry],
          filteredEntries: [...state.filteredEntries, newEntry],
          activeEntry: newEntry
        }));
        return newEntry;
      }
      
      throw new Error('Failed to create notebook entry');
    },
    
    updateEntry: async (id, updates) => {
      await notebookDBService.updateEntry(id, updates);
      
      // Update local state
      set(state => ({
        entries: state.entries.map(e => 
          e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
        ),
        filteredEntries: state.filteredEntries.map(e =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
        ),
        activeEntry: state.activeEntry?.id === id 
          ? { ...state.activeEntry, ...updates, updatedAt: new Date() }
          : state.activeEntry
      }));
    },
    
    deleteEntry: async (id) => {
      await notebookDBService.deleteEntry(id);
      
      set(state => ({
        entries: state.entries.filter(e => e.id !== id),
        filteredEntries: state.filteredEntries.filter(e => e.id !== id),
        activeEntry: state.activeEntry?.id === id ? null : state.activeEntry
      }));
    },
    
    setActiveEntry: (entry) => {
      set({ activeEntry: entry });
    },
    
    searchEntries: async (query) => {
      set({ searchQuery: query });
      
      if (!query.trim()) {
        set(state => ({ filteredEntries: state.entries }));
        return;
      }
      
      const userId = get().userId;
      if (!userId) return;
      
      const results = await notebookDBService.searchEntries(userId, query);
      set({ filteredEntries: results });
    },
    
    filterBySubject: (subjectId) => {
      set(state => ({
        filteredEntries: subjectId
          ? state.entries.filter(e => e.subjectId === subjectId)
          : state.entries
      }));
    },
    
    filterByType: (type) => {
      set(state => ({
        filteredEntries: type
          ? state.entries.filter(e => e.type === type)
          : state.entries
      }));
    },
    
    filterByTags: (tags) => {
      if (tags.length === 0) {
        set(state => ({ filteredEntries: state.entries }));
        return;
      }
      
      set(state => ({
        filteredEntries: state.entries.filter(e =>
          tags.some(tag => e.tags.includes(tag))
        )
      }));
    },
    
    createFromMessages: async (messages, metadata) => {
      // Format messages into markdown
      const content = messages.map(msg => {
        const role = msg.role === 'user' ? '👤 **You**' : '🤖 **Assistant**';
        const timestamp = new Date(msg.createdAt).toLocaleString();
        return `### ${role} - ${timestamp}\n\n${msg.content}\n\n---`;
      }).join('\n\n');
      
      const title = metadata.sourceType === 'chat' 
        ? `Chat: ${messages[0]?.content.slice(0, 50)}...`
        : 'Saved from Chat';
      
      return get().createEntry({
        title,
        content,
        type: 'summary',
        metadata: {
          isAIGenerated: false,
          sourceType: 'chat',
          sourceId: messages[0]?.sessionId,
          studyCount: 0,
          isFavorite: false,
          isArchived: false,
          wordCount: content.split(' ').length,
          ...metadata
        }
      });
    },
    
    generateStudyGuide: async (request) => {
      set({ isLoading: true });
      
      try {
        const response = await studyGuideService.generateStudyGuide(request);
        
        // Map study guide type to notebook entry type
        const entryTypeMap: Record<string, NoteType> = {
          'outline': 'summary',
          'flashcards': 'flashcard',
          'summary': 'summary',
          'practice_questions': 'quiz',
          'mind_map': 'concept'
        };
        
        const entry = await get().createEntry({
          title: `Study Guide: ${request.topic}`,
          content: response.content,
          type: entryTypeMap[request.type] || 'summary',
          subjectId: request.subjectId,
          metadata: {
            isAIGenerated: true,
            sourceType: 'manual',
            gradeLevel: request.gradeLevel || 10,
            studyCount: 0,
            isFavorite: false,
            isArchived: false,
            wordCount: response.metadata.wordCount
          }
        });
        
        return entry;
      } catch (error) {
        console.error('Failed to generate study guide:', error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    
    getRecentEntries: (limit = 10) => {
      return get().entries
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, limit);
    },
    
    getRelatedEntries: async (entryId) => {
      const userId = get().userId;
      if (!userId) return [];
      
      return notebookDBService.getRelatedEntries(entryId, userId);
    },
    
    exportEntry: async (entryId, format) => {
      const entry = get().entries.find(e => e.id === entryId);
      if (!entry) throw new Error('Entry not found');
      
      if (format === 'markdown') {
        const blob = new Blob([entry.content], { type: 'text/markdown' });
        return blob;
      }
      
      // PDF export would require additional library
      throw new Error('PDF export not yet implemented');
    },
    
    migrateFromLocalStorage: async () => {
      try {
        const userId = get().userId;
        if (!userId) return;
        
        // Check if we already have data in Dexie
        const existingCount = await db.notebooks.count();
        if (existingCount > 0) {
          console.log('Notebook data already migrated');
          return;
        }
        
        // Get data from localStorage
        const localData = localStorage.getItem('skooledin-notebook');
        if (!localData) return;
        
        const parsed = JSON.parse(localData);
        await notebookDBService.importFromLocalStorage(parsed, userId);
        
        // Clear localStorage after successful migration
        localStorage.removeItem('skooledin-notebook');
        console.log('Notebook migration completed successfully');
        
        // Reload entries
        await get().loadEntries(userId);
      } catch (error) {
        console.error('Notebook migration failed:', error);
      }
    }
  }))
);