import { db, type DBChatMessage, type DBChatSession } from '@/lib/db';
import type { ChatMessage, ChatSession } from '@/types';

export class ChatDBService {
  // Convert between DB and app types
  private toDBMessage(message: ChatMessage, userId: string): DBChatMessage {
    return {
      ...message,
      userId,
      timestamp: new Date(message.createdAt).getTime(),
      createdAt: new Date(message.createdAt).getTime(),
      updatedAt: new Date(message.updatedAt).getTime(),
    };
  }

  private fromDBMessage(dbMessage: DBChatMessage): ChatMessage {
    const { userId, timestamp, searchText, ...message } = dbMessage;
    return {
      ...message,
      createdAt: new Date(dbMessage.createdAt),
      updatedAt: new Date(dbMessage.updatedAt),
    };
  }

  private toDBSession(session: ChatSession, userId: string): DBChatSession {
    return {
      ...session,
      userId,
      createdAt: new Date(session.createdAt).getTime(),
      updatedAt: new Date(session.updatedAt).getTime(),
      lastActivityAt: new Date(session.lastActivityAt).getTime(),
    };
  }

  private fromDBSession(dbSession: DBChatSession): ChatSession {
    const { ...session } = dbSession;
    return {
      ...session,
      createdAt: new Date(dbSession.createdAt),
      updatedAt: new Date(dbSession.updatedAt),
      lastActivityAt: new Date(dbSession.lastActivityAt),
    };
  }

  // Message operations
  async saveMessage(message: ChatMessage, userId: string): Promise<void> {
    const dbMessage = this.toDBMessage(message, userId);
    await db.chatMessages.add(dbMessage);
  }

  async saveMessages(messages: ChatMessage[], userId: string): Promise<void> {
    const dbMessages = messages.map(msg => this.toDBMessage(msg, userId));
    await db.chatMessages.bulkAdd(dbMessages);
  }

  async getMessages(sessionId: string, userId: string, limit = 50): Promise<ChatMessage[]> {
    const messages = await db.chatMessages
      .where('[userId+sessionId]')
      .equals([userId, sessionId])
      .limit(limit)
      .reverse()
      .toArray();
    
    return messages.map(this.fromDBMessage).reverse();
  }

  async updateMessage(messageId: string, updates: Partial<ChatMessage>): Promise<void> {
    const dbUpdates: any = { ...updates };
    
    // Convert Date objects to timestamps
    if (updates.createdAt) {
      dbUpdates.createdAt = new Date(updates.createdAt).getTime();
    }
    if (updates.updatedAt) {
      dbUpdates.updatedAt = new Date(updates.updatedAt).getTime();
    }
    if (updates.editedAt) {
      dbUpdates.editedAt = new Date(updates.editedAt).getTime();
    }
    
    await db.chatMessages.update(messageId, dbUpdates);
  }

  async deleteMessage(messageId: string): Promise<void> {
    await db.chatMessages.delete(messageId);
  }

  async searchMessages(userId: string, query: string, limit = 20): Promise<ChatMessage[]> {
    const messages = await db.searchMessages(userId, query, limit);
    return messages.map(this.fromDBMessage);
  }

  // Session operations
  async saveSession(session: ChatSession, userId: string): Promise<void> {
    const dbSession = this.toDBSession(session, userId);
    await db.chatSessions.add(dbSession);
  }

  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
    const updateData: any = { ...updates };
    if (updates.lastActivityAt) {
      updateData.lastActivityAt = new Date(updates.lastActivityAt).getTime();
    }
    if (updates.updatedAt) {
      updateData.updatedAt = new Date(updates.updatedAt).getTime();
    }
    await db.chatSessions.update(sessionId, updateData);
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    const dbSession = await db.chatSessions.get(sessionId);
    return dbSession ? this.fromDBSession(dbSession) : null;
  }

  async getSessions(userId: string, limit = 20): Promise<ChatSession[]> {
    const sessions = await db.getRecentSessions(userId, limit);
    return sessions.map(this.fromDBSession);
  }

  async deleteSession(sessionId: string): Promise<void> {
    // Delete session and all its messages
    await db.transaction('rw', db.chatSessions, db.chatMessages, async () => {
      await db.chatSessions.delete(sessionId);
      await db.chatMessages.where('sessionId').equals(sessionId).delete();
    });
  }

  // Bulk operations for migration
  async importFromLocalStorage(data: any, userId: string): Promise<void> {
    try {
      const { sessions, messages } = data.state;
      
      // Import sessions
      if (sessions && sessions.length > 0) {
        const dbSessions = sessions.map((s: ChatSession) => this.toDBSession(s, userId));
        await db.chatSessions.bulkAdd(dbSessions);
      }

      // Import messages
      if (messages) {
        for (const [, sessionMessages] of Object.entries(messages)) {
          if (Array.isArray(sessionMessages)) {
            const dbMessages = sessionMessages.map((msg: ChatMessage) => 
              this.toDBMessage(msg, userId)
            );
            await db.chatMessages.bulkAdd(dbMessages);
          }
        }
      }
    } catch (error) {
      console.error('Failed to import chat data:', error);
      throw error;
    }
  }

  // Get all data for export
  async exportData(userId: string): Promise<{
    sessions: ChatSession[];
    messages: Record<string, ChatMessage[]>;
  }> {
    const sessions = await this.getSessions(userId, 1000);
    const messages: Record<string, ChatMessage[]> = {};

    for (const session of sessions) {
      messages[session.id] = await this.getMessages(session.id, userId, 1000);
    }

    return { sessions, messages };
  }
}

export const chatDBService = new ChatDBService();