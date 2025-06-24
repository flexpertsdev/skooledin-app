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
  File,
  Bug,
  Check,
  X,
  Save,
  Copy
} from 'lucide-react';
import { Button } from '@components/common/Button';
import { VoiceRecorder } from '@components/chat/VoiceRecorder';
import { AttachmentPicker } from '@components/chat/AttachmentPicker';
import { AttachmentChip } from '@components/chat/AttachmentChip';
import { ActiveContextBar } from '@components/chat/ActiveContextBar';
import { SaveMessagesModal } from '@components/chat/SaveMessagesModal';
import { useChatStore } from '@stores/chat.store';
import { useNotebookStore } from '@stores/notebook.store.dexie';
import { useAuthStore } from '@stores/auth';
import { useContextStore } from '@stores/context.store';
// Choose between Firebase and Netlify implementations
// import { anthropicService } from '@/services/ai/anthropic.service'; // Firebase Cloud Functions
import { netlifyAnthropicService as anthropicService } from '@/services/ai/netlify-anthropic.service'; // Netlify Functions
import type { ChatMessage, MessageAttachment } from '@types';

export function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [showSaveModal, setShowSaveModal] = useState(false);
  
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
    saveToNotebook,
    setIsTyping
  } = useChatStore();
  
  const { createEntry: addNotebookEntry } = useNotebookStore();
  
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
    
    // Get recent messages for context (last 5)
    const recentMessages = chatMessages.slice(-5).map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt
    }));
    
    // Build context message
    let contextualMessage = message;
    if (currentContext.type !== 'all') {
      contextualMessage = `[Context: ${currentContext.name} - ${currentContext.type}]\n${message}`;
    }
    
    // Store debug info
    const debugInfo = {
      sentContext: contextualMessage,
      subject: currentContext.name,
      type: currentContext.type,
      messageCount: recentMessages.length,
      timestamp: new Date().toISOString()
    };
    
    // Send user message with debug info
    await sendMessage(activeSession.id, message, attachments, debugMode ? debugInfo : undefined);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Get AI response from Anthropic via Cloud Function
      const { content, metadata } = await anthropicService.chatWithContext({
        message: contextualMessage,
        attachments,
        sessionId: activeSession.id,
        recentMessages
      });
      
      // Add AI response with debug info
      addAIResponse(activeSession.id, content, metadata?.thinking, debugMode ? {
        ...debugInfo,
        responseMetadata: metadata
      } : undefined);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback response
      addAIResponse(
        activeSession.id, 
        "I'm having trouble connecting right now. Please try again in a moment.",
        {
          steps: [],
          duration: 0,
          complexity: 'simple',
          approach: 'Error response'
        }
      );
    } finally {
      setIsTyping(false);
    }
    
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
      visibility: 'private'
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

  const toggleMessageSelection = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const selectAllMessages = () => {
    const allMessageIds = new Set(chatMessages.map(m => m.id));
    setSelectedMessages(allMessageIds);
  };

  const clearSelection = () => {
    setSelectedMessages(new Set());
    setSelectionMode(false);
  };

  const handleSaveSelectedToNotebook = async (options: any) => {
    const messagesToSave = chatMessages.filter(m => selectedMessages.has(m.id));
    if (messagesToSave.length === 0) return;

    const { createFromMessages, generateStudyGuide, createEntry } = useNotebookStore.getState();
    
    if (options.type === 'study-guide') {
      await generateStudyGuide({
        topic: options.title,
        type: 'summary',
        subjectId: activeSession?.subjectId || '',
        gradeLevel: 10,
        depth: 'intermediate'
      });
    } else if (options.type === 'summary') {
      // Create AI-generated summary
      const content = messagesToSave.map(msg => {
        const role = msg.role === 'user' ? 'You' : 'AI';
        return `${role}: ${msg.content}`;
      }).join('\n\n');
      
      await createEntry({
        title: options.title,
        content: `# Summary\n\n${content}\n\n## Key Points\n\n[AI will generate key points]`,
        type: 'summary',
        format: 'markdown',
        subjectId: activeSession?.subjectId,
        metadata: {
          isAIGenerated: true,
          sourceType: 'chat',
          studyCount: 0,
          isFavorite: false,
          isArchived: false
        }
      });
    } else {
      // Raw chat format
      messagesToSave.map((msg) => {
        const role = msg.role === 'user' ? '👤 **You**' : '🤖 **Assistant**';
        const parts = [role];
        
        if (options.includeTimestamps) {
          parts.push(`- ${new Date(msg.createdAt).toLocaleString()}`);
        }
        
        let messageContent = `\n\n${msg.content}`;
        
        if (options.includeMetadata && msg.role === 'assistant' && msg.metadata.thinking) {
          messageContent += `\n\n> **AI Thinking:** ${msg.metadata.thinking.approach} (${msg.metadata.thinking.complexity})`;
        }
        
        return `### ${parts.join(' ')}${messageContent}`;
      }).join('\n\n---\n\n');
      
      await createFromMessages(messagesToSave, {
        sourceType: 'chat',
        isAIGenerated: false,
        studyCount: 0,
        isFavorite: false,
        isArchived: false
      });
    }

    clearSelection();
    setShowSaveModal(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectionMode ? (
            <>
              <button
                onClick={clearSelection}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
              <div>
                <h2 className="font-semibold">{selectedMessages.size} Selected</h2>
                <button
                  onClick={selectAllMessages}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  Select All
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold">AI Tutor</h2>
                <p className="text-xs text-gray-600">
                  {currentContext.type === 'all' ? 'All Subjects' : currentContext.name}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectionMode ? (
            <>
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={selectedMessages.size === 0}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Save to Notebook"
              >
                <Save size={20} />
              </button>
              <button
                onClick={() => {
                  const messagesToCopy = chatMessages
                    .filter(m => selectedMessages.has(m.id))
                    .map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`)
                    .join('\n\n');
                  navigator.clipboard.writeText(messagesToCopy);
                }}
                disabled={selectedMessages.size === 0}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Copy Messages"
              >
                <Copy size={20} />
              </button>
            </>
          ) : (
            <>
              {chatMessages.length > 0 && (
                <button 
                  onClick={() => setSelectionMode(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Select messages"
                >
                  <Check size={20} />
                </button>
              )}
              <button 
                onClick={() => setDebugMode(!debugMode)}
                className={`p-2 hover:bg-gray-100 rounded-lg ${debugMode ? 'bg-purple-100 text-purple-600' : ''}`}
                title="Toggle debug mode"
              >
                <Bug size={20} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Active Context Bar */}
      <ActiveContextBar
        subject={currentContext.name}
        attachments={attachments}
        onRemoveAttachment={removeAttachment}
      />

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
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-3 ${
                  selectionMode ? 'cursor-pointer' : ''
                }`}
                onClick={() => selectionMode && toggleMessageSelection(message.id)}
              >
                {selectionMode && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedMessages.has(message.id)}
                      onChange={() => toggleMessageSelection(message.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                  </div>
                )}
                
                {message.role === 'assistant' && !selectionMode && (
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
                      
                      {/* Debug Info */}
                      {debugMode && message.metadata.debug && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                          <div className="text-gray-600 mb-1">🐛 Debug Info:</div>
                          <div className="text-gray-700">
                            <div>Context sent: {message.metadata.debug.sentContext?.split('\n')[0]}</div>
                            <div>Subject: {message.metadata.debug.subject}</div>
                            <div>Type: {message.metadata.debug.type}</div>
                            <div>Messages included: {message.metadata.debug.messageCount}</div>
                            {message.metadata.debug.responseMetadata && (
                              <div>Approach: {message.metadata.debug.responseMetadata.thinking?.approach}</div>
                            )}
                          </div>
                        </div>
                      )}
                      
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
                
                {message.role === 'user' && !selectionMode && (
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

      {/* Save Messages Modal */}
      <SaveMessagesModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        messages={chatMessages.filter(m => selectedMessages.has(m.id))}
        onSave={handleSaveSelectedToNotebook}
      />
    </div>
  );
}