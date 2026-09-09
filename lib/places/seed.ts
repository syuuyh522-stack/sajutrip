// 로컬 시드 장소 (TourAPI 웰니스관광정보 173곳, 오행 자동 태깅).
// ⚠️ TourAPI 실패/키 미설정 시의 폴백 소스. 오행 태그는 규칙 기반 1차값 → 실 서비스 전 curate 필요(§6.6).
//
// 속성(attribute)·행위(action) 레이어는 JSON에 박아두지 않고 로드 시 tagLayers로 산출한다.
// 실데이터 경로(wellness/general)와 같은 규칙을 쓰므로 두 경로의 매핑이 어긋나지 않는다.
import type { Element } from '../../types/saju';
import type { Place } from '../../types/place';
import { tagLayers } from '../tour-api/tag';
import seedJson from '../../data/wellness.seed.json';

// JSON은 optional 필드에 null을 담으므로 unknown 경유 캐스팅 (null은 오행 매칭에서 자연히 제외)
const RAW_SEED = seedJson as unknown as Place[];

/** 시드 + 속성·행위 레이어 (PRD F-2 3·4단계) */
export const SEED_PLACES: Place[] = RAW_SEED.map((p) => {
  const layers = tagLayers(p.name, p.category);
  return {
    ...p,
    attributeElement: layers.attribute,
    actionElement: layers.action,
    primaryElement: p.primaryElement ?? layers.primary,
  };
});

/** 타깃 오행 후보 풀 — primary뿐 아니라 속성·행위 레이어도 포함 (§5.4) */
export function seedByElement(element: Element): Place[] {
  return SEED_PLACES.filter(
    (p) => p.primaryElement === element || p.attributeElement === element || p.actionElement === element,
  );
}

export function seedById(contentId: string): Place | null {
  return SEED_PLACES.find((p) => p.contentId === contentId) ?? null;
}
