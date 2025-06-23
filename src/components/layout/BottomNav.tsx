import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, BookOpen, Users } from 'lucide-react';
import { useAuthStore } from '@stores/auth';
import { UserRole } from '@types';

export function BottomNav() {
  const userRole = useAuthStore(s => s.user?.role);
  
  const navItems = [
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: MessageCircle, label: 'AI Chat', path: '/chat' },
    { icon: BookOpen, label: 'Notebook', path: '/notebook' },
    ...(userRole === UserRole.TEACHER ? [{ icon: Users, label: 'Manage', path: '/manage' }] : [])
  ];

  return (
    <nav className="pwa-bottom-nav">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 py-2 px-3 rounded-lg
              min-w-[64px] transition-colors select-none-mobile touch-manipulation
              ${isActive 
                ? 'text-brand-primary' 
                : 'text-gray-500 active:bg-gray-50'
              }
            `}
          >
            <Icon size={24} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}