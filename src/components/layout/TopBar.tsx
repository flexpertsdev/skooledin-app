import { Menu, Search, Bell } from 'lucide-react';
import { ContextSwitcher } from '../context/ContextSwitcher';
import { useAuthStore } from '@stores/auth';

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const user = useAuthStore(s => s.user);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg active:bg-gray-100 lg:hidden"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">SkooledIn</h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg active:bg-gray-100"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          
          <button
            className="p-2 rounded-lg active:bg-gray-100 relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </button>
          
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full ml-2"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-medium ml-2">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Context Switcher - below header on mobile */}
      <div className="px-4 py-2 border-t border-gray-100">
        <ContextSwitcher />
      </div>
    </header>
  );
}