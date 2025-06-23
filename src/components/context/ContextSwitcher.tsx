import { ChevronDown } from 'lucide-react';
import { useAuthStore } from '@stores/auth';
import { useState } from 'react';
import type { Context } from '@types';

export function ContextSwitcher() {
  const { currentContext, setContext } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  // Mock contexts - replace with API call
  const contexts: Context[] = [
    { id: 'all', type: 'all', name: 'All Subjects', icon: '📚' },
    { id: 'math', type: 'subject', name: 'Mathematics', icon: '🔢', color: '#3b82f6' },
    { id: 'science', type: 'subject', name: 'Science', icon: '🔬', color: '#10b981' },
    { id: 'english', type: 'subject', name: 'English', icon: '📖', color: '#f59e0b' },
    { id: 'history', type: 'subject', name: 'History', icon: '🏛️', color: '#a78bfa' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-brand-light border border-brand-primary/20 rounded-xl text-brand-primary font-medium hover:bg-brand-primary/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentContext.icon}</span>
          <span>{currentContext.name}</span>
        </div>
        <ChevronDown 
          size={20} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-20">
            {contexts.map((context) => (
              <button
                key={context.id}
                onClick={() => {
                  setContext(context);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left
                  ${currentContext.id === context.id ? 'bg-brand-light' : ''}
                `}
              >
                <span className="text-lg">{context.icon}</span>
                <span className="font-medium text-gray-900">{context.name}</span>
                {currentContext.id === context.id && (
                  <span className="ml-auto text-brand-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}