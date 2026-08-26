// K-star 매칭 (F-2). 각 스타의 사주를 오프라인 산출해 유저와 매칭.
//  - soulmate: 내 결핍 원소가 '강한(과잉)' 스타 → 부족한 기운을 채워주는 별
//  - twin: 나와 '같은 강한 기운(과잉 원소)'을 가진 스타 → 닮은 별
import type { Element } from '../../types/saju';
import { computeSajuLocal } from './local';

export interface KStar {
  id: string;
  name: string;
  birth: { year: number; month: number; day: number };
  gender: 'female' | 'male';
  image?: string;
}

export interface KStarMatch {
  name: string;
  /** 매칭 근거가 된 오행 (표시·색상용) */
  element: Element;
}

/** 스타의 과잉(대표) 오행 */
function starExcess(star: KStar): Element {
  return computeSajuLocal(star.birth.year, star.birth.month, star.birth.day).excess;
}

/** 후보 중 유저별 결정적 선택 — seed(생일 기반)로 같은 유저는 항상 같은 별, 유저마다는 다양하게 */
function pickBySeed(candidates: KStar[], seed: number): KStar | null {
  if (candidates.length === 0) return null;
  return candidates[Math.abs(seed) % candidates.length];
}

/** 내 결핍을 채워주는 별 (그 원소가 과잉인 스타) */
export function findSoulmate(userDeficient: Element, stars: readonly KStar[], seed = 0): KStarMatch | null {
  const s = pickBySeed(stars.filter((star) => starExcess(star) === userDeficient), seed);
  return s ? { name: s.name, element: userDeficient } : null;
}

/** 나와 같은 강한 기운을 가진 별 (과잉 원소 일치) */
export function findTwin(userExcess: Element, stars: readonly KStar[], seed = 0): KStarMatch | null {
  const s = pickBySeed(stars.filter((star) => starExcess(star) === userExcess), seed);
  return s ? { name: s.name, element: userExcess } : null;
}
