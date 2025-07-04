import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  BookOpen, 
  Star,
  StarOff,
  Archive,
  FileText,
  Hash,
  Sparkles,
  Calculator,
  Languages,
  Beaker,
  Clock,
  Upload,
  Camera
} from 'lucide-react';
import { useNotebookStore } from '@stores/notebook.store.dexie';
import { useContextStore } from '@stores/context.store';
import { Button } from '@components/common/Button';
import { CreateNotebookModal } from '@components/notebook/CreateNotebookModal';
import { EditNotebookModal } from '@components/notebook/EditNotebookModal';
import { StudyGuideModal } from '@components/notebook/StudyGuideModal';
import { PDFUploadModal } from '@components/notebook/PDFUploadModal';
import { PhotoUploadModal } from '@components/notebook/PhotoUploadModal';
import type { NotebookEntry } from '@types';
import { formatDistanceToNow } from 'date-fns';

export function NotebookPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showFolders] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<NotebookEntry | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStudyGuideModal, setShowStudyGuideModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  
  const { currentContext } = useContextStore();
  const {
    entries,
    searchEntries,  
    filterBySubject,
    updateEntry,
    getRecentEntries,
    setActiveEntry
  } = useNotebookStore();
  
  // Helper functions
  const toggleFavorite = async (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      await updateEntry(id, {
        metadata: { ...entry.metadata, isFavorite: !entry.metadata.isFavorite }
      });
    }
  };
  
  const archiveEntry = async (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      await updateEntry(id, {
        metadata: { ...entry.metadata, isArchived: true }
      });
    }
  };
  
  const getFavorites = () => entries.filter(e => e.metadata.isFavorite);
  
  // Filter entries based on current context
  useEffect(() => {
    if (currentContext.type === 'subject' && currentContext.metadata?.subjectId) {
      filterBySubject(currentContext.metadata.subjectId);
    } else {
      filterBySubject(null);
    }
  }, [currentContext, filterBySubject]);
  
  // Handle selected entry changes
  useEffect(() => {
    if (selectedEntry && !showEditModal) {
      setShowEditModal(true);
    }
  }, [selectedEntry]);
  
  // Handle search
  useEffect(() => {
    searchEntries(searchQuery);
  }, [searchQuery, searchEntries]);
  
  // Get filtered entries
  const displayEntries = entries.filter(entry => {
    if (!entry.metadata.isArchived) {
      if (selectedType === 'all') return true;
      if (selectedType === 'favorites') return entry.metadata.isFavorite;
      return entry.type === selectedType;
    }
    return false;
  });
  
  
  const getTypeIcon = (type: NotebookEntry['type']) => {
    const icons = {
      concept: <Sparkles className="w-4 h-4" />,
      formula: <Calculator className="w-4 h-4" />,
      vocabulary: <Languages className="w-4 h-4" />,
      summary: <FileText className="w-4 h-4" />,
      practice: <Beaker className="w-4 h-4" />,
      example: <BookOpen className="w-4 h-4" />,
      quiz: <Hash className="w-4 h-4" />,
      flashcard: <FileText className="w-4 h-4" />,
      outline: <FileText className="w-4 h-4" />,
      mindmap: <FileText className="w-4 h-4" />,
      checklist: <FileText className="w-4 h-4" />,
      reference: <FileText className="w-4 h-4" />
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };
  
  const getTypeColor = (type: NotebookEntry['type']) => {
    const colors = {
      concept: 'text-purple-600 bg-purple-100',
      formula: 'text-blue-600 bg-blue-100',
      vocabulary: 'text-orange-600 bg-orange-100',
      summary: 'text-green-600 bg-green-100',
      practice: 'text-red-600 bg-red-100',
      example: 'text-indigo-600 bg-indigo-100',
      quiz: 'text-pink-600 bg-pink-100',
      flashcard: 'text-yellow-600 bg-yellow-100',
      outline: 'text-gray-600 bg-gray-100',
      mindmap: 'text-teal-600 bg-teal-100',
      checklist: 'text-cyan-600 bg-cyan-100',
      reference: 'text-amber-600 bg-amber-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };
  
  const handleEntryClick = (entry: NotebookEntry) => {
    setSelectedEntry(entry);
    setActiveEntry(entry);
  };
  
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEntry(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900">My Notebook</h1>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowPhotoModal(true)}
            >
              <Camera className="w-4 h-4 mr-1" />
              Photo
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowPDFModal(true)}
            >
              <Upload className="w-4 h-4 mr-1" />
              PDF
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowStudyGuideModal(true)}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Study Guide
            </Button>
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Note
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
      
      {/* Type Filter */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedType === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Notes
          </button>
          <button
            onClick={() => setSelectedType('favorites')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedType === 'favorites'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Star className="w-3 h-3 inline mr-1" />
            Favorites
          </button>
          {['concept', 'formula', 'vocabulary', 'practice'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors capitalize ${
                selectedType === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Folders (Desktop) */}
        {showFolders && (
          <div className="hidden lg:block w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Folders
              </h3>
              
              {/* Quick Access */}
              <div className="space-y-1 mb-4">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Recent</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {getRecentEntries(5).length}
                  </span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Favorites</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {getFavorites().length}
                  </span>
                </button>
              </div>
              
              {/* Subject Folders - temporarily disabled */}
              <div className="space-y-1">
                {/* Will add folders back later */}
              </div>
            </div>
          </div>
        )}
        
        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4">
          {displayEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No notes found' : 'No notes yet'}
              </h3>
              <p className="text-gray-600 mb-4 max-w-sm">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Start saving important concepts from your AI chat sessions'}
              </p>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setShowCreateModal(true)}
              >
                Create First Note
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {displayEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleEntryClick(entry)}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(entry.type)}`}>
                        {getTypeIcon(entry.type)}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(entry.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          {entry.metadata.isFavorite ? (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveEntry(entry.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Archive className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {entry.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {entry.content}
                    </p>
                    
                    {/* Tags */}
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {entry.tags.length > 3 && (
                          <span className="px-2 py-1 text-gray-400 text-xs">
                            +{entry.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{entry.subjectId}</span>
                      <span>
                        {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {/* AI Generated Badge */}
                    {entry.metadata.isAIGenerated && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-purple-600">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Generated</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Stats (Mobile) */}
      <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{entries.length}</div>
            <div className="text-xs text-gray-500">Total Notes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{getFavorites().length}</div>
            <div className="text-xs text-gray-500">Favorites</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {entries.filter(e => e.metadata.isAIGenerated).length}
            </div>
            <div className="text-xs text-gray-500">AI Generated</div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <CreateNotebookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <EditNotebookModal
        isOpen={showEditModal}
        entry={selectedEntry}
        onClose={handleCloseEditModal}
      />
      
      <StudyGuideModal
        isOpen={showStudyGuideModal}
        onClose={() => setShowStudyGuideModal(false)}
      />
      
      <PDFUploadModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
      />
      
      <PhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </div>
  );
}