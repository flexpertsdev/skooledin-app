import { X, BookOpen, FileText, Image, File } from 'lucide-react';
import type { MessageAttachment } from '@types';

interface AttachmentChipProps {
  attachment: MessageAttachment;
  onRemove?: (id: string) => void;
  variant?: 'default' | 'compact';
  showRemove?: boolean;
}

export function AttachmentChip({ 
  attachment, 
  onRemove,
  variant = 'default',
  showRemove = true
}: AttachmentChipProps) {
  const getIcon = () => {
    switch (attachment.type) {
      case 'notebook':
        return <BookOpen className="w-4 h-4" />;
      case 'assignment':
        return <FileText className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'document':
        return <File className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };
  
  const getColor = () => {
    switch (attachment.type) {
      case 'notebook':
        return 'text-purple-600 bg-purple-100';
      case 'assignment':
        return 'text-blue-600 bg-blue-100';
      case 'image':
        return 'text-green-600 bg-green-100';
      case 'document':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
        {getIcon()}
        <span className="text-gray-700">{attachment.title}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
      <div className={`p-1.5 rounded ${getColor()}`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {attachment.title}
        </p>
        {attachment.preview && (
          <p className="text-xs text-gray-500 truncate">
            {attachment.preview}
          </p>
        )}
      </div>
      {showRemove && onRemove && (
        <button
          onClick={() => onRemove(attachment.id)}
          className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-3 h-3 text-gray-500" />
        </button>
      )}
    </div>
  );
}