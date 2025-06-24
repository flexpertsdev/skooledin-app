import { useState, useCallback } from 'react';
import { X, Upload, FileText, Loader2, AlertCircle, Eye, BookOpen, Brain } from 'lucide-react';
import { Button } from '@components/common/Button';
import { useNotebookStore } from '@stores/notebook.store.dexie';
import { pdfProcessorService } from '@/services/pdf/pdf-processor.service';

interface PDFUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProcessingMode = 'extract' | 'summarize' | 'study-guide';

export function PDFUploadModal({ isOpen, onClose }: PDFUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('extract');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { createEntry } = useNotebookStore();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Process the PDF
      const result = await pdfProcessorService.processFile(
        file,
        processingMode,
        {
          maxPages: 20,
          includePageNumbers: true,
          preserveFormatting: true
        }
      );

      // Store preview for user review
      setPreview(result.content);

      // Create notebook entry
      const titleMap = {
        'extract': `PDF: ${file.name}`,
        'summarize': `Summary: ${file.name}`,
        'study-guide': `Study Guide: ${file.name}`
      };

      const typeMap = {
        'extract': 'reference' as const,
        'summarize': 'summary' as const,
        'study-guide': 'summary' as const
      };

      await createEntry({
        title: titleMap[processingMode],
        content: result.content,
        type: typeMap[processingMode],
        format: 'markdown',
        metadata: {
          isAIGenerated: processingMode !== 'extract',
          sourceType: 'scan',
          wordCount: result.metadata.wordCount,
          studyCount: 0,
          isFavorite: false,
          isArchived: false
        },
        tags: ['pdf', processingMode],
        attachments: [],
        annotations: [],
        status: 'complete',
        visibility: 'private'
      });

      onClose();
    } catch (err) {
      console.error('PDF processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Upload PDF Document</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!preview ? (
            <>
              {/* File Upload */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isProcessing}
                />
                
                {file ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-purple-600" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="font-medium">Drop your PDF here or click to browse</p>
                    <p className="text-sm text-gray-600">Maximum file size: 10MB</p>
                  </div>
                )}
              </div>

              {/* Processing Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you like to process this PDF?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setProcessingMode('extract')}
                    disabled={isProcessing}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      processingMode === 'extract'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Eye className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                    <h3 className="font-medium text-sm">Extract Text</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Keep original formatting
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setProcessingMode('summarize')}
                    disabled={isProcessing}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      processingMode === 'summarize'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <BookOpen className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                    <h3 className="font-medium text-sm">Summarize</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Key points & overview
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setProcessingMode('study-guide')}
                    disabled={isProcessing}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      processingMode === 'study-guide'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Brain className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                    <h3 className="font-medium text-sm">Study Guide</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Learning materials
                    </p>
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Your PDF will be processed using AI to extract and format the content.
                  The first 20 pages will be processed.
                </p>
              </div>
            </>
          ) : (
            /* Preview */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Preview</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreview(null)}
                >
                  Back to Upload
                </Button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{preview}</pre>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProcess}
            className="flex-1 flex items-center justify-center gap-2"
            disabled={!file || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Process PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}