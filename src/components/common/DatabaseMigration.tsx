import { useEffect, useState } from 'react';
import { Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { initializeDB, db } from '@/lib/db';
import { useChatStore } from '@/stores/chat.store.dexie';
import { useNotebookStore } from '@/stores/notebook.store.dexie';
import { useAuthStore } from '@/stores/auth';

interface MigrationStatus {
  initialized: boolean;
  migrating: boolean;
  completed: boolean;
  error: string | null;
  stats: {
    messages: number;
    sessions: number;
    notebooks: number;
  };
}

export function DatabaseMigration({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<MigrationStatus>({
    initialized: false,
    migrating: false,
    completed: false,
    error: null,
    stats: { messages: 0, sessions: 0, notebooks: 0 }
  });
  
  const { user } = useAuthStore();
  const { setUserId: setChatUserId, migrateFromLocalStorage: migrateChatData } = useChatStore();
  const { setUserId: setNotebookUserId, migrateFromLocalStorage: migrateNotebookData } = useNotebookStore();

  useEffect(() => {
    async function init() {
      try {
        setStatus(prev => ({ ...prev, migrating: true }));
        
        // Initialize database
        await initializeDB();
        
        // Check if we need to migrate
        const hasLocalData = localStorage.getItem('skooledin-chat') || 
                           localStorage.getItem('skooledin-notebook') ||
                           localStorage.getItem('skooledin-context');
        
        if (hasLocalData && user) {
          // Set user IDs for the stores
          setChatUserId(user.id);
          setNotebookUserId(user.id);
          
          // Perform migrations
          await migrateChatData();
          await migrateNotebookData();
          
          // Get stats
          const messageCount = await db.chatMessages.where('userId').equals(user.id).count();
          const sessionCount = await db.chatSessions.where('userId').equals(user.id).count();
          const notebookCount = await db.notebooks.where('userId').equals(user.id).count();
          
          setStatus({
            initialized: true,
            migrating: false,
            completed: true,
            error: null,
            stats: {
              messages: messageCount,
              sessions: sessionCount,
              notebooks: notebookCount
            }
          });
        } else {
          // No migration needed
          if (user) {
            setChatUserId(user.id);
            setNotebookUserId(user.id);
          }
          setStatus(prev => ({
            ...prev,
            initialized: true,
            migrating: false,
            completed: true
          }));
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
        setStatus(prev => ({
          ...prev,
          initialized: true,
          migrating: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    }

    init();
  }, [user, setChatUserId, setNotebookUserId, migrateChatData, migrateNotebookData]);

  // Show migration status only if migrating or there's an error
  if (status.migrating) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">Upgrading Storage System</h2>
          <p className="text-gray-600 mb-4">This one-time process will improve performance...</p>
          <Loader className="w-6 h-6 animate-spin mx-auto text-purple-600" />
        </div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Storage Upgrade Failed</h2>
          <p className="text-gray-600 mb-4">
            Don't worry, your data is safe. You can continue using the app.
          </p>
          <p className="text-sm text-red-600 mb-4">{status.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show success briefly if we migrated data
  if (status.completed && status.stats.messages > 0 && !status.initialized) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Storage Upgraded Successfully!</h2>
          <p className="text-gray-600 mb-4">
            Migrated {status.stats.messages} messages, {status.stats.sessions} sessions
          </p>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}