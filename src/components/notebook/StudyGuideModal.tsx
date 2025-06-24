import { useState } from 'react';
import { X, BookOpen, Brain, FileText, HelpCircle, Map, Loader2 } from 'lucide-react';
import { Button } from '@components/common/Button';
import { useNotebookStore } from '@stores/notebook.store.dexie';
import { useContextStore } from '@stores/context.store';

interface StudyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
  chatContext?: string;
}

type StudyGuideType = 'outline' | 'flashcards' | 'summary' | 'practice_questions' | 'mind_map';
type Depth = 'basic' | 'intermediate' | 'advanced';

const typeInfo = {
  outline: {
    icon: FileText,
    name: 'Study Outline',
    description: 'Hierarchical overview of topics and subtopics'
  },
  flashcards: {
    icon: Brain,
    name: 'Flashcards',
    description: 'Question-answer cards for memorization'
  },
  summary: {
    icon: BookOpen,
    name: 'Summary',
    description: 'Comprehensive overview of key concepts'
  },
  practice_questions: {
    icon: HelpCircle,
    name: 'Practice Questions',
    description: 'Questions with detailed solutions'
  },
  mind_map: {
    icon: Map,
    name: 'Mind Map',
    description: 'Visual concept relationships'
  }
};

export function StudyGuideModal({ isOpen, onClose, initialTopic = '', chatContext }: StudyGuideModalProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [selectedType, setSelectedType] = useState<StudyGuideType>('summary');
  const [depth, setDepth] = useState<Depth>('intermediate');
  const [gradeLevel, setGradeLevel] = useState(10);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { generateStudyGuide } = useNotebookStore();
  const { currentContext } = useContextStore();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await generateStudyGuide({
        topic: topic.trim(),
        type: selectedType,
        subjectId: currentContext.type === 'subject' ? currentContext.metadata?.subjectId || '' : '',
        gradeLevel,
        depth,
        includeExamples
      });
      onClose();
    } catch (err) {
      setError('Failed to generate study guide. Please try again.');
      console.error('Study guide generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Generate Study Guide</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isGenerating}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to study?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis, World War II, Quadratic Equations"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              disabled={isGenerating}
            />
          </div>

          {/* Study Guide Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose study guide format
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.entries(typeInfo) as [StudyGuideType, typeof typeInfo[StudyGuideType]][]).map(([type, info]) => {
                const Icon = info.icon;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    disabled={isGenerating}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedType === type
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2 text-gray-700" />
                    <h3 className="font-medium text-sm">{info.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{info.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Depth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Depth Level
              </label>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value as Depth)}
                disabled={isGenerating}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
                disabled={isGenerating}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                {[...Array(13)].map((_, i) => (
                  <option key={i} value={i + 1}>Grade {i + 1}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Include Examples */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeExamples}
              onChange={(e) => setIncludeExamples(e.target.checked)}
              disabled={isGenerating}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Include examples and illustrations</span>
          </label>

          {/* Context Info */}
          {chatContext && (
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-700">
                <strong>Note:</strong> This study guide will incorporate context from your chat conversation.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            className="flex-1 flex items-center justify-center gap-2"
            disabled={isGenerating || !topic.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <BookOpen size={16} />
                <span>Generate Study Guide</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}