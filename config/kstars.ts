// K-star 시드 데이터.
// ⚠️ PLACEHOLDER — 아래 생년월일은 매칭 엔진 검증용 샘플이며 실인물이 아니다.
//    서비스 전 실제 데이터로 curate 필요. 운영·확장은 Airtable(kstars 테이블) 권장:
//    필드 = name, birthYear/Month/Day, gender, image. (CLAUDE.md §6.6 데이터 파이프라인)
import type { KStar } from '../lib/saju/kstar';

export const KSTARS: readonly KStar[] = [
  { id: 's1', name: 'Star A', birth: { year: 1994, month: 9, day: 1 }, gender: 'female' },
  { id: 's2', name: 'Star B', birth: { year: 1997, month: 1, day: 12 }, gender: 'male' },
  { id: 's3', name: 'Star C', birth: { year: 1995, month: 6, day: 20 }, gender: 'female' },
  { id: 's4', name: 'Star D', birth: { year: 2000, month: 3, day: 15 }, gender: 'male' },
  { id: 's5', name: 'Star E', birth: { year: 1993, month: 11, day: 5 }, gender: 'female' },
  { id: 's6', name: 'Star F', birth: { year: 1998, month: 8, day: 27 }, gender: 'male' },
];
