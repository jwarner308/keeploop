import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { PhotoItem, SessionHistoryEntry } from '../../types/models';

export type SessionState = {
  photos: PhotoItem[];
  currentIndex: number;
  keptIds: string[];
  deletedIds: string[];
  history: SessionHistoryEntry[];
  startedAt: number | null;
};

export type SessionContextValue = SessionState & {
  startSession: (photos: PhotoItem[]) => void;
  markKeep: () => void;
  markDelete: () => void;
  undo: () => void;
  unmarkDelete: (id: string) => void;
  resetSession: () => void;
};

const initialState: SessionState = {
  photos: [],
  currentIndex: 0,
  keptIds: [],
  deletedIds: [],
  history: [],
  startedAt: null,
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(initialState);

  const startSession = (photos: PhotoItem[]) => {
    setState({
      photos,
      currentIndex: 0,
      keptIds: [],
      deletedIds: [],
      history: [],
      startedAt: Date.now(),
    });
  };

  const markKeep = () => {
    setState((prev) => {
      if (prev.currentIndex >= prev.photos.length) {
        return prev;
      }
      const current = prev.photos[prev.currentIndex];
      const keptIds = new Set(prev.keptIds);
      keptIds.add(current.id);

      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        keptIds: Array.from(keptIds),
        deletedIds: prev.deletedIds.filter((id) => id !== current.id),
        history: [...prev.history, { id: current.id, action: 'keep' }],
      };
    });
  };

  const markDelete = () => {
    setState((prev) => {
      if (prev.currentIndex >= prev.photos.length) {
        return prev;
      }
      const current = prev.photos[prev.currentIndex];
      const deletedIds = new Set(prev.deletedIds);
      deletedIds.add(current.id);

      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        deletedIds: Array.from(deletedIds),
        keptIds: prev.keptIds.filter((id) => id !== current.id),
        history: [...prev.history, { id: current.id, action: 'delete' }],
      };
    });
  };

  const undo = () => {
    setState((prev) => {
      if (prev.history.length === 0 || prev.currentIndex === 0) {
        return prev;
      }
      const last = prev.history[prev.history.length - 1];
      const nextIndex = Math.max(prev.currentIndex - 1, 0);
      return {
        ...prev,
        currentIndex: nextIndex,
        keptIds:
          last.action === 'keep'
            ? prev.keptIds.filter((id) => id !== last.id)
            : prev.keptIds,
        deletedIds:
          last.action === 'delete'
            ? prev.deletedIds.filter((id) => id !== last.id)
            : prev.deletedIds,
        history: prev.history.slice(0, -1),
      };
    });
  };

  const unmarkDelete = (id: string) => {
    setState((prev) => {
      const deletedIds = prev.deletedIds.filter((itemId) => itemId !== id);
      const keptIds = new Set(prev.keptIds);
      keptIds.add(id);
      return {
        ...prev,
        deletedIds,
        keptIds: Array.from(keptIds),
      };
    });
  };

  const resetSession = () => {
    setState(initialState);
  };

  const value = useMemo<SessionContextValue>(
    () => ({
      ...state,
      startSession,
      markKeep,
      markDelete,
      undo,
      unmarkDelete,
      resetSession,
    }),
    [state]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
