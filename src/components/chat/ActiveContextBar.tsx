import { BookOpen, FileText, Brain, X } from 'lucide-react';
import type { MessageAttachment } from '@/types';

interface ActiveContextBarProps {
  subject: string;
  attachments: MessageAttachment[];
  notebookCount?: number;
  onRemoveAttachment?: (id: string) => void;
}

export function ActiveContextBar({ 
  subject, 
  attachments, 
  notebookCount = 0,
  onRemoveAttachment 
}: ActiveContextBarProps) {
  if (subject === 'All Subjects' && attachments.length === 0 && notebookCount === 0) {
    return null;
  }

  return (
    <div className="bg-purple-50 border-b border-purple-200 px-4 py-2">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-purple-900">Active Context:</span>
        </div>
        
        {subject !== 'All Subjects' && (
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full">
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-purple-900">{subject}</span>
          </div>
        )}
        
        {attachments.map(attachment => (
          <div 
            key={attachment.id}
            className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full"
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-purple-900">{attachment.title}</span>
            {onRemoveAttachment && (
              <button
                onClick={() => onRemoveAttachment(attachment.id)}
                className="ml-1 hover:bg-purple-100 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        
        {notebookCount > 0 && (
          <div className="flex items-center gap-1.5 text-purple-700">
            <span className="text-xs">+{notebookCount} notebook entries</span>
          </div>
        )}
      </div>
    </div>
  );
}