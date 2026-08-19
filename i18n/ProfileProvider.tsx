'use client';

// 유저 프로필 + 찜 스토어 — POC는 localStorage (회원 인증은 Phase 2 Supabase). (PRD 회원가입 P1)
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Element } from '../types/saju';

export interface Birth {
  gender: string;
  year: string;
  month: string;
  day: string;
}
export interface Bookmark {
  contentId: string;
  name: string;
  region: string;
  element: Element | null;
}
interface ProfileState {
  birth: Birth | null;
  signedUp: boolean;
  nickname: string;
  bookmarks: Bookmark[];
}

const EMPTY: ProfileState = { birth: null, signedUp: false, nickname: '', bookmarks: [] };
const STORAGE_KEY = 'sajutrip.profile';

interface ProfileContextValue extends ProfileState {
  setBirth: (birth: Birth) => void;
  signUp: (nickname: string) => void;
  toggleBookmark: (b: Bookmark) => void;
  hasBookmark: (contentId: string) => boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProfileState>(EMPTY);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as Partial<ProfileState>) });
    } catch {
      /* 손상값 무시 */
    }
  }, []);

  const persist = (next: ProfileState) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* 저장 실패 무시 */
    }
  };

  const value: ProfileContextValue = {
    ...state,
    setBirth: (birth) => persist({ ...state, birth }),
    signUp: (nickname) => persist({ ...state, signedUp: true, nickname }),
    toggleBookmark: (b) => {
      const exists = state.bookmarks.some((x) => x.contentId === b.contentId);
      persist({ ...state, bookmarks: exists ? state.bookmarks.filter((x) => x.contentId !== b.contentId) : [...state.bookmarks, b] });
    },
    hasBookmark: (contentId) => state.bookmarks.some((x) => x.contentId === contentId),
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within <ProfileProvider>');
  return ctx;
}
