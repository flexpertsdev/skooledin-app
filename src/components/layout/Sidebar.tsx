import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, BookOpen, Users, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@stores/auth';
import { UserRole } from '@types';
import { ContextSwitcher } from '../context/ContextSwitcher';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuthStore();
  
  const navItems = [
    { icon: Home, label: 'Class Feed', path: '/feed' },
    { icon: MessageCircle, label: 'AI Assistant', path: '/chat' },
    { icon: BookOpen, label: 'My Notebook', path: '/notebook' },
    ...(user?.role === UserRole.TEACHER ? [
      { icon: Users, label: 'Student Management', path: '/manage' }
    ] : []),
  ];

  return (
    <aside className={`flex flex-col ${className}`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-brand-primary">SkooledIn</h1>
        <p className="text-sm text-gray-600 mt-1">AI-Powered Education</p>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white text-lg font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{user?.name}</div>
            <div className="text-sm text-gray-600 capitalize">{user?.role}</div>
          </div>
        </div>

        {/* Context Switcher */}
        <ContextSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                ${isActive 
                  ? 'bg-brand-light text-brand-primary font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}