import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export function AppShell() {
  return (
    <div className="h-dvh flex bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <Sidebar className="hidden xl:block w-80 border-r border-gray-200 bg-white" />
      
      <div className="flex-1 flex flex-col">
        {/* Mobile Top Bar - Hidden on desktop */}
        <div className="xl:hidden">
          <TopBar />
        </div>
        
        {/* Main Content */}
        <main className="pwa-main flex-1 overflow-hidden">
          <Outlet />
        </main>
        
        {/* Mobile Bottom Navigation - Hidden on desktop */}
        <div className="xl:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}