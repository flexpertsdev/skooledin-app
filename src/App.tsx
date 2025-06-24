import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@stores/auth';
import { AppShell } from '@components/layout/AppShell';
import { DatabaseMigration } from '@components/common/DatabaseMigration';
import { LoginPage } from './pages/auth/LoginPage';
import { FeedPage } from './pages/feed/FeedPage';
import { ChatPage } from './pages/chat/ChatPage';
import { NotebookPage } from './pages/notebook/NotebookPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ManagePage } from './pages/manage/ManagePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DatabaseMigration>
        <BrowserRouter>
          <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/feed" replace />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="notebook" element={<NotebookPage />} />
            <Route path="manage" element={<ManagePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </BrowserRouter>
      </DatabaseMigration>
    </QueryClientProvider>
  );
}

export default App;
