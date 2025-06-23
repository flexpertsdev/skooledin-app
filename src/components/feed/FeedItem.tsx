import { motion } from 'framer-motion';
import { ChevronRight, Clock, FileText, Megaphone, GraduationCap } from 'lucide-react';
import { SwipeableCard } from './SwipeableCard';
import type { FeedItem as FeedItemType } from '@types';
import { format } from 'date-fns';

interface FeedItemProps {
  item: FeedItemType;
  onArchive?: () => void;
  onMarkRead?: () => void;
  onClick?: () => void;
}

export function FeedItem({ item, onArchive, onMarkRead, onClick }: FeedItemProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'assignment_created':
      case 'assignment_due_soon':
        return <FileText size={24} className="text-white" />;
      case 'class_announcement':
        return <Megaphone size={24} className="text-white" />;
      case 'grade_posted':
        return <GraduationCap size={24} className="text-white" />;
      default:
        return <FileText size={24} className="text-white" />;
    }
  };

  const getIconBg = () => {
    switch (item.type) {
      case 'assignment_created':
      case 'assignment_due_soon':
        return 'bg-blue-500';
      case 'class_announcement':
        return 'bg-purple-600';
      case 'grade_posted':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBadges = () => {
    const badges = [];
    
    if (!item.isRead) {
      badges.push({ label: 'New', className: 'bg-blue-500' });
    }
    
    if (item.priority === 'high' || item.priority === 'urgent') {
      badges.push({ label: 'Urgent', className: 'bg-red-500' });
    }
    
    if (item.isPinned) {
      badges.push({ label: 'Pinned', className: 'bg-yellow-500' });
    }
    
    return badges;
  };

  const badges = getBadges();

  return (
    <SwipeableCard
      onSwipeLeft={onArchive}
      onSwipeRight={onMarkRead}
      leftAction={{ label: 'Archive', color: 'bg-gray-500' }}
      rightAction={{ label: 'Done', color: 'bg-success' }}
    >
      <motion.div
        className="bg-white px-4 py-3 flex items-center gap-3 active:bg-gray-50 cursor-pointer"
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
      >
        {/* Avatar/Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getIconBg()}`}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className={`font-semibold text-gray-900 truncate ${!item.isRead ? 'font-bold' : ''}`}>
              {item.title}
            </h3>
            <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0 ml-2">
              <Clock size={12} />
              {format(new Date(item.createdAt), 'h:mm a')}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 truncate">
            {item.description || `Updated ${item.type.replace(/_/g, ' ')}`}
          </p>
          
          {badges.length > 0 && (
            <div className="flex gap-2 mt-1">
              {badges.map((badge, index) => (
                <span 
                  key={index} 
                  className={`text-xs px-2 py-0.5 rounded-full text-white ${badge.className}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
      </motion.div>
    </SwipeableCard>
  );
}