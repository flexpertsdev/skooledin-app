import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  noPadding?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  onClick, 
  interactive = false,
  noPadding = false 
}: CardProps) {
  const baseClasses = 'bg-white rounded-2xl shadow-sm border border-gray-100';
  const paddingClass = noPadding ? '' : 'p-4 md:p-6';
  const interactiveClasses = interactive || onClick ? 'card-interactive' : '';

  return (
    <div
      className={`${baseClasses} ${paddingClass} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}