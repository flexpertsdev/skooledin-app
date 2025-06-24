import { useState } from 'react';
import { X, BookOpen, FileText, Sparkles, Calculator, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotebookEditor } from './NotebookEditor';
import { notebookTemplates } from '@/data/notebook-templates';
import { Button } from '@components/common/Button';
import type { NotebookTemplate } from '@/types';

interface CreateNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
}

export function CreateNotebookModal({ isOpen, onClose, initialContent }: CreateNotebookModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<NotebookTemplate | undefined>();
  const [showEditor, setShowEditor] = useState(false);

  const handleTemplateSelect = (template: NotebookTemplate) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleStartBlank = () => {
    setSelectedTemplate(undefined);
    setShowEditor(true);
  };

  const handleClose = () => {
    setShowEditor(false);
    setSelectedTemplate(undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute inset-4 md:inset-10 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          {showEditor ? (
            <NotebookEditor
              mode="create"
              template={selectedTemplate}
              initialContent={initialContent}
              onClose={handleClose}
            />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Create New Note</h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                  {/* Start Blank */}
                  <div className="mb-8">
                    <Button
                      onClick={handleStartBlank}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Start with Blank Note
                    </Button>
                  </div>

                  {/* Templates */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Or choose a template:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.values(notebookTemplates).map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all text-left group"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getTemplateColor(template.type)}`}>
                              {getTemplateIcon(template.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-purple-700">
                                {template.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {template.description}
                              </p>
                              <div className="flex gap-2 mt-2">
                                {template.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function getTemplateIcon(type: string) {
  const icons: Record<string, React.ReactElement> = {
    outline: <BookOpen className="w-5 h-5" />,
    practice: <FileText className="w-5 h-5" />,
    mindmap: <Sparkles className="w-5 h-5" />,
    formula: <Calculator className="w-5 h-5" />,
    vocabulary: <Languages className="w-5 h-5" />
  };
  return icons[type] || <FileText className="w-5 h-5" />;
}

function getTemplateColor(type: string) {
  const colors: Record<string, string> = {
    outline: 'bg-blue-100 text-blue-600',
    practice: 'bg-green-100 text-green-600',
    mindmap: 'bg-purple-100 text-purple-600',
    formula: 'bg-orange-100 text-orange-600',
    vocabulary: 'bg-pink-100 text-pink-600'
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
}