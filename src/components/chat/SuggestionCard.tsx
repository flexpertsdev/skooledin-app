import { motion } from 'framer-motion';
import { Sparkles, BookOpen, HelpCircle, Link, Target, ChevronRight } from 'lucide-react';
import { Button } from '@components/common/Button';

interface SuggestionCardProps {
  suggestion: {
    id: string;
    type: 'topic' | 'question' | 'clarification' | 'resource' | 'practice';
    title: string;
    description: string;
    action?: {
      type: 'create-note' | 'generate-guide' | 'ask-question' | 'view-resource';
      data?: any;
    };
    priority: 'high' | 'medium' | 'low';
    context: string;
  };
  onAction: (action: any) => void;
  onDismiss: (id: string) => void;
}

export function SuggestionCard({ suggestion, onAction, onDismiss }: SuggestionCardProps) {
  const getIcon = () => {
    switch (suggestion.type) {
      case 'topic':
        return <BookOpen className="w-5 h-5" />;
      case 'question':
        return <HelpCircle className="w-5 h-5" />;
      case 'resource':
        return <Link className="w-5 h-5" />;
      case 'practice':
        return <Target className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (suggestion.type) {
      case 'topic':
        return 'bg-blue-100 text-blue-700';
      case 'question':
        return 'bg-purple-100 text-purple-700';
      case 'resource':
        return 'bg-green-100 text-green-700';
      case 'practice':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityBorder = () => {
    switch (suggestion.priority) {
      case 'high':
        return 'border-l-4 border-l-red-500';
      case 'medium':
        return 'border-l-4 border-l-yellow-500';
      default:
        return 'border-l-4 border-l-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`bg-white rounded-lg shadow-sm p-4 ${getPriorityBorder()}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getTypeColor()}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
          <p className="text-xs text-gray-500 italic mb-3">{suggestion.context}</p>
          
          <div className="flex items-center gap-2">
            {suggestion.action && (
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => onAction(suggestion.action)}
              >
                <span>Take Action</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDismiss(suggestion.id)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}