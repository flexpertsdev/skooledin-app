import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MoreVertical, Camera, File, Image, MapPin, User, X } from 'lucide-react';
import { Button } from '@components/common/Button';
import { VoiceRecorder } from '@components/chat/VoiceRecorder';
import type { ChatMessage } from '@types';

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI tutor. I see you have a math assignment on quadratic equations. Would you like help understanding the concepts or working through specific problems?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand you need help with that. Let me break it down for you step by step...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Desktop: Shift+Enter for new line, Enter to send
    // Mobile: Enter for new line, send button to send
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
    textarea.style.height = Math.min(textarea.scrollHeight, 144) + 'px'; // Max ~6 lines
  };

  const attachmentOptions = [
    { icon: Camera, label: 'Camera', color: 'text-pink-600' },
    { icon: Image, label: 'Gallery', color: 'text-purple-600' },
    { icon: File, label: 'Document', color: 'text-blue-600' },
    { icon: MapPin, label: 'Location', color: 'text-green-600' },
    { icon: User, label: 'Contact', color: 'text-orange-600' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h2 className="font-semibold">AI Tutor</h2>
            <p className="text-xs text-gray-600">Always here to help</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`message-bubble max-w-[70%] sm:max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-brand-primary text-white rounded-br-md'
                  : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-white/70' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
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

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 pt-2 pb-3 safe-bottom">
        <div className="flex items-end gap-2">
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg touch-manipulation"
            onClick={() => setShowAttachmentSheet(true)}
          >
            <Paperclip size={20} className="text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2.5 bg-gray-100 rounded-3xl resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-brand-primary/20 min-h-[44px] max-h-[144px]"
              style={{ lineHeight: '1.5' }}
            />
          </div>
          
          {inputValue ? (
            <Button
              onClick={handleSend}
              size="sm"
              className="rounded-full min-h-[44px] min-w-[44px] p-0"
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
      </div>

      {/* Voice Recorder */}
      <VoiceRecorder 
        isRecording={isRecording}
        onStop={() => setIsRecording(false)}
        onSend={(duration) => {
          console.log('Voice note sent, duration:', duration);
          setIsRecording(false);
          // Here you would handle the voice recording
          const voiceMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: `🎤 Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, voiceMessage]);
        }}
      />

      {/* Attachment Sheet */}
      {showAttachmentSheet && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setShowAttachmentSheet(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up safe-bottom">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Send</h3>
                <button
                  onClick={() => setShowAttachmentSheet(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {attachmentOptions.map(({ icon: Icon, label, color }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center gap-3 p-4 hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => {
                      console.log(`${label} clicked`);
                      setShowAttachmentSheet(false);
                    }}
                  >
                    <div className={`w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center ${color}`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-sm text-gray-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}