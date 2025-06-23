import { useState } from 'react';
import { 
  X, 
  BookOpen, 
  FileText, 
  Search,
  Clock,
  Star,
  Upload,
  ChevronRight
} from 'lucide-react';
import { useNotebookStore } from '@stores/notebook.store';
import type { MessageAttachment, NotebookEntry, Assignment } from '@types';
import { formatDistanceToNow } from 'date-fns';

interface AttachmentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (attachment: MessageAttachment) => void;
  selectedAttachments?: MessageAttachment[];
}

export function AttachmentPicker({ 
  isOpen, 
  onClose, 
  onSelect,
  selectedAttachments = []
}: AttachmentPickerProps) {
  const [activeTab, setActiveTab] = useState<'notebook' | 'assignments' | 'upload'>('notebook');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { entries, getRecentEntries, getFavorites } = useNotebookStore();
  
  // Filter notebook entries based on search
  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      entry.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });
  
  // Mock assignments for now
  const mockAssignments: Assignment[] = [
    {
      id: 'assignment-1',
      title: 'Quadratic Equations Practice',
      description: 'Complete problems 1-20 on page 145',
      classId: 'class-1',
      subjectId: 'math',
      teacherId: 'teacher-1',
      type: 'homework',
      instructions: 'Complete all problems showing your work',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      points: 50,
      attachments: [],
      settings: {
        allowLateSubmission: true,
        maxAttempts: 1,
        showAnswersAfterDue: true,
        requireProctoring: false,
        shuffleQuestions: false
      },
      status: 'active',
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const handleSelectNotebookEntry = (entry: NotebookEntry) => {
    const attachment: MessageAttachment = {
      id: `att-${Date.now()}`,
      type: 'notebook',
      resourceId: entry.id,
      title: entry.title,
      preview: entry.content.substring(0, 150) + '...',
      metadata: {}
    };
    onSelect(attachment);
  };
  
  const handleSelectAssignment = (assignment: Assignment) => {
    const attachment: MessageAttachment = {
      id: `att-${Date.now()}`,
      type: 'assignment',
      resourceId: assignment.id,
      title: assignment.title,
      preview: assignment.description,
      metadata: {}
    };
    onSelect(attachment);
  };
  
  const handleFileUpload = () => {
    // Placeholder for file upload
    console.log('File upload not implemented yet');
    onClose();
  };
  
  const isSelected = (resourceId: string) => {
    return selectedAttachments.some(att => att.resourceId === resourceId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up safe-bottom max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Attach Context</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('notebook')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'notebook'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-1" />
              Notebook
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'assignments'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Assignments
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'upload'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-1" />
              Upload
            </button>
          </div>
          
          {/* Search (for notebook and assignments) */}
          {activeTab !== 'upload' && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'notebook' ? 'notes' : 'assignments'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {activeTab === 'notebook' && (
            <div className="space-y-4">
              {/* Quick Access */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Quick Access</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Recent Notes</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {getRecentEntries(5).length}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Favorites</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {getFavorites().length}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Notes List */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">All Notes</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredEntries.map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => handleSelectNotebookEntry(entry)}
                      disabled={isSelected(entry.id)}
                      className={`w-full text-left p-3 border rounded-lg transition-colors ${
                        isSelected(entry.id)
                          ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                          : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          entry.type === 'concept' ? 'bg-purple-100 text-purple-600' :
                          entry.type === 'formula' ? 'bg-blue-100 text-blue-600' :
                          entry.type === 'vocabulary' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm text-gray-900 truncate">
                            {entry.title}
                          </h5>
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                            {entry.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {entry.subjectId}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(entry.updatedAt, { addSuffix: true })}
                            </span>
                            {entry.metadata.isFavorite && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'assignments' && (
            <div className="space-y-2">
              {mockAssignments.map(assignment => (
                <button
                  key={assignment.id}
                  onClick={() => handleSelectAssignment(assignment)}
                  disabled={isSelected(assignment.id)}
                  className={`w-full text-left p-3 border rounded-lg transition-colors ${
                    isSelected(assignment.id)
                      ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                      : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm text-gray-900">
                        {assignment.title}
                      </h5>
                      <p className="text-xs text-gray-600 mt-1">
                        {assignment.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {assignment.subjectId}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          Due {formatDistanceToNow(assignment.dueDate, { addSuffix: true })}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className={`text-xs font-medium ${
                          assignment.priority === 'high' ? 'text-red-600' :
                          assignment.priority === 'medium' ? 'text-orange-600' :
                          'text-gray-600'
                        }`}>
                          {assignment.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Files</h4>
              <p className="text-sm text-gray-600 text-center mb-6 max-w-sm">
                Upload images, PDFs, or documents to attach to your message
              </p>
              <button
                onClick={handleFileUpload}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Choose Files
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Max file size: 10MB
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}