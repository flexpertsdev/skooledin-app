import { useState } from 'react';
import { FeedItem } from '@components/feed/FeedItem';
import { Button } from '@components/common/Button';
import { Plus, Filter } from 'lucide-react';
import type { FeedItem as FeedItemType } from '@types';

// Mock data
const mockFeedItems: FeedItemType[] = [
  {
    id: '1',
    userId: 'current-user',
    type: 'assignment_created',
    title: 'Quadratic Equations Practice',
    description: 'Complete problems 1-15 on page 142. Show all work.',
    entityId: 'assignment-1',
    entityType: 'assignment',
    metadata: {
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      score: 0,
      maxScore: 100
    },
    isRead: false,
    isPinned: false,
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: '2',
    userId: 'current-user',
    type: 'class_announcement',
    title: 'Science Fair Registration Open!',
    description: 'Registration for the annual science fair is now open. Submit your project ideas by Friday.',
    entityId: 'announcement-1',
    entityType: 'announcement',
    metadata: {
      tags: ['science', 'fair', 'important']
    },
    isRead: true,
    isPinned: true,
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: '3',
    userId: 'current-user',
    type: 'grade_posted',
    title: 'English Essay - The Great Gatsby',
    description: 'Grade posted: 92/100',
    entityId: 'grade-1',
    entityType: 'grade',
    metadata: {
      score: 92,
      maxScore: 100
    },
    isRead: true,
    isPinned: false,
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
];

export function FeedPage() {
  const [feedItems, setFeedItems] = useState(mockFeedItems);
  const [filter, setFilter] = useState<'all' | 'unread' | 'pinned'>('all');

  const handleArchive = (id: string) => {
    setFeedItems(items => items.filter(item => item.id !== id));
  };

  const handleMarkRead = (id: string) => {
    setFeedItems(items => 
      items.map(item => 
        item.id === id ? { ...item, isRead: true } : item
      )
    );
  };

  const filteredItems = feedItems.filter(item => {
    if (filter === 'unread') return !item.isRead;
    if (filter === 'pinned') return item.isPinned;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Feed</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Filter size={20} />
            </Button>
            <Button variant="ghost" size="sm">
              <Plus size={20} />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mt-3">
          {(['all', 'unread', 'pinned'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-sm font-medium capitalize pb-2 border-b-2 transition-colors ${
                filter === tab 
                  ? 'text-purple-600 border-purple-600' 
                  : 'text-gray-500 border-transparent'
              }`}
            >
              {tab}
              {tab === 'unread' && (
                <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                  {feedItems.filter(i => !i.isRead).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Items */}
      <div className="flex-1 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg">No items to show</p>
            <p className="text-sm mt-2">Check back later for updates</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map(item => (
              <FeedItem
                key={item.id}
                item={item}
                onArchive={() => handleArchive(item.id)}
                onMarkRead={() => handleMarkRead(item.id)}
                onClick={() => console.log('Clicked:', item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}