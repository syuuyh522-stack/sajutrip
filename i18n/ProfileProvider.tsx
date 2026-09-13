'use client';

// 유저 프로필 스토어 — POC는 localStorage (회원 인증은 Phase 2 Supabase). (PRD 회원가입 P1)
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Element } from '../types/saju';

export interface Birth {
  /** 태어난 시각 0~23 (선택, 시주용) */
  hour?: string;
  gender: string;
  year: string;
  month: string;
  day: string;
}
/** 체크인으로 모은 엘리먼트 — 컨셉 "엘리먼트를 수집하는 여행"의 상태 */
export interface CollectedItem {
  contentId: string;
  element: Element;
}
interface ProfileState {
  birth: Birth | null;
  signedUp: boolean;
  nickname: string;
  collected: CollectedItem[];
}

const EMPTY: ProfileState = { birth: null, signedUp: false, nickname: '', collected: [] };
const STORAGE_KEY = 'sajutrip.profile';

interface ProfileContextValue extends ProfileState {
  setBirth: (birth: Birth) => void;
  signUp: (nickname: string) => void;
  /** 체크인 토글 — 해당 장소의 엘리먼트를 수집/회수 */
  toggleCollect: (contentId: string, element: Element | null) => void;
  isCollected: (contentId: string) => boolean;
  /** 원소별 수집 카운트 */
  collectedCount: (element: Element) => number;
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
    toggleCollect: (contentId, element) => {
      const exists = state.collected.some((c) => c.contentId === contentId);
      if (exists) {
        persist({ ...state, collected: state.collected.filter((c) => c.contentId !== contentId) });
      } else if (element) {
        persist({ ...state, collected: [...state.collected, { contentId, element }] });
      }
    },
    isCollected: (contentId) => state.collected.some((c) => c.contentId === contentId),
    collectedCount: (element) => state.collected.filter((c) => c.element === element).length,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within <ProfileProvider>');
  return ctx;
}
