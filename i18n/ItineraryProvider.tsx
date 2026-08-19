'use client';

// 일정 스토어 — localStorage 기반 (회원가입/Airtable 저장은 P1 이후). (PRD F-5)
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ItineraryItem, ItineraryState } from '../types/itinerary';

const STORAGE_KEY = 'sajutrip.itinerary';
const EMPTY: ItineraryState = { start: '', end: '', items: [] };

interface ItineraryContextValue {
  state: ItineraryState;
  dayCount: number;
  addItem: (item: Omit<ItineraryItem, 'day'>) => void;
  removeItem: (contentId: string) => void;
  setItemDay: (contentId: string, day: number) => void;
  setDates: (start: string, end: string) => void;
  hasItem: (contentId: string) => boolean;
}

const ItineraryContext = createContext<ItineraryContextValue | null>(null);

function computeDayCount(state: ItineraryState): number {
  if (state.start && state.end) {
    const ms = new Date(state.end).getTime() - new Date(state.start).getTime();
    if (Number.isFinite(ms) && ms >= 0) return Math.min(Math.floor(ms / 86_400_000) + 1, 14);
  }
  const maxItemDay = state.items.reduce((m, it) => Math.max(m, it.day), 1);
  return maxItemDay;
}

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ItineraryState>(EMPTY);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as ItineraryState);
    } catch {
      // 손상된 저장값은 무시
    }
  }, []);

  const persist = (next: ItineraryState) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 저장 실패는 무시 (프라이빗 모드 등)
    }
  };

  const value: ItineraryContextValue = {
    state,
    dayCount: computeDayCount(state),
    addItem: (item) => {
      if (state.items.some((it) => it.contentId === item.contentId)) return;
      persist({ ...state, items: [...state.items, { ...item, day: 1 }] });
    },
    removeItem: (contentId) => persist({ ...state, items: state.items.filter((it) => it.contentId !== contentId) }),
    setItemDay: (contentId, day) =>
      persist({ ...state, items: state.items.map((it) => (it.contentId === contentId ? { ...it, day } : it)) }),
    setDates: (start, end) => persist({ ...state, start, end }),
    hasItem: (contentId) => state.items.some((it) => it.contentId === contentId),
  };

  return <ItineraryContext.Provider value={value}>{children}</ItineraryContext.Provider>;
}

export function useItinerary(): ItineraryContextValue {
  const ctx = useContext(ItineraryContext);
  if (!ctx) throw new Error('useItinerary must be used within <ItineraryProvider>');
  return ctx;
}
