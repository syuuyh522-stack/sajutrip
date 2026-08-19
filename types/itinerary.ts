// 일정(동선) 도메인 타입. (PRD F-5)
import type { Element } from './saju';

export interface ItineraryItem {
  contentId: string;
  name: string;
  region: string;
  element: Element | null;
  day: number; // 1-indexed 일차
}

export interface ItineraryState {
  start: string; // YYYY-MM-DD
  end: string;
  items: ItineraryItem[];
}
