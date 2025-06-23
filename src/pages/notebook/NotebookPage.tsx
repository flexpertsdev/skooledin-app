import { Search, Plus, FileText } from 'lucide-react';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';

const mockNotes = [
  {
    id: '1',
    title: 'Quadratic Formula',
    subject: 'Mathematics',
    content: 'The quadratic formula is x = (-b ± √(b² - 4ac)) / 2a',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    icon: '🔢',
    color: 'bg-subject-math'
  },
  {
    id: '2',
    title: 'Photosynthesis Process',
    subject: 'Science',
    content: 'Photosynthesis converts light energy into chemical energy...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    icon: '🔬',
    color: 'bg-subject-science'
  },
  {
    id: '3',
    title: 'The Great Gatsby Themes',
    subject: 'English',
    content: 'Major themes include the American Dream, social class...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    icon: '📖',
    color: 'bg-subject-language'
  }
];

export function NotebookPage() {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">My Notebook</h1>
          <Button size="sm">
            <Plus size={18} className="mr-1" />
            New Note
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockNotes.map(note => (
            <Card
              key={note.id}
              interactive
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 ${note.color} rounded-lg flex items-center justify-center text-white`}>
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{note.title}</h3>
                  <p className="text-xs text-gray-500">{note.subject}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {note.content}
              </p>
              
              <p className="text-xs text-gray-500">
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}