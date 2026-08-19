// 로컬 시드 장소 (TourAPI 웰니스관광정보 173곳, 오행 1차 자동 태깅).
// ⚠️ Airtable 세팅 전 임시 소스. 오행 태그는 규칙 기반 1차값 → 실 서비스 전 curate 필요(§6.6).
import type { Element } from '../../types/saju';
import type { Place } from '../../types/place';
import seedJson from '../../data/wellness.seed.json';

// JSON은 optional 필드에 null을 담으므로 unknown 경유 캐스팅 (null은 오행 매칭에서 자연히 제외)
export const SEED_PLACES = seedJson as unknown as Place[];

export function seedByElement(element: Element): Place[] {
  return SEED_PLACES.filter(
    (p) => p.primaryElement === element || p.attributeElement === element || p.actionElement === element,
  );
}

export function seedById(contentId: string): Place | null {
  return SEED_PLACES.find((p) => p.contentId === contentId) ?? null;
}
