import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BaseUser, Context } from '@types';

interface AuthState {
  user: BaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentContext: Context;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<BaseUser>) => Promise<void>;
  setContext: (context: Context) => void;
}

// Default context
const defaultContext: Context = {
  id: 'all',
  type: 'all',
  name: 'All Subjects',
  icon: '📚'
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      currentContext: defaultContext,
      
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // Mock login - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: BaseUser = {
            id: '1',
            email,
            name: email.split('@')[0],
            role: email.includes('teacher') ? 'teacher' : 
                  email.includes('parent') ? 'parent' : 'student',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          set({ user: mockUser, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false,
          currentContext: defaultContext 
        });
      },
      
      updateProfile: async (data) => {
        const user = get().user;
        if (!user) return;
        
        // Mock update - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set({ user: { ...user, ...data } });
      },
      
      setContext: (context) => {
        set({ currentContext: context });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        currentContext: state.currentContext 
      })
    }
  )
);