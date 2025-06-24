import { useState, useCallback } from 'react';
import { X, Camera, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@components/common/Button';
import { useNotebookStore } from '@stores/notebook.store.dexie';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoUploadModal({ isOpen, onClose }: PhotoUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      setError('Please select image files');
      return;
    }

    // Limit to 5 images
    const limitedFiles = imageFiles.slice(0, 5);
    setFiles(limitedFiles);
    setError(null);

    // Create previews
    const newPreviews: string[] = [];
    limitedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === limitedFiles.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // For now, create a placeholder entry
      // In a real implementation, this would use Google Vision API or similar
      const content = `# Photo Notes\n\n*Processing ${files.length} image(s)...*\n\n` +
        `Images uploaded:\n${files.map(f => `- ${f.name}`).join('\n')}\n\n` +
        `*Note: OCR processing will be implemented in the next phase.*`;

      await createEntry({
        title: `Photos: ${new Date().toLocaleDateString()}`,
        content,
        type: 'reference',
        format: 'markdown',
        metadata: {
          isAIGenerated: false,
          sourceType: 'scan',
          studyCount: 0,
          isFavorite: false,
          isArchived: false,
          wordCount: content.split(' ').length
        },
        tags: ['photo', 'ocr'],
        attachments: [],
        annotations: [],
        status: 'complete',
        visibility: 'private'
      });

      onClose();
    } catch (err) {
      console.error('Photo processing error:', err);
      setError('Failed to process photos');
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Upload Photos</h2>
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
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            
            <div className="space-y-2">
              <Camera className="w-12 h-12 mx-auto text-gray-400" />
              <p className="font-medium">Drop photos here or click to browse</p>
              <p className="text-sm text-gray-600">
                Upload up to 5 images • JPG, PNG, or HEIC
              </p>
            </div>
          </div>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Selected Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {files[index].name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Coming Soon:</strong> OCR (Optical Character Recognition) will extract text from your photos. 
              For now, photos will be saved as references in your notebook.
            </p>
          </div>

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
            disabled={files.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ImageIcon size={16} />
                <span>Save Photos</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}