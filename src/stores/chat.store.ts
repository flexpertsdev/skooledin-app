import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  ChatMessage, 
  ChatSession, 
  MessageAttachment,
  AIThinking
} from '@types';

interface ChatState {
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  messages: Record<string, ChatMessage[]>; // sessionId -> messages
  isTyping: boolean;
  
  // Session Management
  createSession: (title: string, type?: ChatSession['type'], subjectId?: string) => ChatSession;
  setActiveSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  
  // Message Actions
  sendMessage: (sessionId: string, content: string, attachments?: MessageAttachment[]) => Promise<void>;
  addAIResponse: (sessionId: string, content: string, thinking?: AIThinking) => void;
  updateMessageStatus: (sessionId: string, messageId: string, status: ChatMessage['status']) => void;
  
  // Notebook Integration
  saveToNotebook: (messageId: string) => Promise<void>;
  
  // Utility
  clearChat: (sessionId: string) => void;
  getRecentSessions: (limit?: number) => ChatSession[];
  setIsTyping: (typing: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [
        {
          id: 'general',
          userId: 'current-user',
          title: 'General Chat',
          type: 'general',
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
          messageCount: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      activeSession: null,
      messages: {
        general: [
          {
            id: '1',
            sessionId: 'general',
            content: "Hello! I'm your AI study buddy. How can I help you today?",
            role: 'assistant',
            status: 'delivered',
            attachments: [],
            metadata: {},
            isEdited: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5),
            updatedAt: new Date(Date.now() - 1000 * 60 * 5)
          }
        ]
      },
      isTyping: false,
      
      createSession: (title, type = 'general', subjectId) => {
        const session: ChatSession = {
          id: `chat-${Date.now()}`,
          userId: 'current-user',
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
        
        set(state => ({
          sessions: [...state.sessions, session],
          activeSession: session,
          messages: { ...state.messages, [session.id]: [] }
        }));
        
        return session;
      },
      
      setActiveSession: (sessionId) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (session) {
          set({ activeSession: session });
        }
      },
      
      deleteSession: (sessionId) => {
        set(state => {
          const { [sessionId]: _, ...remainingMessages } = state.messages;
          return {
            sessions: state.sessions.filter(s => s.id !== sessionId),
            activeSession: state.activeSession?.id === sessionId ? null : state.activeSession,
            messages: remainingMessages
          };
        });
      },
      
      sendMessage: async (sessionId, content, attachments = []) => {
        const message: ChatMessage = {
          id: Date.now().toString(),
          sessionId,
          content,
          role: 'user',
          status: 'sending',
          attachments: attachments || [],
          metadata: {},
          isEdited: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set(state => ({
          messages: {
            ...state.messages,
            [sessionId]: [...(state.messages[sessionId] || []), message]
          }
        }));
        
        // Update message status to sent
        setTimeout(() => {
          set(state => ({
            messages: {
              ...state.messages,
              [sessionId]: state.messages[sessionId].map(m =>
                m.id === message.id ? { ...m, status: 'sent' as const } : m
              )
            }
          }));
        }, 100);
        
        // Update session
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
      
      addAIResponse: (sessionId, content, thinking) => {
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          sessionId,
          content,
          role: 'assistant',
          status: 'delivered',
          attachments: [],
          metadata: {
            thinking
          },
          isEdited: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set(state => ({
          messages: {
            ...state.messages,
            [sessionId]: [...(state.messages[sessionId] || []), aiMessage]
          }
        }));
        
        // Update session
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
      
      updateMessageStatus: (sessionId, messageId, status) => {
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
          // Mark message as saved
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
      
      clearChat: (sessionId) => {
        set(state => ({
          messages: { ...state.messages, [sessionId]: [] }
        }));
      },
      
      getRecentSessions: (limit = 10) => {
        return get().sessions
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, limit);
      },
      
      setIsTyping: (typing) => {
        set({ isTyping: typing });
      }
    }),
    {
      name: 'skooledin-chat',
      partialize: (state) => ({
        sessions: state.sessions,
        messages: state.messages
      })
    }
  )
);