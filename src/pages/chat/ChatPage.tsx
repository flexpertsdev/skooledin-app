import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MoreVertical, 
  Plus,
  BookOpen,
  Sparkles,
  Brain,
  Lightbulb,
  Calculator,
  FileText,
  Image,
  File
} from 'lucide-react';
import { Button } from '@components/common/Button';
import { VoiceRecorder } from '@components/chat/VoiceRecorder';
import { AttachmentPicker } from '@components/chat/AttachmentPicker';
import { AttachmentChip } from '@components/chat/AttachmentChip';
import { useChatStore } from '@stores/chat.store';
import { useNotebookStore } from '@stores/notebook.store';
import { useAuthStore } from '@stores/auth';
import { useContextStore } from '@stores/context.store';
import { aiService } from '../../services/ai.service';
import type { ChatMessage, MessageAttachment } from '@types';

export function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { user } = useAuthStore();
  const { currentContext } = useContextStore();
  const { 
    activeSession,
    messages,
    isTyping,
    createSession,
    sendMessage,
    addAIResponse,
    saveToNotebook
  } = useChatStore();
  
  const { addEntry: addNotebookEntry } = useNotebookStore();
  
  // Create or get active session
  useEffect(() => {
    if (!activeSession && user) {
      const subjectId = currentContext.type === 'subject' ? currentContext.metadata?.subjectId : undefined;
      createSession('AI Study Session', 'general', subjectId);
    }
  }, [activeSession, user, currentContext, createSession]);
  
  const chatMessages = activeSession ? messages[activeSession.id] || [] : [];
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);
  
  // Mock quick actions for now
  const quickActions = [
    { id: '1', label: 'Homework Help', prompt: 'I need help with my homework', icon: '📚' },
    { id: '2', label: 'Explain Concept', prompt: 'Can you explain', icon: '💡' },
    { id: '3', label: 'Practice Problems', prompt: 'I want to practice', icon: '✏️' },
    { id: '4', label: 'Exam Prep', prompt: 'Help me prepare for my exam', icon: '📝' }
  ];

  const handleSend = async () => {
    if (!inputValue.trim() || !activeSession) return;

    const message = inputValue.trim();
    setInputValue('');
    setShowQuickActions(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    if (!activeSession) return;
    
    // Send user message
    await sendMessage(activeSession.id, message, attachments);
    
    // Generate AI response
    const thinking = await aiService.generateThinking(message);
    const response = 'I understand you need help. Let me break this down for you...';
    
    // Add AI response
    addAIResponse(activeSession.id, response, thinking);
    setAttachments([]); // Clear attachments after sending
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMobile = window.innerWidth < 768;
    
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 144) + 'px';
  };
  
  const handleQuickAction = (action: any) => {
    setInputValue(action.prompt);
    setShowQuickActions(false);
    textareaRef.current?.focus();
  };
  
  const handleSaveToNotebook = async (message: ChatMessage) => {
    if (!activeSession?.subjectId) return;
    
    await addNotebookEntry({
      userId: user?.id || 'current-user',
      title: 'AI Generated Note',
      content: message.content,
      type: 'concept',
      format: 'markdown',
      subjectId: activeSession.subjectId,
      metadata: {
        isAIGenerated: true,
        sourceType: 'chat',
        sourceId: message.id,
        gradeLevel: 10,
        wordCount: message.content.split(' ').length,
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
    
    await saveToNotebook(message.id);
  };
  
  const getMessageIcon = (message: ChatMessage) => {
    if (message.role === 'user') return null;
    
    if (message.metadata.thinking?.approach === 'Step-by-step explanation with examples') {
      return <Calculator className="w-4 h-4" />;
    } else if (message.metadata.thinking?.complexity === 'complex') {
      return <Lightbulb className="w-4 h-4" />;
    }
    
    return <Brain className="w-4 h-4" />;
  };
  
  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold">AI Tutor</h2>
            <p className="text-xs text-gray-600">
              {activeSession?.subjectId || 'All Subjects'}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Hi {user?.name?.split(' ')[0]}! 👋
            </h2>
            <p className="text-gray-600 mb-6 max-w-sm">
              I'm your AI tutor. I can help you understand concepts, work through problems, 
              and prepare for tests. What would you like to learn today?
            </p>
            
            {/* Quick Start Topics */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
              {quickActions.slice(0, 4).map((action) => (
                <button 
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="p-3 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-colors text-left"
                >
                  <span className="text-xl mb-1">{action.icon}</span>
                  <span className="text-sm font-medium block">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getMessageIcon(message) || <Sparkles className="w-4 h-4 text-purple-600" />}
                  </div>
                )}
                
                <div
                  className={`message-bubble max-w-[70%] sm:max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                  }`}
                >
                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {message.attachments.map(att => (
                        <div 
                          key={att.id}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            message.role === 'user' 
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {att.type === 'notebook' && <BookOpen className="w-3 h-3" />}
                          {att.type === 'assignment' && <FileText className="w-3 h-3" />}
                          {att.type === 'image' && <Image className="w-3 h-3" />}
                          {att.type === 'document' && <File className="w-3 h-3" />}
                          <span>{att.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  
                  {/* AI Thinking Indicators */}
                  {message.role === 'assistant' && message.metadata.thinking && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {/* Confidence Level */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          message.metadata.thinking.complexity === 'simple' 
                            ? 'bg-green-500'
                            : message.metadata.thinking.complexity === 'moderate'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`} />
                        <span className="text-xs text-gray-500">
                          {message.metadata.thinking.complexity} complexity
                        </span>
                      </div>
                      
                      {/* Save to Notebook */}
                      {!message.metadata.isSavedToNotebook && (
                        <button
                          onClick={() => handleSaveToNotebook(message)}
                          className="flex items-center gap-2 text-xs text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          <BookOpen className="w-3 h-3" />
                          Save to Notebook
                        </button>
                      )}
                      
                      {message.metadata.isSavedToNotebook && (
                        <span className="flex items-center gap-2 text-xs text-green-600">
                          <BookOpen className="w-3 h-3" />
                          Saved to Notebook
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        
        {isTyping && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Actions */}
      {showQuickActions && chatMessages.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm whitespace-nowrap hover:border-purple-300 transition-colors"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Attached Context Bar */}
      {attachments.length > 0 && (
        <div className="bg-purple-50 border-t border-purple-200 px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            {attachments.map(att => (
              <AttachmentChip
                key={att.id}
                attachment={att}
                onRemove={removeAttachment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 pt-2 pb-3 safe-bottom">
        <div className="flex items-end gap-2">
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
            onClick={() => setShowAttachmentSheet(true)}
          >
            <Plus size={20} className="text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={attachments.length > 0 ? "Ask about the attached context..." : "Type a message..."}
              rows={1}
              className="w-full px-4 py-2.5 bg-gray-100 rounded-3xl resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-purple-500/20 min-h-[44px] max-h-[144px]"
              style={{ lineHeight: '1.5' }}
            />
          </div>
          
          {inputValue ? (
            <Button
              onClick={handleSend}
              size="sm"
              className="rounded-full min-h-[44px] min-w-[44px] p-0"
              disabled={isTyping}
            >
              <Send size={18} />
            </Button>
          ) : (
            <button 
              className="p-2.5 hover:bg-gray-100 rounded-full touch-manipulation min-h-[44px] min-w-[44px]"
              onClick={() => setIsRecording(true)}
            >
              <Mic size={20} className="text-gray-600" />
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          I'll guide you to find answers, not give them directly
        </p>
      </div>

      {/* Voice Recorder */}
      <VoiceRecorder 
        isRecording={isRecording}
        onStop={() => setIsRecording(false)}
        onSend={(duration) => {
          console.log('Voice note sent, duration:', duration);
          setIsRecording(false);
          const voiceMessage = `🎤 Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`;
          setInputValue(voiceMessage);
          handleSend();
        }}
      />

      {/* Attachment Picker */}
      <AttachmentPicker
        isOpen={showAttachmentSheet}
        onClose={() => setShowAttachmentSheet(false)}
        onSelect={(attachment) => {
          setAttachments([...attachments, attachment]);
          setShowAttachmentSheet(false);
        }}
        selectedAttachments={attachments}
      />
    </div>
  );
}