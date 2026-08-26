'use client';

// 최근 검색어 localStorage 헬퍼 — 탐색(explore) 검색바·(레거시) /search 공용
const RECENT_KEY = 'sajutrip.recentSearches';

export function loadRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

/** 결과가 있었던 검색어만 기록 (최대 6, 중복 제거) */
export function saveRecent(query: string): string[] {
  const next = [query, ...loadRecent().filter((s) => s !== query)].slice(0, 6);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* 저장 실패 무시 */ }
  return next;
}
