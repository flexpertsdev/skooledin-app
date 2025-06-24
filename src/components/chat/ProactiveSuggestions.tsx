import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';
import { aiSuggestionService } from '@/services/ai/suggestion.service';
import { useNavigate } from 'react-router-dom';

interface ProactiveSuggestionsProps {
  messages: Array<{ role: string; content: string }>;
  currentTopic?: string;
  isMinimized?: boolean;
  onToggle?: () => void;
}

export function ProactiveSuggestions({ 
  messages, 
  currentTopic: _currentTopic,
  isMinimized = false,
  onToggle 
}: ProactiveSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Generate suggestions when messages change significantly
  useEffect(() => {
    const generateSuggestions = async () => {
      // Only generate if we have enough messages
      if (messages.length < 3) return;

      setIsLoading(true);
      try {
        const newSuggestions = await aiSuggestionService.analyzeConversation(messages);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Failed to generate suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce suggestion generation
    const timer = setTimeout(generateSuggestions, 2000);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleAction = (action: any) => {
    if (!action) return;

    switch (action.type) {
      case 'generate-guide':
        navigate('/notebook', { 
          state: { 
            showStudyGuide: true, 
            topic: action.data?.topic 
          } 
        });
        break;
      
      case 'create-note':
        navigate('/notebook', { 
          state: { 
            showCreate: true, 
            noteType: action.data?.type 
          } 
        });
        break;
      
      case 'ask-question':
        // Could implement a callback to parent to insert question
        break;
      
      case 'view-resource':
        if (action.data?.url) {
          window.open(action.data.url, '_blank');
        }
        break;
    }
  };

  const handleDismiss = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  if (suggestions.length === 0 && !isLoading) {
    return null;
  }

  if (isMinimized) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={onToggle}
        className="fixed bottom-20 right-4 bg-purple-600 text-white rounded-full p-3 shadow-lg hover:bg-purple-700 transition-colors"
      >
        <div className="relative">
          <Sparkles className="w-6 h-6" />
          {suggestions.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {suggestions.length}
            </span>
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed right-4 bottom-20 w-80 max-h-[60vh] bg-gray-50 rounded-xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">AI Suggestions</h3>
        </div>
        <div className="flex items-center gap-2">
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1 hover:bg-purple-700 rounded transition-colors"
              title="Minimize"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(60vh-80px)]">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing conversation...</span>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {suggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onAction={handleAction}
                onDismiss={handleDismiss}
              />
            ))}
          </AnimatePresence>
        )}

        {!isLoading && suggestions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No suggestions yet</p>
            <p className="text-xs mt-1">Keep chatting to get personalized tips!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}