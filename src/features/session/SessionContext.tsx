import React, { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react';
import { PhotoItem, SessionHistoryEntry } from '../../types/models';

export type SessionState = {
  photos: PhotoItem[];
  currentIndex: number;
  keptIds: string[];
  deletedIds: string[];
  history: SessionHistoryEntry[];
  startedAt: number | null;
  isActionLocked: boolean;
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
  isActionLocked: false,
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(initialState);
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionCooldownMs = 200;

  const lockActions = () => {
    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
    }
    actionTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, isActionLocked: false }));
    }, actionCooldownMs);
  };

  const startSession = (photos: PhotoItem[]) => {
    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
    }
    setState({
      photos,
      currentIndex: 0,
      keptIds: [],
      deletedIds: [],
      history: [],
      startedAt: Date.now(),
      isActionLocked: false,
    });
  };

  const markKeep = () => {
    if (state.isActionLocked || state.currentIndex >= state.photos.length) {
      return;
    }
    setState((prev) => {
      const current = prev.photos[prev.currentIndex];
      const keptIds = new Set(prev.keptIds);
      keptIds.add(current.id);

      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        keptIds: Array.from(keptIds),
        deletedIds: prev.deletedIds.filter((id) => id !== current.id),
        history: [...prev.history, { id: current.id, action: 'keep' }],
        isActionLocked: true,
      };
    });
    lockActions();
  };

  const markDelete = () => {
    if (state.isActionLocked || state.currentIndex >= state.photos.length) {
      return;
    }
    setState((prev) => {
      const current = prev.photos[prev.currentIndex];
      const deletedIds = new Set(prev.deletedIds);
      deletedIds.add(current.id);

      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        deletedIds: Array.from(deletedIds),
        keptIds: prev.keptIds.filter((id) => id !== current.id),
        history: [...prev.history, { id: current.id, action: 'delete' }],
        isActionLocked: true,
      };
    });
    lockActions();
  };

  const undo = () => {
    if (state.isActionLocked || state.history.length === 0 || state.currentIndex === 0) {
      return;
    }
    setState((prev) => {
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
        isActionLocked: true,
      };
    });
    lockActions();
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
    if (actionTimeoutRef.current) {
      clearTimeout(actionTimeoutRef.current);
    }
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
