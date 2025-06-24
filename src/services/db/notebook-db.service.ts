import { db, type DBNotebookEntry } from '@/lib/db';
import type { NotebookEntry } from '@/types';

export class NotebookDBService {
  // Convert between DB and app types
  private toDBEntry(entry: NotebookEntry, userId: string): DBNotebookEntry {
    return {
      ...entry,
      userId,
      createdAt: new Date(entry.createdAt).getTime(),
      updatedAt: new Date(entry.updatedAt).getTime(),
      lastAccessedAt: entry.lastAccessedAt ? new Date(entry.lastAccessedAt).getTime() : undefined,
      searchText: `${entry.title} ${entry.content}`.toLowerCase(),
    };
  }

  private fromDBEntry(dbEntry: DBNotebookEntry): NotebookEntry {
    const { searchText, embedding, ...entry } = dbEntry;
    return {
      ...entry,
      createdAt: new Date(dbEntry.createdAt),
      updatedAt: new Date(dbEntry.updatedAt),
      lastAccessedAt: dbEntry.lastAccessedAt ? new Date(dbEntry.lastAccessedAt) : undefined,
    };
  }

  // CRUD operations
  async createEntry(entry: Omit<NotebookEntry, 'id'>, userId: string): Promise<string> {
    const id = `notebook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullEntry: NotebookEntry = {
      ...entry,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const dbEntry = this.toDBEntry(fullEntry, userId);
    await db.notebooks.add(dbEntry);
    return id;
  }

  async updateEntry(id: string, updates: Partial<NotebookEntry>): Promise<void> {
    const updateData: any = { ...updates, updatedAt: Date.now() };
    
    // Update searchText if title or content changed
    if (updates.title || updates.content) {
      const existing = await db.notebooks.get(id);
      if (existing) {
        const title = updates.title || existing.title;
        const content = updates.content || existing.content;
        updateData.searchText = `${title} ${content}`.toLowerCase();
      }
    }

    await db.notebooks.update(id, updateData);
  }

  async deleteEntry(id: string): Promise<void> {
    await db.notebooks.delete(id);
  }

  async getEntry(id: string): Promise<NotebookEntry | null> {
    const dbEntry = await db.notebooks.get(id);
    if (!dbEntry) return null;

    // Update last accessed time
    await db.notebooks.update(id, { lastAccessedAt: Date.now() });
    
    return this.fromDBEntry(dbEntry);
  }

  async getEntries(userId: string, options?: {
    subjectId?: string;
    type?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<NotebookEntry[]> {
    let query = db.notebooks.where('userId').equals(userId);

    // Apply filters
    const entries = await query.toArray();
    let filtered = entries;

    if (options?.subjectId) {
      filtered = filtered.filter(e => e.subjectId === options.subjectId);
    }

    if (options?.type) {
      filtered = filtered.filter(e => e.type === options.type);
    }

    if (options?.tags && options.tags.length > 0) {
      filtered = filtered.filter(e => 
        options.tags!.some(tag => e.tags.includes(tag))
      );
    }

    // Sort by updated date (newest first)
    filtered.sort((a, b) => b.updatedAt - a.updatedAt);

    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    const paginated = filtered.slice(offset, offset + limit);

    return paginated.map(this.fromDBEntry);
  }

  async searchEntries(userId: string, query: string, limit = 20): Promise<NotebookEntry[]> {
    const entries = await db.searchNotebooks(userId, query, limit);
    return entries.map(this.fromDBEntry);
  }

  async getRelatedEntries(entryId: string, userId: string, limit = 5): Promise<NotebookEntry[]> {
    const entry = await db.notebooks.get(entryId);
    if (!entry) return [];

    // For now, use tag-based similarity
    // Later: implement vector similarity search
    const related = await db.notebooks
      .where('userId').equals(userId)
      .filter(e => {
        if (e.id === entryId) return false;
        
        // Check for shared tags
        const sharedTags = e.tags.filter(tag => entry.tags.includes(tag));
        if (sharedTags.length > 0) return true;
        
        // Check for same subject
        if (e.subjectId === entry.subjectId) return true;
        
        return false;
      })
      .limit(limit)
      .toArray();

    return related.map(this.fromDBEntry);
  }

  // Bulk operations
  async importFromLocalStorage(data: any, userId: string): Promise<void> {
    try {
      const { entries } = data.state;
      
      if (entries && entries.length > 0) {
        const dbEntries = entries.map((entry: NotebookEntry) => 
          this.toDBEntry(entry, userId)
        );
        await db.notebooks.bulkAdd(dbEntries);
      }
    } catch (error) {
      console.error('Failed to import notebook data:', error);
      throw error;
    }
  }

  async exportData(userId: string): Promise<NotebookEntry[]> {
    const entries = await this.getEntries(userId, { limit: 10000 });
    return entries;
  }

  // Analytics
  async getStats(userId: string, subjectId?: string): Promise<{
    totalEntries: number;
    byType: Record<string, number>;
    recentlyUpdated: number;
    totalWords: number;
  }> {
    let query = db.notebooks.where('userId').equals(userId);
    const entries = await query.toArray();
    
    const filtered = subjectId 
      ? entries.filter(e => e.subjectId === subjectId)
      : entries;

    const stats = {
      totalEntries: filtered.length,
      byType: {} as Record<string, number>,
      recentlyUpdated: 0,
      totalWords: 0,
    };

    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    filtered.forEach(entry => {
      // Count by type
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
      
      // Count recently updated
      if (entry.updatedAt > oneWeekAgo) {
        stats.recentlyUpdated++;
      }
      
      // Count words
      stats.totalWords += entry.metadata.wordCount || 0;
    });

    return stats;
  }
}

export const notebookDBService = new NotebookDBService();