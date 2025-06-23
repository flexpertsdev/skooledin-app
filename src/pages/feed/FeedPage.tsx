import { useState } from 'react';
import { useMediaQuery } from '@hooks/useMediaQuery';
import { FeedItem } from '@components/feed/FeedItem';
import { Button } from '@components/common/Button';
import { Plus, Filter } from 'lucide-react';
import { useAuthStore } from '@stores/auth';
import type { FeedItem as FeedItemType } from '@types';
import { FeedItemType as FeedType, UserRole } from '@types';

// Mock data
const mockFeedItems: FeedItemType[] = [
  {
    id: '1',
    type: FeedType.ASSIGNMENT,
    title: 'Quadratic Equations Practice',
    description: 'Complete problems 1-15 on page 142. Show all work.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    createdBy: { id: 't1', name: 'Ms. Johnson', email: 'teacher@demo.com', role: UserRole.TEACHER, createdAt: new Date(), updatedAt: new Date() },
    priority: 'high',
    read: false,
    context: { id: 'math', type: 'subject', name: 'Mathematics' },
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
    points: 100,
    attachments: [],
    submissions: [],
    subject: { id: 'math', name: 'Mathematics', code: 'MATH8', color: '#3b82f6', icon: '🔢' }
  } as any,
  {
    id: '2',
    type: FeedType.ANNOUNCEMENT,
    title: 'Science Fair Registration Open!',
    content: 'Registration for the annual science fair is now open. Submit your project ideas by Friday.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    createdBy: { id: 't2', name: 'Mr. Smith', email: 'teacher2@demo.com', role: UserRole.TEACHER, createdAt: new Date(), updatedAt: new Date() },
    priority: 'medium',
    read: true,
    context: { id: 'science', type: 'subject', name: 'Science' },
    important: true,
    targetAudience: [UserRole.STUDENT]
  } as any,
  {
    id: '3',
    type: FeedType.GRADE,
    title: 'English Essay - The Great Gatsby',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
    createdBy: { id: 't3', name: 'Ms. Davis', email: 'teacher3@demo.com', role: UserRole.TEACHER, createdAt: new Date(), updatedAt: new Date() },
    priority: 'low',
    read: true,
    context: { id: 'english', type: 'subject', name: 'English' },
    assignment: {} as any,
    student: {} as any,
    score: 88,
    feedback: 'Great analysis of the themes. Work on your conclusion.',
    gradedBy: { id: 't3', name: 'Ms. Davis', email: 'teacher3@demo.com', role: UserRole.TEACHER, createdAt: new Date(), updatedAt: new Date() } as any
  } as any
];

export function FeedPage() {
  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const [selectedItem, setSelectedItem] = useState<FeedItemType | null>(null);
  const [feedItems, setFeedItems] = useState(mockFeedItems);
  const userRole = useAuthStore(s => s.user?.role);

  const handleArchive = (id: string) => {
    setFeedItems(items => items.filter(item => item.id !== id));
  };

  const handleMarkRead = (id: string) => {
    setFeedItems(items => 
      items.map(item => 
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  if (isDesktop) {
    return (
      <div className="h-full flex">
        {/* List Panel */}
        <div className="w-96 border-r border-gray-200 overflow-y-auto bg-white">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Feed</h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {feedItems.map(item => (
              <div
                key={item.id}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedItem?.id === item.id ? 'bg-brand-light' : ''
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <FeedItem 
                  item={item} 
                  onArchive={() => handleArchive(item.id)}
                  onMarkRead={() => handleMarkRead(item.id)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Detail Panel */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedItem ? (
            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h1 className="text-2xl font-bold mb-4">{selectedItem.title}</h1>
                  <p className="text-gray-600">
                    {'description' in selectedItem && selectedItem.description ? String(selectedItem.description) : 
                     'content' in selectedItem && selectedItem.content ? String(selectedItem.content) : 
                     'Grade details would appear here'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select an item to view details
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile view
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Feed</h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Feed items */}
      <div className="divide-y divide-gray-100 bg-white">
        {feedItems.map(item => (
          <FeedItem 
            key={item.id}
            item={item} 
            onArchive={() => handleArchive(item.id)}
            onMarkRead={() => handleMarkRead(item.id)}
            onClick={() => {
              // Navigate to detail page on mobile
              console.log('Navigate to detail:', item.id);
            }}
          />
        ))}
      </div>

      {/* FAB for teachers */}
      {userRole === UserRole.TEACHER && (
        <div className="fixed bottom-20 right-4 pb-safe">
          <Button
            variant="primary"
            size="lg"
            className="rounded-full shadow-lg w-14 h-14 p-0"
          >
            <Plus size={24} />
          </Button>
        </div>
      )}
    </div>
  );
}