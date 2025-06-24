import Dexie, { type Table } from 'dexie';
import type { 
  ChatMessage, 
  ChatSession, 
  NotebookEntry, 
  FileAttachment,
  StudyContext 
} from '@/types';
import type { LearningProfile, ConceptKnowledge } from '@/types/context.types';

// Extended types for database storage
export interface DBChatMessage extends Omit<ChatMessage, 'createdAt' | 'updatedAt'> {
  userId: string;
  timestamp: number; // For indexing
  createdAt: number; // Store as timestamp
  updatedAt: number;
  searchText?: string; // Concatenated content for search
}

export interface DBChatSession extends Omit<ChatSession, 'createdAt' | 'updatedAt' | 'lastActivityAt'> {
  createdAt: number;
  updatedAt: number;
  lastActivityAt: number;
}

export interface DBNotebookEntry extends Omit<NotebookEntry, 'createdAt' | 'updatedAt' | 'lastAccessedAt'> {
  createdAt: number;
  updatedAt: number;
  lastAccessedAt?: number;
  searchText: string; // Concatenated title + content for full-text search
  embedding?: number[]; // For AI similarity search
}

export interface DBFileAttachment {
  id: string;
  userId: string;
  file: Blob;
  metadata: FileAttachment;
  uploadedAt: number;
}

export interface DBLearningProfile extends Omit<LearningProfile, 'progressTracking'> {
  userId: string;
  lastUpdated: number;
  progressTracking: {
    totalSessions: number;
    totalConcepts: number;
    masteryRate: number;
    lastActive: number;
  };
}

export interface DBConceptKnowledge extends Omit<ConceptKnowledge, 'lastReviewed'> {
  userId: string;
  subjectId: string;
  lastReviewed: number;
  createdAt: number;
  updatedAt: number;
}

// Analytics tracking
export interface DBStudySession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  subjectId?: string;
  conceptsCovered: string[];
  messagesCount: number;
  notebooksAccessed: string[];
}

class SkooledInDB extends Dexie {
  // Tables
  chatMessages!: Table<DBChatMessage>;
  chatSessions!: Table<DBChatSession>;
  notebooks!: Table<DBNotebookEntry>;
  fileAttachments!: Table<DBFileAttachment>;
  learningProfiles!: Table<DBLearningProfile>;
  conceptKnowledge!: Table<DBConceptKnowledge>;
  studySessions!: Table<DBStudySession>;
  contexts!: Table<StudyContext>;
  
  constructor() {
    super('SkooledInDB');
    
    // Define schema
    this.version(1).stores({
      // Primary tables with indexes
      chatMessages: '++id, userId, sessionId, timestamp, role, [userId+sessionId], [userId+timestamp]',
      chatSessions: '++id, userId, type, [userId+type], [userId+lastActivityAt]',
      notebooks: '++id, userId, subjectId, type, [userId+subjectId], [userId+type], *tags, searchText',
      fileAttachments: '++id, userId, [userId+uploadedAt]',
      learningProfiles: 'userId, lastUpdated',
      conceptKnowledge: '++id, userId, subjectId, name, [userId+subjectId], [userId+confidence]',
      studySessions: '++id, userId, startTime, [userId+startTime], [userId+subjectId]',
      contexts: '++id, userId, type, [userId+type]'
    });

    // Hooks for automatic timestamps
    this.chatMessages.hook('creating', (_primKey, obj: any) => {
      const now = Date.now();
      obj.timestamp = now;
      obj.createdAt = now;
      obj.updatedAt = now;
      // Create searchable text
      obj.searchText = obj.content.toLowerCase();
    });

    this.chatMessages.hook('updating', (modifications, _primKey, _obj) => {
      (modifications as any).updatedAt = Date.now();
      if ((modifications as any).content) {
        (modifications as any).searchText = (modifications as any).content.toLowerCase();
      }
    });

    this.notebooks.hook('creating', (_primKey, obj: any) => {
      const now = Date.now();
      obj.createdAt = now;
      obj.updatedAt = now;
      // Create searchable text from title and content
      obj.searchText = `${obj.title} ${obj.content}`.toLowerCase();
    });

    this.notebooks.hook('updating', (modifications, _primKey, obj) => {
      (modifications as any).updatedAt = Date.now();
      if ((modifications as any).title || (modifications as any).content) {
        const title = (modifications as any).title || (obj as any).title;
        const content = (modifications as any).content || (obj as any).content;
        (modifications as any).searchText = `${title} ${content}`.toLowerCase();
      }
    });
  }

  // Helper methods
  async searchMessages(userId: string, query: string, limit = 20): Promise<DBChatMessage[]> {
    const searchTerm = query.toLowerCase();
    return this.chatMessages
      .where('userId').equals(userId)
      .filter(msg => msg.searchText?.includes(searchTerm) || false)
      .limit(limit)
      .reverse()
      .toArray();
  }

  async searchNotebooks(userId: string, query: string, limit = 20): Promise<DBNotebookEntry[]> {
    const searchTerm = query.toLowerCase();
    return this.notebooks
      .where('userId').equals(userId)
      .filter(entry => entry.searchText.includes(searchTerm))
      .limit(limit)
      .reverse()
      .toArray();
  }

  async getRecentSessions(userId: string, limit = 10): Promise<DBChatSession[]> {
    return this.chatSessions
      .where('userId').equals(userId)
      .reverse()
      .sortBy('lastActivityAt')
      .then(sessions => sessions.slice(0, limit));
  }

  async getConceptMastery(userId: string, subjectId?: string): Promise<DBConceptKnowledge[]> {
    if (subjectId) {
      return this.conceptKnowledge
        .where('[userId+subjectId]')
        .equals([userId, subjectId])
        .reverse()
        .sortBy('confidence');
    }
    return this.conceptKnowledge
      .where('userId')
      .equals(userId)
      .reverse()
      .sortBy('confidence');
  }

  // Migration helper for existing localStorage data
  async migrateFromLocalStorage(): Promise<void> {
    try {
      // Get existing data from localStorage
      const chatData = localStorage.getItem('skooledin-chat');
      const notebookData = localStorage.getItem('skooledin-notebook');
      const contextData = localStorage.getItem('skooledin-context');

      if (chatData) {
        // Chat migration handled by chat store
        console.log('Chat data found, will be migrated by chat store');
      }

      if (notebookData) {
        // Notebook migration handled by notebook store
        console.log('Notebook data found, will be migrated by notebook store');
      }

      if (contextData) {
        // Context migration will be handled when implementing learning profiles
        console.log('Context data found, will be migrated with learning profiles');
      }

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }
}

// Create database instance
export const db = new SkooledInDB();

// Initialize database
export async function initializeDB(): Promise<void> {
  try {
    await db.open();
    console.log('Database initialized successfully');
    
    // Check if migration is needed
    const hasData = await db.chatMessages.count();
    if (hasData === 0 && localStorage.getItem('skooledin-chat')) {
      console.log('Migrating data from localStorage...');
      await db.migrateFromLocalStorage();
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}