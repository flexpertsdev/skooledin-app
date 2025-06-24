import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { chatDBService } from '@/services/db/chat-db.service';
import { db } from '@/lib/db';
import type { 
  ChatMessage, 
  ChatSession, 
  MessageAttachment,
  AIThinking
} from '@/types';

interface ChatState {
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  messages: Record<string, ChatMessage[]>; // sessionId -> messages
  isTyping: boolean;
  isLoading: boolean;
  userId: string | null;
  
  // Session Management
  createSession: (title: string, type?: ChatSession['type'], subjectId?: string) => Promise<ChatSession>;
  setActiveSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  loadSessions: (userId: string) => Promise<void>;
  
  // Message Actions
  sendMessage: (sessionId: string, content: string, attachments?: MessageAttachment[], debugInfo?: any) => Promise<void>;
  addAIResponse: (sessionId: string, content: string, thinking?: AIThinking, debugInfo?: any) => Promise<void>;
  updateMessageStatus: (sessionId: string, messageId: string, status: ChatMessage['status']) => Promise<void>;
  loadMessages: (sessionId: string) => Promise<void>;
  
  // Notebook Integration
  saveToNotebook: (messageId: string) => Promise<void>;
  
  // Utility
  clearChat: (sessionId: string) => Promise<void>;
  getRecentSessions: (limit?: number) => ChatSession[];
  setIsTyping: (typing: boolean) => void;
  setUserId: (userId: string) => void;
  searchMessages: (query: string) => Promise<ChatMessage[]>;
  
  // Data migration
  migrateFromLocalStorage: () => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  subscribeWithSelector((set, get) => ({
    sessions: [],
    activeSession: null,
    messages: {},
    isTyping: false,
    isLoading: false,
    userId: null,
    
    setUserId: (userId) => {
      set({ userId });
      // Load user's sessions when userId is set
      get().loadSessions(userId);
    },
    
    loadSessions: async (userId) => {
      try {
        set({ isLoading: true });
        const sessions = await chatDBService.getSessions(userId);
        set({ sessions, isLoading: false });
        
        // If there's an active session, load its messages
        const activeSession = get().activeSession;
        if (activeSession) {
          await get().loadMessages(activeSession.id);
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
        set({ isLoading: false });
      }
    },
    
    loadMessages: async (sessionId) => {
      try {
        const userId = get().userId;
        if (!userId) return;
        
        const messages = await chatDBService.getMessages(sessionId, userId);
        set(state => ({
          messages: { ...state.messages, [sessionId]: messages }
        }));
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    },
    
    createSession: async (title, type = 'general', subjectId) => {
      const userId = get().userId;
      if (!userId) throw new Error('User not authenticated');
      
      const session: ChatSession = {
        id: `chat-${Date.now()}`,
        userId,
        title,
        type,
        subjectId,
        metadata: {
          context: {
            activeAssignments: [],
            recentTopics: [],
            strugglingConcepts: [],
            masteredConcepts: [],
            currentGradeLevel: 10,
            subjects: []
          },
          tags: []
        },
        isActive: true,
        lastActivityAt: new Date(),
        messageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save to DB
      await chatDBService.saveSession(session, userId);
      
      // Update state
      set(state => ({
        sessions: [...state.sessions, session],
        activeSession: session,
        messages: { ...state.messages, [session.id]: [] }
      }));
      
      return session;
    },
    
    setActiveSession: async (sessionId) => {
      const session = get().sessions.find(s => s.id === sessionId);
      if (session) {
        set({ activeSession: session });
        
        // Load messages if not already loaded
        if (!get().messages[sessionId]) {
          await get().loadMessages(sessionId);
        }
      }
    },
    
    deleteSession: async (sessionId) => {
      try {
        await chatDBService.deleteSession(sessionId);
        
        set(state => {
          const { [sessionId]: _, ...remainingMessages } = state.messages;
          return {
            sessions: state.sessions.filter(s => s.id !== sessionId),
            activeSession: state.activeSession?.id === sessionId ? null : state.activeSession,
            messages: remainingMessages
          };
        });
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    },
    
    sendMessage: async (sessionId, content, attachments = [], debugInfo) => {
      const userId = get().userId;
      if (!userId) throw new Error('User not authenticated');
      
      const message: ChatMessage = {
        id: Date.now().toString(),
        sessionId,
        content,
        role: 'user',
        status: 'sending',
        attachments: attachments || [],
        metadata: debugInfo ? { debug: debugInfo } : {},
        isEdited: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Update state immediately
      set(state => ({
        messages: {
          ...state.messages,
          [sessionId]: [...(state.messages[sessionId] || []), message]
        }
      }));
      
      // Save to DB
      await chatDBService.saveMessage(message, userId);
      
      // Update message status
      setTimeout(async () => {
        const updatedMessage = { ...message, status: 'sent' as const };
        await chatDBService.updateMessage(message.id, { status: 'sent' });
        
        set(state => ({
          messages: {
            ...state.messages,
            [sessionId]: state.messages[sessionId].map(m =>
              m.id === message.id ? updatedMessage : m
            )
          }
        }));
      }, 100);
      
      // Update session
      await chatDBService.updateSession(sessionId, {
        lastActivityAt: new Date(),
        messageCount: get().sessions.find(s => s.id === sessionId)?.messageCount! + 1,
        updatedAt: new Date()
      });
      
      set(state => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId
            ? {
                ...s,
                lastActivityAt: new Date(),
                messageCount: s.messageCount + 1,
                updatedAt: new Date()
              }
            : s
        )
      }));
    },
    
    addAIResponse: async (sessionId, content, thinking, debugInfo) => {
      const userId = get().userId;
      if (!userId) throw new Error('User not authenticated');
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        sessionId,
        content,
        role: 'assistant',
        status: 'delivered',
        attachments: [],
        metadata: {
          thinking,
          ...(debugInfo && { debug: debugInfo })
        },
        isEdited: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Update state
      set(state => ({
        messages: {
          ...state.messages,
          [sessionId]: [...(state.messages[sessionId] || []), aiMessage]
        }
      }));
      
      // Save to DB
      await chatDBService.saveMessage(aiMessage, userId);
      
      // Update session
      await chatDBService.updateSession(sessionId, {
        lastActivityAt: new Date(),
        messageCount: get().sessions.find(s => s.id === sessionId)?.messageCount! + 1,
        updatedAt: new Date()
      });
      
      set(state => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId
            ? {
                ...s,
                lastActivityAt: new Date(),
                messageCount: s.messageCount + 1,
                updatedAt: new Date()
              }
            : s
        )
      }));
    },
    
    updateMessageStatus: async (sessionId, messageId, status) => {
      await chatDBService.updateMessage(messageId, { status });
      
      set(state => ({
        messages: {
          ...state.messages,
          [sessionId]: state.messages[sessionId].map(msg =>
            msg.id === messageId ? { ...msg, status } : msg
          )
        }
      }));
    },
    
    saveToNotebook: async (messageId) => {
      const { activeSession, messages } = get();
      if (!activeSession) return;
      
      const sessionMessages = messages[activeSession.id] || [];
      const message = sessionMessages.find(m => m.id === messageId);
      
      if (message) {
        // Update message metadata
        await chatDBService.updateMessage(messageId, {
          metadata: { ...message.metadata, isSavedToNotebook: true }
        });
        
        // Update state
        set(state => ({
          messages: {
            ...state.messages,
            [activeSession.id]: state.messages[activeSession.id].map(msg =>
              msg.id === messageId 
                ? { 
                    ...msg, 
                    metadata: { 
                      ...msg.metadata, 
                      isSavedToNotebook: true 
                    } 
                  } 
                : msg
            )
          }
        }));
      }
    },
    
    clearChat: async (sessionId) => {
      const userId = get().userId;
      if (!userId) return;
      
      // Delete all messages for this session
      const messagesToDelete = get().messages[sessionId] || [];
      await Promise.all(
        messagesToDelete.map(msg => chatDBService.deleteMessage(msg.id))
      );
      
      set(state => ({
        messages: { ...state.messages, [sessionId]: [] }
      }));
    },
    
    searchMessages: async (query) => {
      const userId = get().userId;
      if (!userId) return [];
      
      return chatDBService.searchMessages(userId, query);
    },
    
    getRecentSessions: (limit = 10) => {
      return get().sessions
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, limit);
    },
    
    setIsTyping: (typing) => {
      set({ isTyping: typing });
    },
    
    migrateFromLocalStorage: async () => {
      try {
        const userId = get().userId;
        if (!userId) return;
        
        // Check if we already have data in Dexie
        const existingCount = await db.chatMessages.count();
        if (existingCount > 0) {
          console.log('Data already migrated');
          return;
        }
        
        // Get data from localStorage
        const localData = localStorage.getItem('skooledin-chat');
        if (!localData) return;
        
        const parsed = JSON.parse(localData);
        await chatDBService.importFromLocalStorage(parsed, userId);
        
        // Clear localStorage after successful migration
        localStorage.removeItem('skooledin-chat');
        console.log('Migration completed successfully');
        
        // Reload sessions
        await get().loadSessions(userId);
      } catch (error) {
        console.error('Migration failed:', error);
      }
    }
  }))
);