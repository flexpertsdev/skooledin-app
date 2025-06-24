import { useState, useEffect, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useForm, Controller } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Save, X, Eye, EyeOff, Clock } from 'lucide-react';
import { Button } from '@components/common/Button';
import { useNotebookStore } from '@stores/notebook.store.dexie';
import type { NotebookEntry, NotebookMetadata, NotebookTemplate } from '@/types';
import 'katex/dist/katex.min.css';

interface NotebookEditorProps {
  entry?: NotebookEntry;
  onSave?: (content: string, metadata: NotebookMetadata) => Promise<void>;
  onClose?: () => void;
  mode: 'create' | 'edit';
  initialContent?: string;
  template?: NotebookTemplate;
}

interface FormData {
  title: string;
  content: string;
  subjectId: string;
  type: NotebookEntry['type'];
  tags: string;
}

export function NotebookEditor({
  entry,
  onSave,
  onClose,
  mode,
  initialContent = '',
  template
}: NotebookEditorProps) {
  const [content, setContent] = useState(initialContent || entry?.content || '');
  const [preview, setPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const { createEntry, updateEntry } = useNotebookStore();
  
  // Subject list - TODO: Move to a shared constants file
  const subjects = [
    { id: 'general', name: 'General' },
    { id: 'math', name: 'Mathematics' },
    { id: 'science', name: 'Science' },
    { id: 'english', name: 'English' },
    { id: 'history', name: 'History' },
    { id: 'spanish', name: 'Spanish' },
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'biology', name: 'Biology' }
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>({
    defaultValues: {
      title: entry?.title || '',
      content: content,
      subjectId: entry?.subjectId || subjects[0]?.id || 'general',
      type: entry?.type || 'concept',
      tags: entry?.tags?.join(', ') || ''
    }
  });

  // Apply template if provided
  useEffect(() => {
    if (template && mode === 'create') {
      const templateContent = template.structure.sections
        .map(section => `## ${section.title}\n\n${section.prompt || ''}\n\n${section.defaultContent || ''}`)
        .join('\n\n---\n\n');
      setContent(templateContent);
      setValue('content', templateContent);
    }
  }, [template, mode, setValue]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (mode === 'edit' && entry && content !== entry.content) {
      try {
        await updateEntry(entry.id, { content, updatedAt: new Date() });
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  }, [mode, entry, content, updateEntry]);

  // Setup auto-save timer
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      autoSave();
    }, 30000); // 30 seconds

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [content]);

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const tags = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      const wordCount = data.content.split(/\s+/).length;

      if (mode === 'create') {
        const metadata: Partial<NotebookMetadata> = {
          isAIGenerated: false,
          sourceType: 'manual',
          wordCount,
          studyCount: 0,
          isFavorite: false,
          isArchived: false
        };

        if (onSave) {
          await onSave(data.content, {
            ...metadata,
            isAIGenerated: false,
            studyCount: 0,
            isFavorite: false,
            isArchived: false
          } as NotebookMetadata);
        } else {
          await createEntry({
            title: data.title,
            content: data.content,
            type: data.type,
            subjectId: data.subjectId,
            tags,
            metadata: {
              ...metadata,
              isAIGenerated: false,
              studyCount: 0,
              isFavorite: false,
              isArchived: false
            } as NotebookMetadata
          });
        }
      } else if (entry) {
        await updateEntry(entry.id, {
          title: data.title,
          content: data.content,
          type: data.type,
          subjectId: data.subjectId,
          tags,
          metadata: {
            ...entry.metadata,
            wordCount
          },
          updatedAt: new Date()
        });
      }

      if (onClose) onClose();
    } catch (error) {
      console.error('Failed to save notebook entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">
          {mode === 'create' ? 'Create Note' : 'Edit Note'}
        </h2>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreview(!preview)}
          >
            {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {preview ? 'Edit' : 'Preview'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 space-y-4 border-b">
          {/* Title */}
          <Controller
            name="title"
            control={control}
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <div>
                <input
                  {...field}
                  type="text"
                  placeholder="Note Title"
                  className="w-full text-xl font-semibold border-none outline-none focus:ring-0"
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>
            )}
          />

          {/* Metadata */}
          <div className="flex gap-4">
            <Controller
              name="subjectId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  {subjects.map((subject: any) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              )}
            />

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="concept">Concept</option>
                  <option value="formula">Formula</option>
                  <option value="vocabulary">Vocabulary</option>
                  <option value="summary">Summary</option>
                  <option value="practice">Practice</option>
                  <option value="example">Example</option>
                  <option value="outline">Outline</option>
                  <option value="reference">Reference</option>
                </select>
              )}
            />

            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Tags (comma separated)"
                  className="flex-1 px-3 py-1 border rounded-lg text-sm"
                />
              )}
            />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {preview ? (
            <div className="h-full overflow-y-auto p-4">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                className="prose prose-purple max-w-none"
                components={{
                  code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <pre className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-gray-100 px-1 py-0.5 rounded" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <MDEditor
              value={content}
              onChange={(val) => {
                setContent(val || '');
                setValue('content', val || '');
              }}
              preview="edit"
              height="100%"
              data-color-mode="light"
              visibleDragbar={false}
              commands={[
                // Custom toolbar commands can be added here
              ]}
              extraCommands={[
                // Extra commands can be added here
              ]}
              textareaProps={{
                placeholder: template 
                  ? 'Start writing based on the template...' 
                  : 'Start writing your note...\n\nSupports **Markdown**, LaTeX math ($x^2$), and code blocks.'
              }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {watch('content')?.split(/\s+/).length || 0} words
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}