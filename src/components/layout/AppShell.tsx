import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { useMediaQuery } from '@hooks/useMediaQuery';

export function AppShell() {
  const isDesktop = useMediaQuery('(min-width: 1280px)');

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      {isDesktop && (
        <Sidebar className="w-80 border-r border-gray-200 bg-white" />
      )}
      
      <div className="flex-1 flex flex-col">
        {/* Mobile Top Bar */}
        {!isDesktop && <TopBar />}
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
        
        {/* Mobile Bottom Navigation */}
        {!isDesktop && <BottomNav />}
      </div>
    </div>
  );
}