import { useState } from 'react';
import { X, Save, FileText, Brain, BookOpen } from 'lucide-react';
import { Button } from '@components/common/Button';
import type { ChatMessage } from '@types';

interface SaveMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSave: (options: SaveOptions) => Promise<void>;
}

interface SaveOptions {
  title: string;
  type: 'summary' | 'study-guide' | 'raw';
  includeTimestamps: boolean;
  includeMetadata: boolean;
  combineConsecutive: boolean;
}

export function SaveMessagesModal({ isOpen, onClose, messages, onSave }: SaveMessagesModalProps) {
  const [title, setTitle] = useState(
    `Chat Session - ${new Date().toLocaleDateString()}`
  );
  const [saveType, setSaveType] = useState<'summary' | 'study-guide' | 'raw'>('raw');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [combineConsecutive, setCombineConsecutive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        title,
        type: saveType,
        includeTimestamps,
        includeMetadata,
        combineConsecutive
      });
      onClose();
    } catch (error) {
      console.error('Failed to save messages:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Save Messages to Notebook</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="Enter a title for your note"
            />
          </div>

          {/* Save Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Save As
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSaveType('raw')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  saveType === 'raw'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Raw Chat</span>
              </button>
              <button
                onClick={() => setSaveType('summary')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  saveType === 'summary'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Brain className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Summary</span>
              </button>
              <button
                onClick={() => setSaveType('study-guide')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  saveType === 'study-guide'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BookOpen className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">Study Guide</span>
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTimestamps}
                onChange={(e) => setIncludeTimestamps(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Include timestamps</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Include AI thinking process</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={combineConsecutive}
                onChange={(e) => setCombineConsecutive(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                Combine consecutive messages from same sender
              </span>
            </label>
          </div>

          {/* Message Count */}
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <p>{messages.length} messages will be saved</p>
            {saveType === 'summary' && (
              <p className="text-xs mt-1">AI will generate a concise summary</p>
            )}
            {saveType === 'study-guide' && (
              <p className="text-xs mt-1">AI will create a structured study guide</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2"
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save to Notebook</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}