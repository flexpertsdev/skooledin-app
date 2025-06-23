import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Context, Subject } from '@types';

interface ContextState {
  currentContext: Context;
  availableContexts: Context[];
  
  // Actions
  setContext: (context: Context) => void;
  addContext: (context: Context) => void;
  removeContext: (contextId: string) => void;
  updateContext: (contextId: string, updates: Partial<Context>) => void;
}

const defaultContext: Context = {
  id: 'all',
  type: 'all',
  name: 'All Subjects',
  icon: '📚',
  color: '#6B46C1'
};

export const useContextStore = create<ContextState>()(
  persist(
    (set, get) => ({
      currentContext: defaultContext,
      availableContexts: [defaultContext],
      
      setContext: (context) => {
        set({ currentContext: context });
      },
      
      addContext: (context) => {
        set(state => ({
          availableContexts: [...state.availableContexts, context]
        }));
      },
      
      removeContext: (contextId) => {
        set(state => ({
          availableContexts: state.availableContexts.filter(c => c.id !== contextId),
          currentContext: state.currentContext.id === contextId ? defaultContext : state.currentContext
        }));
      },
      
      updateContext: (contextId, updates) => {
        set(state => ({
          availableContexts: state.availableContexts.map(c =>
            c.id === contextId ? { ...c, ...updates } : c
          ),
          currentContext: state.currentContext.id === contextId 
            ? { ...state.currentContext, ...updates }
            : state.currentContext
        }));
      }
    }),
    {
      name: 'skooledin-context',
      partialize: (state) => ({
        currentContext: state.currentContext,
        availableContexts: state.availableContexts
      })
    }
  )
);