import { motion, useAnimation } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface SwipeAction {
  label: string;
  color: string;
  icon?: ReactNode;
}

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  threshold?: number;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100
}: SwipeableCardProps) {
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const offset = info.offset.x;

    if (offset > threshold && onSwipeRight) {
      await controls.start({ x: '100%', opacity: 0 });
      onSwipeRight();
    } else if (offset < -threshold && onSwipeLeft) {
      await controls.start({ x: '-100%', opacity: 0 });
      onSwipeLeft();
    } else {
      controls.start({ x: 0, transition: { type: 'spring' } });
    }
    
    setIsDragging(false);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        {rightAction && (
          <div className={`flex-1 flex items-center px-6 ${rightAction.color}`}>
            <div className="text-white font-medium">
              {rightAction.icon}
              {rightAction.label}
            </div>
          </div>
        )}
        {leftAction && (
          <div className={`flex-1 flex items-center justify-end px-6 ${leftAction.color}`}>
            <div className="text-white font-medium">
              {leftAction.label}
              {leftAction.icon}
            </div>
          </div>
        )}
      </div>

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={controls}
        className={`relative bg-white ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {children}
      </motion.div>
    </div>
  );
}