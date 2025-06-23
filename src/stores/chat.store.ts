import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ChatMessage, 
  ChatSession, 
  StudyContext, 
  MessageAttachment,
  StructuredAIResponse 
} from '@types';
import { Subject } from '@types';

interface ChatState {
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  messages: Record<string, ChatMessage[]>; // chatId -> messages
  isTyping: boolean;
  studyContext: StudyContext;
  
  // Session Management
  createSession: (title: string, subject?: Subject) => ChatSession;
  setActiveSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  
  // Message Actions
  sendMessage: (content: string, attachments?: MessageAttachment[]) => Promise<void>;
  addMessage: (chatId: string, message: ChatMessage) => void;
  updateMessageStatus: (chatId: string, messageId: string, status: ChatMessage['status']) => void;
  
  // Context Management
  updateStudyContext: (context: Partial<StudyContext>) => void;
  addAttachment: (attachment: MessageAttachment) => void;
  removeAttachment: (attachmentId: string) => void;
  
  // Notebook Integration
  saveToNotebook: (messageId: string) => Promise<void>;
  
  // Utility
  clearChat: (chatId: string) => void;
  getRecentSessions: (limit?: number) => ChatSession[];
}

const defaultStudyContext: StudyContext = {
  activeAssignments: [],
  recentTopics: [],
  strugglingConcepts: [],
  masteredConcepts: [],
  currentGradeLevel: 9,
  subjects: []
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSession: null,
      messages: {},
      isTyping: false,
      studyContext: defaultStudyContext,
      
      createSession: (title, subject) => {
        const session: ChatSession = {
          id: `chat-${Date.now()}`,
          userId: 'current-user', // Would come from auth
          title,
          subject,
          createdAt: new Date(),
          updatedAt: new Date(),
          messageCount: 0,
          isActive: true
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
      
      sendMessage: async (content, attachments = []) => {
        const { activeSession, addMessage, updateStudyContext } = get();
        if (!activeSession) return;
        
        // Create user message
        const userMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          chatId: activeSession.id,
          content,
          type: 'user',
          timestamp: new Date(),
          status: 'sending',
          attachments
        };
        
        addMessage(activeSession.id, userMessage);
        set({ isTyping: true });
        
        try {
          // Update message status
          set(state => ({
            messages: {
              ...state.messages,
              [activeSession.id]: state.messages[activeSession.id].map(msg =>
                msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
              )
            }
          }));
          
          // Simulate AI response (would be replaced with actual AI service call)
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const aiResponse: ChatMessage = {
            id: `msg-${Date.now()}-ai`,
            chatId: activeSession.id,
            content: "I understand you're asking about [topic]. Let me guide you through this step by step...",
            type: 'ai',
            timestamp: new Date(),
            status: 'delivered',
            thinking: {
              concepts: [
                { name: 'Main Concept', importance: 'core', studentKnows: false }
              ],
              teachingStrategy: {
                method: 'step-by-step',
                reason: 'Breaking down complex topic'
              },
              studentLevel: {
                understanding: 70,
                confidence: 'medium',
                misconceptions: []
              },
              suggestedNotes: [
                {
                  title: 'Key Concept Summary',
                  type: 'concept',
                  importance: 'high'
                }
              ]
            }
          };
          
          addMessage(activeSession.id, aiResponse);
          
          // Update session
          set(state => ({
            sessions: state.sessions.map(s =>
              s.id === activeSession.id
                ? {
                    ...s,
                    updatedAt: new Date(),
                    lastMessage: content.substring(0, 50) + '...',
                    messageCount: s.messageCount + 2
                  }
                : s
            )
          }));
          
        } catch (error) {
          console.error('Failed to send message:', error);
          // Update message status to error
          set(state => ({
            messages: {
              ...state.messages,
              [activeSession.id]: state.messages[activeSession.id].map(msg =>
                msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
              )
            }
          }));
        } finally {
          set({ isTyping: false });
        }
      },
      
      addMessage: (chatId, message) => {
        set(state => ({
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), message]
          }
        }));
      },
      
      updateMessageStatus: (chatId, messageId, status) => {
        set(state => ({
          messages: {
            ...state.messages,
            [chatId]: state.messages[chatId].map(msg =>
              msg.id === messageId ? { ...msg, status } : msg
            )
          }
        }));
      },
      
      updateStudyContext: (context) => {
        set(state => ({
          studyContext: { ...state.studyContext, ...context }
        }));
      },
      
      addAttachment: (attachment) => {
        // This would be implemented when handling attachments
        console.log('Adding attachment:', attachment);
      },
      
      removeAttachment: (attachmentId) => {
        // This would be implemented when handling attachments
        console.log('Removing attachment:', attachmentId);
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
                msg.id === messageId ? { ...msg, savedToNotebook: true } : msg
              )
            }
          }));
        }
      },
      
      clearChat: (chatId) => {
        set(state => ({
          messages: { ...state.messages, [chatId]: [] }
        }));
      },
      
      getRecentSessions: (limit = 10) => {
        return get().sessions
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, limit);
      }
    }),
    {
      name: 'skooledin-chat',
      partialize: (state) => ({
        sessions: state.sessions,
        messages: state.messages,
        studyContext: state.studyContext
      })
    }
  )
);