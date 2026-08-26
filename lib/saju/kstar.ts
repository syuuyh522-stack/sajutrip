// K-star 매칭 (F-2) — 각 스타의 사주를 자체 엔진으로 산출해 유저와 랭킹 매칭.
//  - soulmate(궁합): 오행 상생상극 점수 — 내 결핍을 채우고(보완) 상생 관계인 스타가 상위
//  - twin(같은 기운): 오행 분포 유사도 — 대표(과잉) 원소 일치 + 분포가 닮은 스타가 상위
// 점수는 §5.8 놀이 톤의 표시용 %(결정적) — 효험 주장 아님.
import type { Element, ElementDistribution } from '../../types/saju';
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
  /** 매칭 근거가 된 오행 (표시·색상용) — 스타의 대표(과잉) 원소 */
  element: Element;
  /** 표시용 궁합/유사도 % (55~99, 결정적) */
  pct: number;
}

export interface UserSaju {
  distribution: ElementDistribution;
  deficient: Element;
  excess: Element;
}

/** 상생(생하는 방향): 木→火→土→金→水→木 */
const SHENG: Record<Element, Element> = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
/** 상극(극하는 방향): 木→土, 土→水, 水→火, 火→金, 金→木 */
const KE: Record<Element, Element> = { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' };

const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

interface StarProfile { star: KStar; dist: ElementDistribution; excess: Element; deficient: Element }

// 스타 사주는 불변 — 모듈 레벨 1회 산출 캐시
const profileCache = new Map<string, StarProfile>();
function starProfile(star: KStar): StarProfile {
  const hit = profileCache.get(star.id);
  if (hit) return hit;
  const r = computeSajuLocal(star.birth.year, star.birth.month, star.birth.day);
  const p: StarProfile = { star, dist: r.distribution, excess: r.excess, deficient: r.deficient };
  profileCache.set(star.id, p);
  return p;
}

function total(dist: ElementDistribution): number {
  return ELEMENTS.reduce((s, el) => s + dist[el], 0);
}

/** 궁합 점수 — 보완(내 결핍 보유) 최우선 + 대표 원소 상생 가점 / 상극 감점 */
function soulScore(user: UserSaju, p: StarProfile): number {
  let sc = 0;
  sc += 40 * (p.dist[user.deficient] / total(p.dist)); // 내 결핍 원소를 스타가 얼마나 갖고 있나
  if (p.excess === user.deficient) sc += 25; // 스타의 대표 기운 = 내 결핍 (정면 보완)
  if (SHENG[p.excess] === user.excess) sc += 15; // 스타가 내 강점을 생함
  if (SHENG[user.excess] === p.excess) sc += 10; // 내가 스타를 생함 (상호 상생)
  if (KE[p.excess] === user.excess || KE[user.excess] === p.excess) sc -= 15; // 대표 기운 상극
  return sc;
}

/** 유사도 점수 — 분포 L1 거리(정규화) + 대표 원소·결핍 일치 가점 */
function twinScore(user: UserSaju, p: StarProfile): number {
  const uT = total(user.distribution);
  const sT = total(p.dist);
  const l1 = ELEMENTS.reduce((s, el) => s + Math.abs(user.distribution[el] / uT - p.dist[el] / sT), 0); // 0~2
  let sc = 50 * (1 - l1 / 2);
  if (p.excess === user.excess) sc += 30;
  if (p.deficient === user.deficient) sc += 10;
  return sc;
}

/** 점수 → 표시용 % (55~99 클램프, 결정적) */
function toPct(score: number, max: number): number {
  return Math.max(55, Math.min(99, Math.round(55 + (score / max) * 44)));
}

function rank(user: UserSaju, stars: readonly KStar[], kind: 'soul' | 'twin', n: number): KStarMatch[] {
  const scorer = kind === 'soul' ? soulScore : twinScore;
  const maxScore = kind === 'soul' ? 78 : 90; // 각 점수식의 이론상 상한 근사
  const ranked = stars
    .map((s) => starProfile(s))
    .map((p) => ({ p, score: scorer(user, p) }))
    .sort((a, b) => b.score - a.score || a.p.star.id.localeCompare(b.p.star.id)) // 동점은 id로 안정 정렬
    .slice(0, n)
    .map(({ p, score }) => ({ name: p.star.name, element: p.excess, pct: toPct(score, maxScore) }));
  // 표시 % 단조 감소 보정 — 분포가 정수 6/8칸이라 동점이 흔한데, 랭킹 UI에서 같은 %가 연속되면 순위감이 없다.
  // (놀이 콘텐츠 표시값 조정 — 순위 자체는 점수 기준 그대로)
  for (let i = 1; i < ranked.length; i++) {
    if (ranked[i].pct >= ranked[i - 1].pct) ranked[i].pct = Math.max(55, ranked[i - 1].pct - 1);
  }
  return ranked;
}

/** 궁합 랭킹 상위 n (1위 = 최고 궁합) */
export function rankSoulmates(user: UserSaju, stars: readonly KStar[], n = 11): KStarMatch[] {
  return rank(user, stars, 'soul', n);
}

/** 같은 기운 랭킹 상위 n */
export function rankTwins(user: UserSaju, stars: readonly KStar[], n = 11): KStarMatch[] {
  return rank(user, stars, 'twin', n);
}

/** 홈(결과) 노출용 1명 = 각 랭킹 1위 */
export function findSoulmate(user: UserSaju, stars: readonly KStar[]): KStarMatch | null {
  return rankSoulmates(user, stars, 1)[0] ?? null;
}
export function findTwin(user: UserSaju, stars: readonly KStar[]): KStarMatch | null {
  return rankTwins(user, stars, 1)[0] ?? null;
}
